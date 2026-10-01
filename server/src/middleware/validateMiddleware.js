function validateRegistration(req, res, next) {
  const { fullName, email, password } = req.body;

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Full name is required and must be at least 2 characters.'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      error: 'A valid email address is required.'
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password is required and must be at least 6 characters long.'
    });
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email address and password are required.'
    });
  }

  next();
}

module.exports = {
  validateRegistration,
  validateLogin
};
