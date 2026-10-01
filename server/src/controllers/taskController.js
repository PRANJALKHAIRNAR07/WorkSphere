const db = require('../config/db');

class TaskController {
  // Get all tasks with filters
  static async getTasks(req, res, next) {
    try {
      const { projectId, status, priority, assignedTo, search } = req.query;

      let sql = `
        SELECT t.*,
          u.full_name as assignee_name, u.avatar_url as assignee_avatar, u.email as assignee_email,
          cb.full_name as creator_name,
          p.name as project_name, p.key_code as project_key
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN users cb ON t.created_by = cb.id
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE 1=1
      `;
      const params = [];

      if (projectId) {
        sql += ` AND t.project_id = ?`;
        params.push(projectId);
      }
      if (status) {
        sql += ` AND t.status = ?`;
        params.push(status);
      }
      if (priority) {
        sql += ` AND t.priority = ?`;
        params.push(priority);
      }
      if (assignedTo) {
        sql += ` AND t.assigned_to = ?`;
        params.push(assignedTo);
      }
      if (search) {
        sql += ` AND (t.title LIKE ? OR t.description LIKE ? OR t.task_key LIKE ?)`;
        const term = `%${search}%`;
        params.push(term, term, term);
      }

      sql += ` ORDER BY t.position ASC, t.created_at DESC`;

      const tasks = await db.query(sql, params);

      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (err) {
      next(err);
    }
  }

  // Get task by ID with comments & attachments
  static async getTaskById(req, res, next) {
    try {
      const { id } = req.params;

      const tasks = await db.query(`
        SELECT t.*,
          u.full_name as assignee_name, u.avatar_url as assignee_avatar, u.job_title as assignee_title,
          cb.full_name as creator_name,
          p.name as project_name, p.key_code as project_key
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN users cb ON t.created_by = cb.id
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.id = ?
      `, [id]);

      if (!tasks || tasks.length === 0) {
        return res.status(404).json({ success: false, error: 'Task not found.' });
      }

      const task = tasks[0];

      // Fetch comments
      const comments = await db.query(`
        SELECT c.*, u.full_name as user_name, u.avatar_url as user_avatar
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.task_id = ?
        ORDER BY c.created_at ASC
      `, [id]);

      // Fetch attachments
      const attachments = await db.query(`
        SELECT a.*, u.full_name as uploader_name
        FROM attachments a
        JOIN users u ON a.user_id = u.id
        WHERE a.task_id = ?
        ORDER BY a.created_at DESC
      `, [id]);

      task.comments = comments || [];
      task.attachments = attachments || [];

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (err) {
      next(err);
    }
  }

  // Create Task
  static async createTask(req, res, next) {
    try {
      const { title, description, project_id, assigned_to, status, priority, due_date, estimated_hours } = req.body;
      const created_by = req.user.id;
      const projId = project_id || req.body.projectId;
      const assignedTo = assigned_to || req.body.assignedTo;

      if (!title || !projId) {
        return res.status(400).json({ success: false, error: 'Task title and project ID are required.' });
      }

      // Fetch project key code to format task_key e.g., WS2-10
      const projects = await db.query('SELECT key_code FROM projects WHERE id = ?', [projId]);
      const keyPrefix = (projects && projects.length > 0) ? projects[0].key_code : 'TASK';

      const countRes = await db.query('SELECT COUNT(*) as total FROM tasks WHERE project_id = ?', [projId]);
      const rawCount = (countRes && countRes[0]) ? (countRes[0].total ?? countRes[0]['COUNT(*)'] ?? countRes.length) : 0;
      const nextNum = (parseInt(rawCount) || 0) + 1;
      const task_key = `${keyPrefix}-${nextNum}`;

      const result = await db.query(`
        INSERT INTO tasks (task_key, title, description, project_id, assigned_to, created_by, status, priority, due_date, estimated_hours, position)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        task_key,
        title.trim(),
        description || '',
        projId,
        assignedTo || null,
        created_by,
        status || 'To Do',
        priority || 'Medium',
        due_date || null,
        estimated_hours || 0.00,
        nextNum
      ]);

      const taskId = result.insertId;

      // Create notification if assigned
      if (assigned_to && assigned_to !== created_by) {
        await db.query(`
          INSERT INTO notifications (user_id, title, message, type, link)
          VALUES (?, ?, ?, 'task_assigned', ?)
        `, [
          assigned_to,
          'New Task Assigned',
          `You were assigned to task "${title}" (${task_key})`,
          `/projects/${project_id}?task=${taskId}`
        ]);
      }

      res.status(201).json({
        success: true,
        message: 'Task created successfully.',
        data: { id: taskId, task_key, title, status: status || 'To Do' }
      });
    } catch (err) {
      next(err);
    }
  }

  // Update Task Details
  static async updateTask(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, status, priority, assigned_to, due_date, estimated_hours, actual_hours } = req.body;

      const tasks = await db.query('SELECT id, status, assigned_to, title, project_id FROM tasks WHERE id = ?', [id]);
      if (!tasks || tasks.length === 0) {
        return res.status(404).json({ success: false, error: 'Task not found.' });
      }

      const prevTask = tasks[0];

      await db.query(`
        UPDATE tasks
        SET title = ?, description = ?, status = ?, priority = ?, assigned_to = ?, due_date = ?, estimated_hours = ?, actual_hours = ?
        WHERE id = ?
      `, [title, description, status, priority, assigned_to || null, due_date || null, estimated_hours || 0.00, actual_hours || 0.00, id]);

      // Notify if status changed or reassigned
      if (assigned_to && assigned_to !== req.user.id && assigned_to !== prevTask.assigned_to) {
        await db.query(`
          INSERT INTO notifications (user_id, title, message, type, link)
          VALUES (?, ?, ?, 'task_assigned', ?)
        `, [
          assigned_to,
          'Task Reassigned',
          `Task "${title}" was assigned to you by ${req.user.full_name}`,
          `/projects/${prevTask.project_id}?task=${id}`
        ]);
      }

      res.status(200).json({
        success: true,
        message: 'Task updated successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  // Reorder / Move Kanban Task
  static async reorderTask(req, res, next) {
    try {
      const { id } = req.params;
      const { status, position } = req.body;

      await db.query(`
        UPDATE tasks
        SET status = ?, position = ?
        WHERE id = ?
      `, [status, position || 0, id]);

      res.status(200).json({
        success: true,
        message: 'Task status/position updated successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  // Delete Task
  static async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      await db.query('DELETE FROM tasks WHERE id = ?', [id]);
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TaskController;
