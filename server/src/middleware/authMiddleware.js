const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const db = require('../config/db');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Fetch latest user details from DB to ensure user is active
    const users = await db.query(
      'SELECT id, full_name, email, role, job_title, department, avatar_url, status FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. User account no longer exists.'
      });
    }

    const user = users[0];
    if (user.status !== 'Active') {
      return res.status(403).json({
        success: false,
        error: 'Your user account is inactive or suspended.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Authentication token expired. Please log in again.'
      });
    }
    return res.status(403).json({
      success: false,
      error: 'Invalid or corrupted authentication token.'
    });
  }
}

module.exports = authenticateToken;
