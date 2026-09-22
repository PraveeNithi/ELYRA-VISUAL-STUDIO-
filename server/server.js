const fs = require('fs');
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config');
const apiRoutes = require('./routes');

const app = express();

// Security & Parsing Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom header for brand recognition & no-sniff
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'ELYRA Visual Studio Engine');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Static assets from public folder and root
const publicDir = path.join(__dirname, '..', 'public');
const rootDir = path.join(__dirname, '..');
app.use(express.static(publicDir));
app.use(express.static(rootDir));

// Explicit route for admin dashboard
app.get('/admin', (req, res) => {
  const adminHtml = fs.existsSync(path.join(publicDir, 'admin', 'index.html'))
    ? path.join(publicDir, 'admin', 'index.html')
    : path.join(rootDir, 'admin', 'index.html');
  res.sendFile(adminHtml);
});

// Client SPA fallback to home
app.get('*', (req, res) => {
  if (req.path.startsWith('/admin')) {
    return res.sendFile(path.join(publicDir, 'admin', 'index.html'));
  }
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

// Start Server
if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`====================================================`);
    console.log(`✨ ELYRA Visual Studio — Designs that build brands.`);
    console.log(`🚀 Production Server running at: http://localhost:${config.PORT}`);
    console.log(`🔒 Private Admin Dashboard at: http://localhost:${config.PORT}/admin`);
    console.log(`====================================================`);
  });
}

module.exports = app;
