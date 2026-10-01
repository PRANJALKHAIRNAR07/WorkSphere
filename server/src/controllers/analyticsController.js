const db = require('../config/db');

class AnalyticsController {
  static async getDashboardMetrics(req, res, next) {
    try {
      const projects = await db.query('SELECT id, status FROM projects');
      const tasks = await db.query('SELECT id, status, priority, due_date, estimated_hours, actual_hours FROM tasks');
      const users = await db.query('SELECT id FROM users WHERE status = "Active"');

      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Planning').length;
      
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'Completed').length;
      const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
      const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Completed').length;

      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const totalEstHours = tasks.reduce((sum, t) => sum + parseFloat(t.estimated_hours || 0), 0);
      const totalActualHours = tasks.reduce((sum, t) => sum + parseFloat(t.actual_hours || 0), 0);

      res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalProjects,
            activeProjects,
            totalTasks,
            completedTasks,
            inProgressTasks,
            overdueTasks,
            completionRate,
            activeTeamMembers: users.length,
            totalEstHours: totalEstHours.toFixed(1),
            totalActualHours: totalActualHours.toFixed(1)
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getChartDatasets(req, res, next) {
    try {
      const tasks = await db.query('SELECT status, priority, created_at FROM tasks');
      const projects = await db.query('SELECT status FROM projects');

      // Status breakdown
      const statusCounts = {
        'Backlog': 0,
        'To Do': 0,
        'In Progress': 0,
        'In Review': 0,
        'Completed': 0
      };

      tasks.forEach(t => {
        if (statusCounts[t.status] !== undefined) {
          statusCounts[t.status]++;
        }
      });

      // Priority breakdown
      const priorityCounts = {
        'Low': 0,
        'Medium': 0,
        'High': 0,
        'Urgent': 0
      };

      tasks.forEach(t => {
        if (priorityCounts[t.priority] !== undefined) {
          priorityCounts[t.priority]++;
        }
      });

      // Project breakdown
      const projectStatusCounts = {
        'Planning': 0,
        'In Progress': 0,
        'On Hold': 0,
        'Completed': 0
      };

      projects.forEach(p => {
        if (projectStatusCounts[p.status] !== undefined) {
          projectStatusCounts[p.status]++;
        }
      });

      res.status(200).json({
        success: true,
        data: {
          taskStatusChart: {
            labels: Object.keys(statusCounts),
            datasets: [{ label: 'Tasks', data: Object.values(statusCounts) }]
          },
          taskPriorityChart: {
            labels: Object.keys(priorityCounts),
            datasets: [{ label: 'Priority Distribution', data: Object.values(priorityCounts) }]
          },
          projectStatusChart: {
            labels: Object.keys(projectStatusCounts),
            datasets: [{ label: 'Projects', data: Object.values(projectStatusCounts) }]
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async exportCSVReport(req, res, next) {
    try {
      const tasks = await db.query(`
        SELECT t.task_key, t.title, p.name as project_name, u.full_name as assignee,
               t.status, t.priority, t.due_date, t.estimated_hours, t.actual_hours, t.created_at
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN users u ON t.assigned_to = u.id
        ORDER BY t.created_at DESC
      `);

      let csv = 'Task Key,Title,Project,Assignee,Status,Priority,Due Date,Est Hours,Actual Hours,Created Date\n';

      tasks.forEach(t => {
        const dueDate = t.due_date ? new Date(t.due_date).toISOString().split('T')[0] : 'N/A';
        const createdDate = t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : 'N/A';
        const safeTitle = `"${(t.title || '').replace(/"/g, '""')}"`;
        const safeProject = `"${(t.project_name || '').replace(/"/g, '""')}"`;
        const safeAssignee = `"${(t.assignee || 'Unassigned').replace(/"/g, '""')}"`;

        csv += `${t.task_key},${safeTitle},${safeProject},${safeAssignee},${t.status},${t.priority},${dueDate},${t.estimated_hours},${t.actual_hours},${createdDate}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="WorkSphere_Report_${Date.now()}.csv"`);
      res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AnalyticsController;
