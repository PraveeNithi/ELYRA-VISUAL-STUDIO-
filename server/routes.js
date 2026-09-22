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

// Client Registration / Project Submission
const handleRegistration = (req, res) => {
  try {
    const {
      fullName,
      businessName,
      phone,
      email,
      address,
      services,
      selectedWork,
      requirements,
      timeline
    } = req.body;

    // Field validations
    const errors = [];
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      errors.push('Full Name is required (at least 2 characters).');
    }
    if (!businessName || typeof businessName !== 'string' || businessName.trim().length < 2) {
      errors.push('Business Name / Project Title is required.');
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length < 6) {
      errors.push('Valid Phone / WhatsApp Number is required.');
    }
    const finalServices = Array.isArray(services) && services.length > 0
      ? services
      : (Array.isArray(selectedWork) && selectedWork.length > 0 ? selectedWork : []);

    if (finalServices.length === 0) {
      errors.push('Please select at least one work / service category.');
    }
    if (!requirements || typeof requirements !== 'string' || requirements.trim().length < 5) {
      errors.push('Please provide project requirements or application details.');
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
      address,
      services: finalServices,
      selectedWork: finalServices,
      requirements,
      timeline
    });

    return res.status(201).json({
      success: true,
      message: 'Client registration submitted successfully!',
      projectId: result.project.id,
      referenceToken: result.project.id,
      registrationNumber: result.project.id,
      registration: result.project,
      project: result.project
    });
  } catch (error) {
    console.error('Error handling registration submission:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while saving registration.'
    });
  }
};

router.post('/projects', handleRegistration);
router.post('/registrations', handleRegistration);

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

router.post('/admin/login', (req, res) => {
  const { username, email, password } = req.body;
  const identifier = email || username;

  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email/Username and password are required.'
    });
  }

  if (auth.verifyAdminCredentials(identifier, password)) {
    const token = auth.createSession(identifier);

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
        username: identifier,
        email: identifier.includes('@') ? identifier : 'elyravisualstudio@gmail.com'
      }
    });
  } else {
    return res.status(401).json({
      success: false,
      error: 'Invalid admin credentials. Please enter the correct email and secure password.'
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
      username: session.username,
      email: session.username
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

// Get Registrations / Project Requests (with search, work, dateRange and status filters)
const handleGetProjects = (req, res) => {
  try {
    const { status, work, dateRange, search } = req.query;
    const projects = db.getProjects({ status, work, dateRange, search });
    res.json({
      success: true,
      count: projects.length,
      registrations: projects,
      projects
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch registrations' });
  }
};

router.get('/admin/projects', handleGetProjects);
router.get('/admin/registrations', handleGetProjects);

// Get Single Registration / Project
const handleGetSingleProject = (req, res) => {
  try {
    const project = db.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }
    res.json({ success: true, registration: project, project });
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch registration' });
  }
};

router.get('/admin/projects/:id', handleGetSingleProject);
router.get('/admin/registrations/:id', handleGetSingleProject);

// Update Project Status
const handleUpdateStatus = (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const updated = db.updateProjectStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }

    res.json({
      success: true,
      message: `Registration status updated to ${updated.status}`,
      registration: updated,
      project: updated
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(400).json({ success: false, error: error.message || 'Failed to update status' });
  }
};

router.patch('/admin/projects/:id/status', handleUpdateStatus);
router.patch('/admin/registrations/:id/status', handleUpdateStatus);

// Update Project Internal Notes
const handleUpdateNotes = (req, res) => {
  try {
    const { notes } = req.body;
    const updated = db.updateProjectNotes(req.params.id, notes);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }
    res.json({
      success: true,
      message: 'Registration notes updated',
      registration: updated,
      project: updated
    });
  } catch (error) {
    console.error('Error updating notes:', error);
    res.status(500).json({ success: false, error: 'Failed to update notes' });
  }
};

router.patch('/admin/projects/:id/notes', handleUpdateNotes);
router.patch('/admin/registrations/:id/notes', handleUpdateNotes);

// Delete Project Request
const handleDeleteProject = (req, res) => {
  try {
    const deleted = db.deleteProject(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Registration not found or already deleted' });
    }
    res.json({ success: true, message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ success: false, error: 'Failed to delete registration' });
  }
};

router.delete('/admin/projects/:id', handleDeleteProject);
router.delete('/admin/registrations/:id', handleDeleteProject);

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
