// ELYRA Visual Studio — Admin Dashboard Controller
// Hybrid: Works seamlessly on Node.js backend AND static GitHub Pages

class AdminDashboard {
  constructor() {
    this.token = localStorage.getItem('elyra_admin_token') || null;
    this.projects = [];
    this.notifications = [];
    this.stats = {};
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.pollInterval = null;

    this.initElements();
    this.bindEvents();
    this.checkAuth();
  }

  initElements() {
    this.loginScreen = document.getElementById('admin-login-screen');
    this.adminApp = document.getElementById('admin-app');
    this.loginForm = document.getElementById('admin-login-form');
    this.usernameInput = document.getElementById('admin-username');
    this.passwordInput = document.getElementById('admin-password');
    this.loginError = document.getElementById('login-error-msg');
    this.logoutBtn = document.getElementById('admin-logout-btn');

    this.metricNew = document.getElementById('metric-val-new');
    this.metricTotal = document.getElementById('metric-val-total');
    this.metricProgress = document.getElementById('metric-val-progress');
    this.metricCompleted = document.getElementById('metric-val-completed');

    this.notifBellBtn = document.getElementById('notif-bell-btn');
    this.notifDrawer = document.getElementById('notif-drawer');
    this.notifCountBadge = document.getElementById('notif-counter-badge');
    this.notifListBody = document.getElementById('notif-list-body');
    this.markAllReadBtn = document.getElementById('mark-all-read-btn');

    this.tableBody = document.getElementById('projects-table-body');
    this.statusFilterSelect = document.getElementById('status-filter-select');
    this.searchInput = document.getElementById('project-search-input');
    this.refreshBtn = document.getElementById('btn-refresh-data');

    this.detailModal = document.getElementById('project-detail-modal');
    this.detailModalBody = document.getElementById('project-detail-body');
    this.detailModalTitle = document.getElementById('detail-modal-title');
  }

  bindEvents() {
    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    if (this.notifBellBtn && this.notifDrawer) {
      this.notifBellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.notifDrawer.classList.toggle('open');
      });

      document.addEventListener('click', (e) => {
        if (!this.notifDrawer.contains(e.target) && e.target !== this.notifBellBtn) {
          this.notifDrawer.classList.remove('open');
        }
      });
    }

    if (this.markAllReadBtn) {
      this.markAllReadBtn.addEventListener('click', () => this.markAllNotificationsRead());
    }

    if (this.statusFilterSelect) {
      this.statusFilterSelect.addEventListener('change', (e) => {
        this.currentFilter = e.target.value;
        this.fetchProjects();
      });
    }

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderProjectsTable();
      });
    }

    if (this.refreshBtn) {
      this.refreshBtn.addEventListener('click', () => {
        this.loadDashboardData();
      });
    }

    document.querySelectorAll('[data-action="close-admin-modal"]').forEach(btn => {
      btn.addEventListener('click', () => this.closeDetailModal());
    });

    if (this.detailModal) {
      this.detailModal.addEventListener('click', (e) => {
        if (e.target === this.detailModal) this.closeDetailModal();
      });
    }
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['x-admin-token'] = this.token;
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async checkAuth() {
    if (this.token) {
      // Try backend check
      try {
        const res = await fetch('/api/admin/check-auth', { headers: this.getHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            this.showDashboard();
            return;
          }
        }
      } catch (e) {}

      // Fallback: If token exists locally
      if (this.token === 'elyra_static_token_valid') {
        this.showDashboard();
        return;
      }
    }
    this.showLogin();
  }

  showLogin() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.loginScreen) this.loginScreen.style.display = 'flex';
    if (this.adminApp) this.adminApp.style.display = 'none';
  }

  showDashboard() {
    if (this.loginScreen) this.loginScreen.style.display = 'none';
    if (this.adminApp) this.adminApp.style.display = 'flex';
    this.loadDashboardData();

    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      this.fetchStats();
      this.fetchNotifications();
    }, 8000);
  }

  async handleLogin(e) {
    e.preventDefault();
    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value;

    if (!username || !password) return;

    let loginSuccess = false;

    // Try Node backend
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          this.token = data.token;
          localStorage.setItem('elyra_admin_token', data.token);
          loginSuccess = true;
        }
      }
    } catch (err) {}

    // Fallback static auth (GitHub Pages)
    if (!loginSuccess) {
      if (username === 'admin' && (password === 'elyra2026!secure' || password === 'admin')) {
        this.token = 'elyra_static_token_valid';
        localStorage.setItem('elyra_admin_token', this.token);
        loginSuccess = true;
      }
    }

    if (loginSuccess) {
      if (this.loginError) this.loginError.style.display = 'none';
      this.showDashboard();
    } else {
      if (this.loginError) {
        this.loginError.textContent = 'Invalid credentials. Use admin / elyra2026!secure';
        this.loginError.style.display = 'block';
      }
    }
  }

  async handleLogout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST', headers: this.getHeaders() });
    } catch (e) {}

    this.token = null;
    localStorage.removeItem('elyra_admin_token');
    this.showLogin();
  }

  async loadDashboardData() {
    await Promise.all([
      this.fetchStats(),
      this.fetchProjects(),
      this.fetchNotifications()
    ]);
  }

  async fetchStats() {
    try {
      const res = await fetch('/api/admin/stats', { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        this.stats = data.stats;
        this.renderStats();
        return;
      }
    } catch (e) {}

    // Fallback calculation from localStorage
    const localProjects = this.getLocalProjects();
    const localNotifs = this.getLocalNotifications();
    this.stats = {
      newRequests: localProjects.filter(p => p.status === 'New').length,
      totalRequests: localProjects.length,
      inProgress: localProjects.filter(p => p.status === 'In Progress').length,
      completed: localProjects.filter(p => p.status === 'Completed').length,
      unreadNotifications: localNotifs.filter(n => !n.read).length
    };
    this.renderStats();
  }

  renderStats() {
    if (!this.stats) return;
    if (this.metricNew) this.metricNew.textContent = this.stats.newRequests || 0;
    if (this.metricTotal) this.metricTotal.textContent = this.stats.totalRequests || 0;
    if (this.metricProgress) this.metricProgress.textContent = this.stats.inProgress || 0;
    if (this.metricCompleted) this.metricCompleted.textContent = this.stats.completed || 0;

    if (this.notifCountBadge) {
      const unread = this.stats.unreadNotifications || 0;
      if (unread > 0) {
        this.notifCountBadge.textContent = unread;
        this.notifCountBadge.classList.remove('hidden');
      } else {
        this.notifCountBadge.classList.add('hidden');
      }
    }
  }

  async fetchProjects() {
    try {
      const url = `/api/admin/projects?status=${encodeURIComponent(this.currentFilter)}`;
      const res = await fetch(url, { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        this.projects = data.projects || [];
        this.renderProjectsTable();
        return;
      }
    } catch (e) {}

    // Fallback: localStorage
    let list = this.getLocalProjects();
    if (this.currentFilter && this.currentFilter !== 'all') {
      list = list.filter(p => p.status.toLowerCase() === this.currentFilter.toLowerCase());
    }
    this.projects = list;
    this.renderProjectsTable();
  }

  renderProjectsTable() {
    if (!this.tableBody) return;
    this.tableBody.innerHTML = '';

    let list = [...this.projects];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p =>
        p.fullName.toLowerCase().includes(q) ||
        p.businessName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.services && p.services.some(s => s.toLowerCase().includes(q)))
      );
    }

    if (list.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="table-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              <h4 style="color:var(--color-forest); margin-bottom:0.25rem;">No project requests found</h4>
              <p style="font-size:0.85rem; color:var(--color-text-muted);">Try adjusting your filter or search criteria.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    list.forEach(project => {
      const tr = document.createElement('tr');

      const dateFormatted = new Date(project.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const cleanPhone = (project.phone || '').replace(/[^0-9+]/g, '');
      const waLink = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(`Hi ${project.fullName}! This is ELYRA Visual Studio regarding your project request for ${project.businessName}.`)}`;

      const statusClass = `status-${project.status.replace(/\s+/g, '-')}`;

      tr.innerHTML = `
        <td>
          <span class="client-id-badge">${project.id}</span>
          <div class="client-name-cell">
            <strong>${project.fullName}</strong>
            <span>${project.businessName}</span>
          </div>
        </td>
        <td>
          <div>
            <a href="${waLink}" target="_blank" style="color:var(--color-emerald); font-weight:600; display:inline-flex; align-items:center; gap:4px;">
              ${project.phone}
            </a>
          </div>
          ${project.email ? `<div style="font-size:0.8rem; color:var(--color-text-muted);">${project.email}</div>` : ''}
        </td>
        <td>
          <div class="services-tag-list">
            ${(project.services || []).map(s => `<span class="service-tag">${s}</span>`).join('')}
          </div>
        </td>
        <td>
          <div style="font-size:0.85rem; font-weight:600; color:var(--color-forest);">${project.timeline || 'Flexible'}</div>
          <div style="font-size:0.75rem; color:var(--color-text-muted);">${dateFormatted}</div>
        </td>
        <td>
          <select class="status-change-select ${statusClass}" data-project-id="${project.id}">
            <option value="New" ${project.status === 'New' ? 'selected' : ''}>New</option>
            <option value="Contacted" ${project.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
            <option value="In Progress" ${project.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${project.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
        <td>
          <div class="action-btn-group">
            <button class="btn-icon-action" data-action="view-details" data-id="${project.id}" title="View Details">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <a href="${waLink}" target="_blank" class="btn-icon-action btn-whatsapp-direct" title="Chat on WhatsApp">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </a>
          </div>
        </td>
      `;

      const statusSelect = tr.querySelector('.status-change-select');
      statusSelect.addEventListener('change', (e) => {
        this.updateProjectStatus(project.id, e.target.value);
      });

      const viewBtn = tr.querySelector('[data-action="view-details"]');
      viewBtn.addEventListener('click', () => {
        this.openDetailModal(project);
      });

      this.tableBody.appendChild(tr);
    });
  }

  async updateProjectStatus(projectId, newStatus) {
    try {
      await fetch(`/api/admin/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {}

    // Update in local array & localStorage
    const p = this.projects.find(x => x.id === projectId);
    if (p) p.status = newStatus;

    const localList = this.getLocalProjects();
    const localP = localList.find(x => x.id === projectId);
    if (localP) {
      localP.status = newStatus;
      localStorage.setItem('elyra_projects_db', JSON.stringify(localList));
    }

    this.renderStats();
    this.renderProjectsTable();
  }

  async fetchNotifications() {
    try {
      const res = await fetch('/api/admin/notifications', { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        this.notifications = data.notifications || [];
        this.renderNotifications();
        return;
      }
    } catch (e) {}

    this.notifications = this.getLocalNotifications();
    this.renderNotifications();
  }

  renderNotifications() {
    if (!this.notifListBody) return;
    this.notifListBody.innerHTML = '';

    if (this.notifications.length === 0) {
      this.notifListBody.innerHTML = `
        <div style="padding:2rem 1.5rem; text-align:center; color:var(--color-text-muted); font-size:0.88rem;">
          No notifications yet.
        </div>
      `;
      return;
    }

    this.notifications.forEach(notif => {
      const item = document.createElement('div');
      item.className = `notif-item ${notif.read ? '' : 'unread'}`;
      const timeAgo = this.formatTimeAgo(notif.createdAt);

      item.innerHTML = `
        <div class="notif-bell-icon">🔔</div>
        <div class="notif-meta-wrap">
          <div class="notif-title">${notif.title}</div>
          <div class="notif-message">${notif.message}</div>
          <div class="notif-time">${timeAgo}</div>
        </div>
      `;

      item.addEventListener('click', async () => {
        if (!notif.read) {
          await this.markNotificationRead(notif.id);
        }
        const project = this.projects.find(p => p.id === notif.projectId);
        if (project) {
          this.notifDrawer.classList.remove('open');
          this.openDetailModal(project);
        }
      });

      this.notifListBody.appendChild(item);
    });
  }

  async markNotificationRead(id) {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'PATCH',
        headers: this.getHeaders()
      });
    } catch (e) {}

    const notifs = this.getLocalNotifications();
    const target = notifs.find(n => n.id === id);
    if (target) {
      target.read = true;
      localStorage.setItem('elyra_notifs_db', JSON.stringify(notifs));
    }
    await this.fetchStats();
    await this.fetchNotifications();
  }

  async markAllNotificationsRead() {
    try {
      await fetch('/api/admin/notifications/mark-all-read', {
        method: 'POST',
        headers: this.getHeaders()
      });
    } catch (e) {}

    const notifs = this.getLocalNotifications();
    notifs.forEach(n => { n.read = true; });
    localStorage.setItem('elyra_notifs_db', JSON.stringify(notifs));

    await this.fetchStats();
    await this.fetchNotifications();
  }

  openDetailModal(project) {
    if (!this.detailModal || !this.detailModalBody) return;

    if (this.detailModalTitle) {
      this.detailModalTitle.textContent = `${project.id} — ${project.businessName}`;
    }

    const cleanPhone = (project.phone || '').replace(/[^0-9+]/g, '');
    const waLink = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(`Hi ${project.fullName}! This is ELYRA Visual Studio regarding your project request for ${project.businessName}.`)}`;

    this.detailModalBody.innerHTML = `
      <div class="detail-section">
        <h5>Client Information</h5>
        <div class="client-meta-grid">
          <div>
            <span style="font-size:0.75rem; color:var(--color-text-muted); font-weight:700;">Full Name</span>
            <div style="font-weight:700; color:var(--color-forest);">${project.fullName}</div>
          </div>
          <div>
            <span style="font-size:0.75rem; color:var(--color-text-muted); font-weight:700;">Business Name</span>
            <div style="font-weight:700; color:var(--color-forest);">${project.businessName}</div>
          </div>
          <div>
            <span style="font-size:0.75rem; color:var(--color-text-muted); font-weight:700;">Phone / WhatsApp</span>
            <div><a href="${waLink}" target="_blank" style="color:var(--color-emerald); font-weight:700;">${project.phone} ↗</a></div>
          </div>
          <div>
            <span style="font-size:0.75rem; color:var(--color-text-muted); font-weight:700;">Email</span>
            <div style="color:var(--color-text-dark);">${project.email || 'Not provided'}</div>
          </div>
          <div>
            <span style="font-size:0.75rem; color:var(--color-text-muted); font-weight:700;">Timeline</span>
            <div style="font-weight:700; color:var(--color-forest);">${project.timeline || 'Flexible'}</div>
          </div>
          <div>
            <span style="font-size:0.75rem; color:var(--color-text-muted); font-weight:700;">Current Status</span>
            <div style="font-weight:700; color:var(--color-forest);">${project.status}</div>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h5>Selected Services</h5>
        <div class="services-tag-list" style="max-width:100%;">
          ${(project.services || []).map(s => `<span class="service-tag" style="font-size:0.88rem; padding:0.35rem 0.75rem;">${s}</span>`).join('')}
        </div>
      </div>

      <div class="detail-section">
        <h5>Project Requirements & Brief</h5>
        <div class="detail-req-box">${project.requirements}</div>
      </div>

      <div class="detail-section">
        <h5>Internal Studio Notes</h5>
        <textarea id="modal-project-notes" class="notes-textarea" placeholder="Add internal follow-up notes or action items...">${project.notes || ''}</textarea>
        <div style="margin-top:0.5rem; display:flex; justify-content:flex-end;">
          <button class="admin-btn-primary" id="save-notes-btn" style="width:auto; padding:0.45rem 1.15rem; font-size:0.85rem;">Save Notes</button>
        </div>
      </div>
    `;

    const saveBtn = this.detailModalBody.querySelector('#save-notes-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const notes = document.getElementById('modal-project-notes').value;
        await this.saveProjectNotes(project.id, notes);
        saveBtn.textContent = 'Saved ✓';
        setTimeout(() => { saveBtn.textContent = 'Save Notes'; }, 2000);
      });
    }

    this.detailModal.classList.add('active');
  }

  async saveProjectNotes(projectId, notes) {
    try {
      await fetch(`/api/admin/projects/${projectId}/notes`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ notes })
      });
    } catch (e) {}

    const p = this.projects.find(x => x.id === projectId);
    if (p) p.notes = notes;

    const list = this.getLocalProjects();
    const lp = list.find(x => x.id === projectId);
    if (lp) {
      lp.notes = notes;
      localStorage.setItem('elyra_projects_db', JSON.stringify(list));
    }
  }

  closeDetailModal() {
    if (!this.detailModal) return;
    this.detailModal.classList.remove('active');
  }

  getLocalProjects() {
    const raw = localStorage.getItem('elyra_projects_db');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    const seed = [
      {
        id: "ELY-1001",
        fullName: "Kavitha R.",
        businessName: "Aura Botanical Skincare",
        phone: "+91 98765 43210",
        email: "contact@aurabotanicals.in",
        services: ["Branding", "Logo Design", "Visiting Card"],
        requirements: "We need a complete earthy, premium visual identity for our organic skincare line.",
        timeline: "2-3 weeks",
        status: "In Progress",
        notes: "Initial brand moodboard approved.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "ELY-1002",
        fullName: "Vikram Mehta",
        businessName: "Apex Logistics Tech",
        phone: "+91 91234 56789",
        email: "vikram@apexlogistics.io",
        services: ["Website", "Web Page / Landing Page"],
        requirements: "Modern responsive website for our B2B tech logistics platform.",
        timeline: "1 month",
        status: "Contacted",
        notes: "Discovery call scheduled.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem('elyra_projects_db', JSON.stringify(seed));
    return seed;
  }

  getLocalNotifications() {
    const raw = localStorage.getItem('elyra_notifs_db');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    const seed = [
      {
        id: "NOTIF-1001",
        title: "New Project Request",
        message: "Vikram Mehta submitted a project request for Apex Logistics Tech",
        clientName: "Vikram Mehta",
        services: ["Website", "Web Page / Landing Page"],
        projectId: "ELY-1002",
        read: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem('elyra_notifs_db', JSON.stringify(seed));
    return seed;
  }

  formatTimeAgo(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.elyraAdmin = new AdminDashboard();
});
