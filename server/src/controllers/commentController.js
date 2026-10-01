const db = require('../config/db');

class CommentController {
  static async getComments(req, res, next) {
    try {
      const { taskId } = req.params;
      const comments = await db.query(`
        SELECT c.*, u.full_name as user_name, u.avatar_url as user_avatar, u.job_title as user_title
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.task_id = ?
        ORDER BY c.created_at ASC
      `, [taskId]);

      res.status(200).json({
        success: true,
        data: comments
      });
    } catch (err) {
      next(err);
    }
  }

  static async addComment(req, res, next) {
    try {
      const { taskId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, error: 'Comment content cannot be empty.' });
      }

      const result = await db.query(`
        INSERT INTO comments (task_id, user_id, content)
        VALUES (?, ?, ?)
      `, [taskId, userId, content.trim()]);

      const commentId = result.insertId;

      res.status(201).json({
        success: true,
        message: 'Comment added successfully.',
        data: {
          id: commentId,
          task_id: parseInt(taskId),
          user_id: userId,
          user_name: req.user.full_name,
          user_avatar: req.user.avatar_url,
          content: content.trim(),
          created_at: new Date()
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CommentController;
