const crypto = require('crypto');
const config = require('./config');

// In-memory active sessions with timestamp
const sessions = new Map();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Salt and hash generation using crypto PBKDF2
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Fixed salt for admin verification based on secret
const ADMIN_SALT = crypto.createHash('sha256').update(config.SESSION_SECRET + '_salt').digest('hex').slice(0, 32);
const EXPECTED_HASH = hashPassword(config.ADMIN_PASSWORD, ADMIN_SALT);

function verifyAdminCredentials(identifier, password) {
  if (!identifier || !password) return false;
  const idClean = identifier.trim().toLowerCase();
  const validUsernames = [
    (config.ADMIN_EMAIL || '').toLowerCase(),
    (config.ADMIN_USERNAME || '').toLowerCase(),
    'elyravisualstudio@gmail.com',
    'admin'
  ].filter(Boolean);

  if (!validUsernames.includes(idClean)) return false;
  const hash = hashPassword(password, ADMIN_SALT);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(EXPECTED_HASH));
}

function createSession(username = config.ADMIN_USERNAME) {
  const token = crypto.randomBytes(32).toString('hex');
  const sessionData = {
    username: username || 'elyravisualstudio@gmail.com',
    role: 'admin',
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS
  };
  sessions.set(token, sessionData);
  return token;
}

function validateSession(token) {
  if (!token) return false;
  const session = sessions.get(token);
  if (!session) return false;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return false;
  }
  return session;
}

function destroySession(token) {
  if (token) {
    sessions.delete(token);
  }
}

// Authentication middleware
function requireAdminAuth(req, res, next) {
  const token = req.cookies?.elyra_admin_token || req.headers['x-admin-token'] || (req.headers.authorization?.replace('Bearer ', ''));

  const session = validateSession(token);
  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication required'
    });
  }

  req.adminSession = session;
  req.adminToken = token;
  next();
}

module.exports = {
  verifyAdminCredentials,
  createSession,
  validateSession,
  destroySession,
  requireAdminAuth
};
