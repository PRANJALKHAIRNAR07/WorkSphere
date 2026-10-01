const db = require('../config/db');

class NotificationController {
  static async getNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const notifications = await db.query(`
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `, [userId]);

      res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await db.query(`
        UPDATE notifications
        SET is_read = 1
        WHERE id = ? AND user_id = ?
      `, [id, userId]);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read.'
      });
    } catch (err) {
      next(err);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      await db.query(`
        UPDATE notifications
        SET is_read = 1
        WHERE user_id = ?
      `, [userId]);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = NotificationController;
