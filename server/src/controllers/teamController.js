const db = require('../config/db');

class TeamController {
  static async getTeams(req, res, next) {
    try {
      const teams = await db.query(`
        SELECT t.*, u.full_name as creator_name,
          (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count,
          (SELECT COUNT(*) FROM projects WHERE team_id = t.id) as project_count
        FROM teams t
        LEFT JOIN users u ON t.created_by = u.id
        ORDER BY t.created_at DESC
      `);

      res.status(200).json({
        success: true,
        data: teams
      });
    } catch (err) {
      next(err);
    }
  }

  static async getTeamById(req, res, next) {
    try {
      const { id } = req.params;
      const teams = await db.query(`
        SELECT t.*, u.full_name as creator_name
        FROM teams t
        LEFT JOIN users u ON t.created_by = u.id
        WHERE t.id = ?
      `, [id]);

      if (!teams || teams.length === 0) {
        return res.status(404).json({ success: false, error: 'Team not found.' });
      }

      const team = teams[0];
      const members = await db.query(`
        SELECT tm.*, u.full_name, u.email, u.avatar_url, u.job_title, u.department
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        WHERE tm.team_id = ?
      `, [id]);

      team.members = members || [];

      res.status(200).json({
        success: true,
        data: team
      });
    } catch (err) {
      next(err);
    }
  }

  static async createTeam(req, res, next) {
    try {
      const { name, description } = req.body;
      const created_by = req.user.id;

      if (!name) {
        return res.status(400).json({ success: false, error: 'Team name is required.' });
      }

      const result = await db.query(
        'INSERT INTO teams (name, description, created_by) VALUES (?, ?, ?)',
        [name.trim(), description || '', created_by]
      );

      const teamId = result.insertId;

      // Add creator as Owner
      await db.query(
        'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
        [teamId, created_by, 'Owner']
      );

      res.status(201).json({
        success: true,
        message: 'Team created successfully.',
        data: { id: teamId, name }
      });
    } catch (err) {
      next(err);
    }
  }

  static async addMember(req, res, next) {
    try {
      const { id } = req.params;
      const { userId, role = 'Member' } = req.body;

      await db.query(`
        INSERT INTO team_members (team_id, user_id, role)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE role = VALUES(role)
      `, [id, userId, role]);

      res.status(200).json({
        success: true,
        message: 'Team member added successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TeamController;
