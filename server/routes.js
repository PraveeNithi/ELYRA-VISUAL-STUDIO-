const express = require('express');
const router = express.Router();
const db = require('./db');
const auth = require('./auth');

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'ELYRA Visual Studio',
    tagline: 'Designs that build brands.',
    timestamp: new Date().toISOString()
  });
});

// Client Project Submission
router.post('/projects', (req, res) => {
  try {
    const { fullName, businessName, phone, email, services, requirements, timeline } = req.body;

    // Field validations
    const errors = [];
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      errors.push('Full Name is required (at least 2 characters).');
    }
    if (!businessName || typeof businessName !== 'string' || businessName.trim().length < 2) {
      errors.push('Business Name is required.');
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length < 6) {
      errors.push('Valid Phone / WhatsApp Number is required.');
    }
    if (!Array.isArray(services) || services.length === 0) {
      errors.push('Please select at least one service.');
    }
    if (!requirements || typeof requirements !== 'string' || requirements.trim().length < 5) {
      errors.push('Please provide some project requirements or goals.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const result = db.createProject({
      fullName,
      businessName,
      phone,
      email,
      services,
      requirements,
      timeline
    });

    return res.status(201).json({
      success: true,
      message: 'Project request received successfully!',
      projectId: result.project.id,
      project: {
        id: result.project.id,
        fullName: result.project.fullName,
        businessName: result.project.businessName,
        services: result.project.services,
        createdAt: result.project.createdAt
      }
    });
  } catch (error) {
    console.error('Error handling project submission:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while saving project request.'
    });
  }
});

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required.'
    });
  }

  if (auth.verifyAdminCredentials(username, password)) {
    const token = auth.createSession();

    // Set cookie
    res.cookie('elyra_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        username: username
      }
    });
  } else {
    return res.status(401).json({
      success: false,
      error: 'Invalid username or password.'
    });
  }
});

router.post('/admin/logout', (req, res) => {
  const token = req.cookies?.elyra_admin_token || req.headers['x-admin-token'];
  auth.destroySession(token);
  res.clearCookie('elyra_admin_token');
  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

router.get('/admin/check-auth', (req, res) => {
  const token = req.cookies?.elyra_admin_token || req.headers['x-admin-token'] || (req.headers.authorization?.replace('Bearer ', ''));
  const session = auth.validateSession(token);

  if (!session) {
    return res.status(401).json({
      authenticated: false
    });
  }

  return res.json({
    authenticated: true,
    admin: {
      username: session.username
    }
  });
});

// ==========================================
// PROTECTED ADMIN DASHBOARD ENDPOINTS
// ==========================================

router.use('/admin', auth.requireAdminAuth);

// Get Dashboard Statistics
router.get('/admin/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
});

// Get Project Requests (with search and status filters)
router.get('/admin/projects', (req, res) => {
  try {
    const { status, search } = req.query;
    const projects = db.getProjects({ status, search });
    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch project requests' });
  }
});

// Get Single Project
router.get('/admin/projects/:id', (req, res) => {
  try {
    const project = db.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project request not found' });
    }
    res.json({ success: true, project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch project' });
  }
});

// Update Project Status (New -> Contacted -> In Progress -> Completed)
router.patch('/admin/projects/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const updated = db.updateProjectStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Project request not found' });
    }

    res.json({
      success: true,
      message: `Project status updated to ${status}`,
      project: updated
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(400).json({ success: false, error: error.message || 'Failed to update status' });
  }
});

// Update Project Internal Notes
router.patch('/admin/projects/:id/notes', (req, res) => {
  try {
    const { notes } = req.body;
    const updated = db.updateProjectNotes(req.params.id, notes);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Project request not found' });
    }
    res.json({
      success: true,
      message: 'Project notes updated',
      project: updated
    });
  } catch (error) {
    console.error('Error updating notes:', error);
    res.status(500).json({ success: false, error: 'Failed to update notes' });
  }
});

// Delete Project Request
router.delete('/admin/projects/:id', (req, res) => {
  try {
    const deleted = db.deleteProject(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Project not found or already deleted' });
    }
    res.json({ success: true, message: 'Project request deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, error: 'Failed to delete project' });
  }
});

// Get Notifications
router.get('/admin/notifications', (req, res) => {
  try {
    const notifications = db.getNotifications();
    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

// Mark Single Notification Read
router.patch('/admin/notifications/:id/read', (req, res) => {
  try {
    const notif = db.markNotificationAsRead(req.params.id);
    if (!notif) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    res.json({ success: true, notification: notif });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ success: false, error: 'Failed to update notification' });
  }
});

// Mark All Notifications Read
router.post('/admin/notifications/mark-all-read', (req, res) => {
  try {
    db.markAllNotificationsAsRead();
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark all as read' });
  }
});

module.exports = router;
