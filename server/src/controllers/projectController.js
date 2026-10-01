const db = require('../config/db');

class ProjectController {
  // Get all accessible projects
  static async getProjects(req, res, next) {
    try {
      const { status, priority, search } = req.query;
      let sql = `
        SELECT p.*, u.full_name as creator_name, t.name as team_name,
          (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
          (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'Completed') as completed_task_count
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN teams t ON p.team_id = t.id
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        sql += ` AND p.status = ?`;
        params.push(status);
      }

      if (priority) {
        sql += ` AND p.priority = ?`;
        params.push(priority);
      }

      if (search) {
        sql += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.key_code LIKE ?)`;
        const term = `%${search}%`;
        params.push(term, term, term);
      }

      sql += ` ORDER BY p.created_at DESC`;

      const projects = await db.query(sql, params);

      res.status(200).json({
        success: true,
        data: projects
      });
    } catch (err) {
      next(err);
    }
  }

  // Get project by ID
  static async getProjectById(req, res, next) {
    try {
      const { id } = req.params;

      const projects = await db.query(`
        SELECT p.*, u.full_name as creator_name, t.name as team_name
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN teams t ON p.team_id = t.id
        WHERE p.id = ?
      `, [id]);

      if (!projects || projects.length === 0) {
        return res.status(404).json({ success: false, error: 'Project not found.' });
      }

      const project = projects[0];

      // Fetch project members
      const members = await db.query(`
        SELECT pm.*, u.full_name, u.email, u.avatar_url, u.job_title, u.role as global_role
        FROM project_members pm
        JOIN users u ON pm.user_id = u.id
        WHERE pm.project_id = ?
      `, [id]);

      project.members = members || [];

      res.status(200).json({
        success: true,
        data: project
      });
    } catch (err) {
      next(err);
    }
  }

  // Create project
  static async createProject(req, res, next) {
    try {
      const { name, key_code, description, status, priority, start_date, end_date, team_id, budget } = req.body;
      const created_by = req.user.id;

      if (!name || !key_code) {
        return res.status(400).json({ success: false, error: 'Project name and unique key code are required.' });
      }

      const existingKey = await db.query('SELECT id FROM projects WHERE key_code = ?', [key_code.toUpperCase().trim()]);
      if (existingKey && existingKey.length > 0) {
        return res.status(400).json({ success: false, error: `Project key code '${key_code.toUpperCase()}' is already taken.` });
      }

      const result = await db.query(`
        INSERT INTO projects (name, key_code, description, status, priority, start_date, end_date, created_by, team_id, budget)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        name.trim(),
        key_code.toUpperCase().trim(),
        description || '',
        status || 'Planning',
        priority || 'Medium',
        start_date || null,
        end_date || null,
        created_by,
        team_id || null,
        budget || 0.00
      ]);

      const projectId = result.insertId;

      // Add creator as Project Lead
      await db.query(`
        INSERT INTO project_members (project_id, user_id, project_role)
        VALUES (?, ?, 'Lead')
      `, [projectId, created_by]);

      res.status(201).json({
        success: true,
        message: 'Project created successfully.',
        data: { id: projectId, name, key_code: key_code.toUpperCase() }
      });
    } catch (err) {
      next(err);
    }
  }

  // Update project
  static async updateProject(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, status, priority, start_date, end_date, team_id, budget } = req.body;

      const existing = await db.query('SELECT id FROM projects WHERE id = ?', [id]);
      if (!existing || existing.length === 0) {
        return res.status(404).json({ success: false, error: 'Project not found.' });
      }

      await db.query(`
        UPDATE projects
        SET name = ?, description = ?, status = ?, priority = ?, start_date = ?, end_date = ?, team_id = ?, budget = ?
        WHERE id = ?
      `, [name, description, status, priority, start_date, end_date, team_id || null, budget || 0.00, id]);

      res.status(200).json({
        success: true,
        message: 'Project updated successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  // Delete project
  static async deleteProject(req, res, next) {
    try {
      const { id } = req.params;
      await db.query('DELETE FROM projects WHERE id = ?', [id]);
      res.status(200).json({
        success: true,
        message: 'Project deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  // Add Member to Project
  static async addMember(req, res, next) {
    try {
      const { id } = req.params;
      const { userId, project_role = 'Contributor' } = req.body;

      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required.' });
      }

      await db.query(`
        INSERT INTO project_members (project_id, user_id, project_role)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE project_role = VALUES(project_role)
      `, [id, userId, project_role]);

      res.status(200).json({
        success: true,
        message: 'Project member added/updated successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ProjectController;
