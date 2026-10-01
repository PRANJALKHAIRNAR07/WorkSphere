const db = require('../config/db');
const path = require('path');
const fs = require('fs');

class AttachmentController {
  static async uploadAttachment(req, res, next) {
    try {
      const { taskId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, error: 'No file uploaded.' });
      }

      const userId = req.user.id;
      const fileName = file.originalname;
      const filePath = `/uploads/${file.filename}`;
      const fileSize = file.size;
      const fileType = file.mimetype;

      const result = await db.query(`
        INSERT INTO attachments (task_id, user_id, file_name, file_path, file_size, file_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [taskId, userId, fileName, filePath, fileSize, fileType]);

      res.status(201).json({
        success: true,
        message: 'File attachment uploaded successfully.',
        data: {
          id: result.insertId,
          task_id: parseInt(taskId),
          file_name: fileName,
          file_path: filePath,
          file_size: fileSize,
          file_type: fileType,
          uploader_name: req.user.full_name,
          created_at: new Date()
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async downloadAttachment(req, res, next) {
    try {
      const { id } = req.params;
      const attachments = await db.query('SELECT * FROM attachments WHERE id = ?', [id]);

      if (!attachments || attachments.length === 0) {
        return res.status(404).json({ success: false, error: 'Attachment file not found.' });
      }

      const attachment = attachments[0];
      const fullPath = path.join(__dirname, '../../', attachment.file_path);

      if (fs.existsSync(fullPath)) {
        return res.download(fullPath, attachment.file_name);
      } else {
        return res.status(404).json({ success: false, error: 'File resource missing on server filesystem.' });
      }
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AttachmentController;
