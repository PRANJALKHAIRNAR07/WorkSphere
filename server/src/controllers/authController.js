const AuthService = require('../services/authService');

class AuthController {
  static async register(req, res, next) {
    try {
      const { fullName, email, password, role, jobTitle, department } = req.body;
      const result = await AuthService.register({ fullName, email, password, role, jobTitle, department });
      
      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      
      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  static async getCurrentUser(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await AuthService.requestPasswordReset(email);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const result = await AuthService.resetPassword(token, newPassword);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
