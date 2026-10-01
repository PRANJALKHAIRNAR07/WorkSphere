const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const jwtConfig = require('../config/jwt');

class AuthService {
  // Generate JWT token helper
  static generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );
  }

  // User Registration
  static async register({ fullName, email, password, role = 'Member', jobTitle = '', department = '' }) {
    if (!fullName || !email || !password) {
      throw new Error('Full name, email, and password are required.');
    }

    const existingUsers = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUsers && existingUsers.length > 0) {
      const err = new Error('An account with this email address already exists.');
      err.statusCode = 400;
      throw err;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await db.query(
      'INSERT INTO users (full_name, email, password_hash, role, job_title, department) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName.trim(), email.toLowerCase().trim(), passwordHash, role, jobTitle, department]
    );

    const userId = result.insertId;

    const newUsers = await db.query('SELECT id, full_name, email, role, job_title, department, avatar_url, created_at FROM users WHERE id = ?', [userId]);
    const user = newUsers[0] || { id: userId, full_name: fullName, email, role, job_title: jobTitle, department };

    const token = this.generateToken(user);

    return { user, token };
  }

  // User Login
  static async login({ email, password }) {
    if (!email || !password) {
      const err = new Error('Email address and password are required.');
      err.statusCode = 400;
      throw err;
    }

    const users = await db.query(
      'SELECT id, full_name, email, password_hash, role, job_title, department, avatar_url, bio, status FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!users || users.length === 0) {
      const err = new Error('Invalid email address or password.');
      err.statusCode = 401;
      throw err;
    }

    const user = users[0];

    if (!user || !user.password_hash) {
      const err = new Error('Invalid email address or password.');
      err.statusCode = 401;
      throw err;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      const err = new Error('Invalid email address or password.');
      err.statusCode = 401;
      throw err;
    }

    if (user.status !== 'Active') {
      const err = new Error('Your user account has been deactivated or suspended.');
      err.statusCode = 403;
      throw err;
    }

    delete user.password_hash;
    const token = this.generateToken(user);

    return { user, token };
  }

  // Forgot Password Token Generator
  static async requestPasswordReset(email) {
    const users = await db.query('SELECT id, full_name FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!users || users.length === 0) {
      // Don't disclose non-existent email for security, return mock success message
      return { message: 'If an account with that email exists, password reset instructions have been dispatched.' };
    }

    const user = users[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiry

    await db.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, resetToken, expiresAt]
    );

    return {
      message: 'Password reset token generated successfully.',
      resetToken // Returned for development/demo purposes
    };
  }

  // Reset Password
  static async resetPassword(token, newPassword) {
    if (!token || !newPassword) {
      const err = new Error('Reset token and new password are required.');
      err.statusCode = 400;
      throw err;
    }

    const resets = await db.query(
      'SELECT id, user_id, expires_at, used FROM password_resets WHERE token = ? AND used = 0',
      [token]
    );

    if (!resets || resets.length === 0) {
      const err = new Error('Invalid or expired password reset token.');
      err.statusCode = 400;
      throw err;
    }

    const resetRecord = resets[0];
    if (new Date(resetRecord.expires_at) < new Date()) {
      const err = new Error('Password reset token has expired.');
      err.statusCode = 400;
      throw err;
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, resetRecord.user_id]);
    await db.query('UPDATE password_resets SET used = 1 WHERE id = ?', [resetRecord.id]);

    return { message: 'Password has been successfully updated. You may now log in.' };
  }
}

module.exports = AuthService;
