const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common document and image types
  const allowedExtensions = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|csv/;
  const extName = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  
  if (extName) {
    return cb(null, true);
  }
  cb(new Error('Invalid file format. Allowed types: PDF, DOCX, XLSX, Images, ZIP, CSV, TXT'));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter
});

module.exports = upload;
