const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');
const { validateRegistration, validateLogin } = require('../middleware/validateMiddleware');

router.post('/register', validateRegistration, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.get('/me', authenticateToken, AuthController.getCurrentUser);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;
