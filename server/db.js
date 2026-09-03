const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('./config');

// Ensure data directory exists
if (!fs.existsSync(config.DATA_DIR)) {
  fs.mkdirSync(config.DATA_DIR, { recursive: true });
}

const defaultData = {
  projects: [
    {
      id: "ELY-1001",
      fullName: "Kavitha R.",
      businessName: "Aura Botanical Skincare",
      phone: "+91 98765 43210",
      email: "contact@aurabotanicals.in",
      services: ["Branding", "Logo Design", "Visiting Card"],
      requirements: "We need a complete earthy, premium visual identity for our organic skincare line, including primary logo, secondary badge, visiting cards and brand color guidelines.",
      timeline: "2-3 weeks",
      status: "In Progress",
      notes: "Initial brand moodboard approved. Working on final vector lockups.",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "ELY-1002",
      fullName: "Vikram Mehta",
      businessName: "Apex Logistics Tech",
      phone: "+91 91234 56789",
      email: "vikram@apexlogistics.io",
      services: ["Website", "Web Page / Landing Page"],
      requirements: "Modern responsive website for our B2B tech logistics platform with interactive dashboard preview and lead capture flow.",
      timeline: "1 month",
      status: "Contacted",
      notes: "Discovery call scheduled for tomorrow afternoon via Google Meet.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "ELY-1003",
      fullName: "Ananya Sharma",
      businessName: "Verde Artisan Cafe",
      phone: "+91 99887 76655",
      email: "hello@verdecafe.com",
      services: ["QR Scanner Web Page", "Poster & Social Media Design"],
      requirements: "A clean digital QR menu web app that loads instantly when guests scan the table QR code, plus promotional poster templates for our weekend brunch specials.",
      timeline: "Urgent (< 1 week)",
      status: "Completed",
      notes: "Deployed to production QR landing subdomain. Client very satisfied!",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  notifications: [
    {
      id: "NOTIF-1001",
      type: "new_request",
      title: "New Project Request",
      message: "Vikram Mehta submitted a project request for Apex Logistics Tech",
      clientName: "Vikram Mehta",
      services: ["Website", "Web Page / Landing Page"],
      projectId: "ELY-1002",
      read: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "NOTIF-1002",
      type: "new_request",
      title: "New Project Request",
      message: "Kavitha R. submitted a project request for Aura Botanical Skincare",
      clientName: "Kavitha R.",
      services: ["Branding", "Logo Design", "Visiting Card"],
      projectId: "ELY-1001",
      read: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

function readDb() {
  try {
    if (!fs.existsSync(config.DB_FILE)) {
      writeDb(defaultData);
      return JSON.parse(JSON.stringify(defaultData));
    }
    const raw = fs.readFileSync(config.DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.projects) data.projects = [];
    if (!data.notifications) data.notifications = [];
    return data;
  } catch (err) {
    console.error('Error reading DB, restoring default state:', err);
    return JSON.parse(JSON.stringify(defaultData));
  }
}

function writeDb(data) {
  const tmpFile = `${config.DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpFile, config.DB_FILE);
}

// Generate human-friendly ID like ELY-1004
function generateProjectId(existingProjects) {
  let maxNum = 1000;
  for (const p of existingProjects) {
    if (p.id && p.id.startsWith('ELY-')) {
      const num = parseInt(p.id.replace('ELY-', ''), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  return `ELY-${maxNum + 1}`;
}

const db = {
  getProjects(filters = {}) {
    const data = readDb();
    let projects = [...data.projects];

    if (filters.status && filters.status !== 'all') {
      projects = projects.filter(p => p.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      projects = projects.filter(p =>
        p.fullName.toLowerCase().includes(q) ||
        p.businessName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.services && p.services.some(s => s.toLowerCase().includes(q)))
      );
    }

    // Sort newest first
    return projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getProjectById(id) {
    const data = readDb();
    return data.projects.find(p => p.id === id);
  },

  createProject(projectInput) {
    const data = readDb();
    const id = generateProjectId(data.projects);
    const now = new Date().toISOString();

    const newProject = {
      id,
      fullName: projectInput.fullName.trim(),
      businessName: projectInput.businessName.trim(),
      phone: projectInput.phone.trim(),
      email: projectInput.email ? projectInput.email.trim() : '',
      services: Array.isArray(projectInput.services) ? projectInput.services : [],
      requirements: projectInput.requirements.trim(),
      timeline: projectInput.timeline || 'Flexible',
      status: 'New',
      notes: '',
      createdAt: now,
      updatedAt: now
    };

    data.projects.unshift(newProject);

    // Create notification
    const notifId = `NOTIF-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const newNotification = {
      id: notifId,
      type: 'new_request',
      title: 'New Project Request',
      message: `${newProject.fullName} submitted a request for ${newProject.businessName}`,
      clientName: newProject.fullName,
      services: newProject.services,
      projectId: newProject.id,
      read: false,
      createdAt: now
    };

    data.notifications.unshift(newNotification);

    writeDb(data);
    return { project: newProject, notification: newNotification };
  },

  updateProjectStatus(id, newStatus) {
    const validStatuses = ['New', 'Contacted', 'In Progress', 'Completed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const data = readDb();
    const project = data.projects.find(p => p.id === id);
    if (!project) return null;

    project.status = newStatus;
    project.updatedAt = new Date().toISOString();
    writeDb(data);
    return project;
  },

  updateProjectNotes(id, notes) {
    const data = readDb();
    const project = data.projects.find(p => p.id === id);
    if (!project) return null;

    project.notes = notes || '';
    project.updatedAt = new Date().toISOString();
    writeDb(data);
    return project;
  },

  deleteProject(id) {
    const data = readDb();
    const initialLen = data.projects.length;
    data.projects = data.projects.filter(p => p.id !== id);
    data.notifications = data.notifications.filter(n => n.projectId !== id);
    writeDb(data);
    return data.projects.length < initialLen;
  },

  getNotifications(limit = 50) {
    const data = readDb();
    return data.notifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  markNotificationAsRead(id) {
    const data = readDb();
    const notif = data.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      writeDb(data);
      return notif;
    }
    return null;
  },

  markAllNotificationsAsRead() {
    const data = readDb();
    data.notifications.forEach(n => { n.read = true; });
    writeDb(data);
    return true;
  },

  getStats() {
    const data = readDb();
    const total = data.projects.length;
    const newCount = data.projects.filter(p => p.status === 'New').length;
    const inProgress = data.projects.filter(p => p.status === 'In Progress').length;
    const completed = data.projects.filter(p => p.status === 'Completed').length;
    const contacted = data.projects.filter(p => p.status === 'Contacted').length;
    const unreadNotifications = data.notifications.filter(n => !n.read).length;

    return {
      newRequests: newCount,
      totalRequests: total,
      inProgress,
      completed,
      contacted,
      unreadNotifications
    };
  }
};

module.exports = db;
