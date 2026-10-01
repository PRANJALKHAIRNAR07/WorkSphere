const db = require('../config/db');
const bcrypt = require('bcryptjs');

class UserController {
  static async getProfile(req, res, next) {
    try {
      const users = await db.query(
        'SELECT id, full_name, email, role, job_title, department, avatar_url, bio, status, created_at FROM users WHERE id = ?',
        [req.user.id]
      );

      if (!users || users.length === 0) {
        return res.status(404).json({ success: false, error: 'User profile not found.' });
      }

      res.status(200).json({
        success: true,
        data: users[0]
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { fullName, jobTitle, department, bio } = req.body;
      const userId = req.user.id;

      await db.query(
        'UPDATE users SET full_name = ?, job_title = ?, department = ?, bio = ? WHERE id = ?',
        [fullName || req.user.full_name, jobTitle || '', department || '', bio || '', userId]
      );

      const updatedUsers = await db.query(
        'SELECT id, full_name, email, role, job_title, department, avatar_url, bio, status FROM users WHERE id = ?',
        [userId]
      );

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updatedUsers[0]
      });
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, error: 'Current password and new password are required.' });
      }

      const users = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
      if (!users || users.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }

      const user = users[0];
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ success: false, error: 'Current password is incorrect.' });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, userId]);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAllUsers(req, res, next) {
    try {
      const users = await db.query(
        'SELECT id, full_name, email, role, job_title, department, avatar_url, status FROM users ORDER BY full_name ASC'
      );

      res.status(200).json({
        success: true,
        data: users
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;
