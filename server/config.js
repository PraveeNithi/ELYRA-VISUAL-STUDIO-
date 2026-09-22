const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'elyravisualstudio@gmail.com',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'elyravisualstudio@gmail.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'elyra2026!secure',
  SESSION_SECRET: process.env.SESSION_SECRET || 'elyra_studio_secret_key_983274982374982374',
  DATA_DIR: path.join(__dirname, '..', 'data'),
  DB_FILE: path.join(__dirname, '..', 'data', 'database.json')
};
