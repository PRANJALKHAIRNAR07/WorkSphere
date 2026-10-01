const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  secret: process.env.JWT_SECRET || 'worksphere_super_secret_jwt_key_2026_production_ready!',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
};
