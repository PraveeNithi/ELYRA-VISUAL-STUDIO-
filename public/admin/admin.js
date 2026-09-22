// ELYRA Visual Studio — Admin Dashboard Controller
// Complete client registration management, metrics, multi-parameter search & filtering

class AdminDashboard {
  constructor() {
    this.token = localStorage.getItem('elyra_admin_token') || null;
    this.userEmail = localStorage.getItem('elyra_admin_email') || 'elyravisualstudio@gmail.com';
    this.projects = [];
    this.notifications = [];
    this.stats = {};
    this.currentStatusFilter = 'all';
    this.currentWorkFilter = 'all';
    this.currentDateFilter = 'all';
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
    this.adminUserDisplay = document.getElementById('admin-user-display');

    this.metricTotal = document.getElementById('metric-val-total');
    this.metricPending = document.getElementById('metric-val-pending');
    this.metricApproved = document.getElementById('metric-val-approved');
    this.metricProgress = document.getElementById('metric-val-progress');
    this.metricCompleted = document.getElementById('metric-val-completed');
    this.metricRejected = document.getElementById('metric-val-rejected');

    this.notifBellBtn = document.getElementById('notif-bell-btn');
    this.notifDrawer = document.getElementById('notif-drawer');
    this.notifCountBadge = document.getElementById('notif-counter-badge');
    this.notifListBody = document.getElementById('notif-list-body');
    this.markAllReadBtn = document.getElementById('mark-all-read-btn');

    this.tableBody = document.getElementById('projects-table-body');
    this.statusFilterSelect = document.getElementById('status-filter-select');
    this.workFilterSelect = document.getElementById('work-filter-select');
    this.dateFilterSelect = document.getElementById('date-filter-select');
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
        this.currentStatusFilter = e.target.value;
        this.fetchProjects();
      });
    }

    if (this.workFilterSelect) {
      this.workFilterSelect.addEventListener('change', (e) => {
        this.currentWorkFilter = e.target.value;
        this.fetchProjects();
      });
    }

    if (this.dateFilterSelect) {
      this.dateFilterSelect.addEventListener('change', (e) => {
        this.currentDateFilter = e.target.value;
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

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.detailModal && this.detailModal.classList.contains('active')) {
        this.closeDetailModal();
      }
    });
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
      try {
        const res = await fetch('/api/admin/check-auth', { headers: this.getHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            if (data.admin?.username || data.admin?.email) {
              this.userEmail = data.admin.email || data.admin.username;
            }
            this.showDashboard();
            return;
          }
        }
      } catch (e) {}

      // Fallback local token
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
    if (this.adminUserDisplay) {
      this.adminUserDisplay.textContent = this.userEmail || 'elyravisualstudio@gmail.com';
    }

    this.loadDashboardData();

    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      this.fetchStats();
      this.fetchNotifications();
    }, 6000);
  }

  async handleLogin(e) {
    e.preventDefault();
    const identifier = this.usernameInput.value.trim();
    const password = this.passwordInput.value;

    if (!identifier || !password) return;

    let loginSuccess = false;

    // Try Node backend
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier, email: identifier, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          this.token = data.token;
          this.userEmail = data.admin?.email || identifier;
          localStorage.setItem('elyra_admin_token', data.token);
          localStorage.setItem('elyra_admin_email', this.userEmail);
          loginSuccess = true;
        }
      }
    } catch (err) {}

    // Fallback static auth (GitHub Pages hosting fallback)
    if (!loginSuccess) {
      const validEmails = ['elyravisualstudio@gmail.com', 'admin'];
      if (validEmails.includes(identifier.toLowerCase()) && (password === 'elyra2026!secure' || password === 'admin')) {
        this.token = 'elyra_static_token_valid';
        this.userEmail = identifier;
        localStorage.setItem('elyra_admin_token', this.token);
        localStorage.setItem('elyra_admin_email', this.userEmail);
        loginSuccess = true;
      }
    }

    if (loginSuccess) {
      if (this.loginError) this.loginError.style.display = 'none';
      this.showDashboard();
    } else {
      if (this.loginError) {
        this.loginError.textContent = 'Invalid credentials. Please enter your admin email (elyravisualstudio@gmail.com) and secure password.';
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
    localStorage.removeItem('elyra_admin_email');
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
        this.stats = data.stats || {};
        this.renderStats();
        return;
      }
    } catch (e) {}

    // Fallback calculation from localStorage
    const localProjects = this.getLocalProjects();
    const localNotifs = this.getLocalNotifications();
    this.stats = {
      totalRegistrations: localProjects.length,
      totalRequests: localProjects.length,
      pending: localProjects.filter(p => p.status === 'Pending' || p.status === 'New').length,
      approved: localProjects.filter(p => p.status === 'Approved').length,
      inProgress: localProjects.filter(p => p.status === 'In Progress').length,
      completed: localProjects.filter(p => p.status === 'Completed').length,
      rejected: localProjects.filter(p => p.status === 'Rejected').length,
      unreadNotifications: localNotifs.filter(n => !n.read).length
    };
    this.renderStats();
  }

  renderStats() {
    if (!this.stats) return;
    if (this.metricTotal) this.metricTotal.textContent = this.stats.totalRegistrations || this.stats.totalRequests || 0;
    if (this.metricPending) this.metricPending.textContent = this.stats.pending || this.stats.newRequests || 0;
    if (this.metricApproved) this.metricApproved.textContent = this.stats.approved || 0;
    if (this.metricProgress) this.metricProgress.textContent = this.stats.inProgress || 0;
    if (this.metricCompleted) this.metricCompleted.textContent = this.stats.completed || 0;
    if (this.metricRejected) this.metricRejected.textContent = this.stats.rejected || 0;

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
      const params = new URLSearchParams();
      if (this.currentStatusFilter && this.currentStatusFilter !== 'all') {
        params.append('status', this.currentStatusFilter);
      }
      if (this.currentWorkFilter && this.currentWorkFilter !== 'all') {
        params.append('work', this.currentWorkFilter);
      }
      if (this.currentDateFilter && this.currentDateFilter !== 'all') {
        params.append('dateRange', this.currentDateFilter);
      }

      const url = `/api/admin/projects?${params.toString()}`;
      const res = await fetch(url, { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        this.projects = data.registrations || data.projects || [];
        this.renderProjectsTable();
        return;
      }
    } catch (e) {}

    // Fallback: localStorage
    let list = this.getLocalProjects();
    if (this.currentStatusFilter && this.currentStatusFilter !== 'all') {
      list = list.filter(p => (p.status || '').toLowerCase() === this.currentStatusFilter.toLowerCase());
    }
    if (this.currentWorkFilter && this.currentWorkFilter !== 'all') {
      const tw = this.currentWorkFilter.toLowerCase();
      list = list.filter(p => (p.services || []).some(s => s.toLowerCase().includes(tw)));
    }
    this.projects = list;
    this.renderProjectsTable();
  }

  renderProjectsTable() {
    if (!this.tableBody) return;
    this.tableBody.innerHTML = '';

    let list = [...this.projects];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        (p.fullName && p.fullName.toLowerCase().includes(q)) ||
        (p.businessName && p.businessName.toLowerCase().includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q)) ||
        (p.referenceToken && p.referenceToken.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.phone && p.phone.toLowerCase().includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q)) ||
        (p.services && p.services.some(s => s.toLowerCase().includes(q)))
      );
    }

    if (list.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="table-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              <h4 style="color:var(--color-forest); margin-bottom:0.25rem;">No client registrations found</h4>
              <p style="font-size:0.85rem; color:var(--color-text-muted);">Try adjusting your search criteria, selected work, or status filter.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    list.forEach(project => {
      const tr = document.createElement('tr');
      const refToken = project.referenceToken || project.registrationNumber || project.id;

      const dateFormatted = new Date(project.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const timeFormatted = new Date(project.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const cleanPhone = (project.phone || '').replace(/[^0-9+]/g, '');
      const waLink = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(`Hi ${project.fullName}! This is ELYRA Visual Studio regarding your registration (${refToken}) for ${project.businessName || 'your project'}.`)}`;

      const currentStatus = project.status || 'Pending';
      const statusClass = `status-${currentStatus.toLowerCase().replace(/\s+/g, '-')}`;

      tr.innerHTML = `
        <td>
          <span class="client-id-badge" title="Reference Token / Registration Number">${refToken}</span>
        </td>
        <td>
          <div class="client-name-cell">
            <strong>${project.fullName}</strong>
            <span class="client-business-sub">${project.businessName || 'Individual Client'}</span>
          </div>
        </td>
        <td>
          <div style="display:flex; flex-direction:column; gap:2px;">
            <a href="${waLink}" target="_blank" style="color:var(--color-emerald); font-weight:700; font-size:0.88rem; display:inline-flex; align-items:center; gap:4px;" title="Open WhatsApp">
              <span>${project.phone}</span>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
            ${project.email ? `<span style="font-size:0.78rem; color:var(--color-text-muted);">${project.email}</span>` : '<span style="font-size:0.75rem; color:#999;">No email</span>'}
          </div>
        </td>
        <td>
          <div class="services-tag-list">
            ${(project.services || project.selectedWork || []).map(s => `<span class="service-tag">${s}</span>`).join('')}
          </div>
        </td>
        <td>
          <div style="font-size:0.85rem; font-weight:600; color:var(--color-forest);">${project.timeline || 'Flexible'}</div>
          ${project.address ? `<div style="font-size:0.75rem; color:var(--color-text-muted); max-width:140px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${project.address}">📍 ${project.address}</div>` : ''}
        </td>
        <td>
          <div style="font-size:0.82rem; font-weight:600; color:var(--color-forest);">${dateFormatted}</div>
          <div style="font-size:0.75rem; color:var(--color-text-muted);">${timeFormatted}</div>
        </td>
        <td>
          <select class="status-change-select ${statusClass}" data-project-id="${project.id}">
            <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Approved" ${currentStatus === 'Approved' ? 'selected' : ''}>Approved</option>
            <option value="In Progress" ${currentStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${currentStatus === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Rejected" ${currentStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </td>
        <td>
          <div class="action-btn-group">
            <button class="btn-icon-action btn-view-action" data-action="view-details" data-id="${project.id}" title="View Complete Client Details">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <a href="${waLink}" target="_blank" class="btn-icon-action btn-whatsapp-direct" title="Chat on WhatsApp">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </a>
            <button class="btn-icon-action btn-delete-action" data-action="delete-project" data-id="${project.id}" title="Delete Registration">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
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

      const delBtn = tr.querySelector('[data-action="delete-project"]');
      delBtn.addEventListener('click', () => {
        this.confirmAndDeleteProject(project.id, project.fullName);
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
    const p = this.projects.find(x => x.id === projectId || x.referenceToken === projectId);
    if (p) p.status = newStatus;

    const localList = this.getLocalProjects();
    const localP = localList.find(x => x.id === projectId || x.referenceToken === projectId);
    if (localP) {
      localP.status = newStatus;
      localStorage.setItem('elyra_projects_db', JSON.stringify(localList));
    }

    this.renderStats();
    this.renderProjectsTable();
  }

  async confirmAndDeleteProject(projectId, clientName) {
    if (!confirm(`Are you sure you want to delete registration for "${clientName}" (${projectId})? This action cannot be undone.`)) {
      return;
    }

    try {
      await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
    } catch (e) {}

    this.projects = this.projects.filter(x => x.id !== projectId && x.referenceToken !== projectId);
    const localList = this.getLocalProjects().filter(x => x.id !== projectId && x.referenceToken !== projectId);
    localStorage.setItem('elyra_projects_db', JSON.stringify(localList));

    this.closeDetailModal();
    await this.fetchStats();
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
          No registration alerts.
        </div>
      `;
      return;
    }

    this.notifications.forEach(notif => {
      const item = document.createElement('div');
      item.className = `notif-item ${notif.read ? '' : 'unread'}`;
      const timeAgo = this.formatTimeAgo(notif.createdAt);

      item.innerHTML = `
        <div class="notif-bell-icon">✦</div>
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
        const project = this.projects.find(p => p.id === notif.projectId || p.referenceToken === notif.projectId);
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

    const refToken = project.referenceToken || project.registrationNumber || project.id;
    if (this.detailModalTitle) {
      this.detailModalTitle.textContent = `${refToken} — ${project.fullName}`;
    }

    const cleanPhone = (project.phone || '').replace(/[^0-9+]/g, '');
    const waLink = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(`Hi ${project.fullName}! This is ELYRA Visual Studio regarding your registration ${refToken}.`)}`;

    const dateFormatted = new Date(project.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const timeFormatted = new Date(project.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const currentStatus = project.status || 'Pending';

    this.detailModalBody.innerHTML = `
      <div class="detail-section">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
          <div class="modal-ref-badge">
            <span style="font-size:0.75rem; color:var(--color-text-muted); font-weight:700; text-transform:uppercase; display:block;">Reference Token / Registration Number</span>
            <strong style="font-size:1.15rem; color:var(--color-gold); letter-spacing:0.04em;">${refToken}</strong>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <label style="font-size:0.8rem; font-weight:700; color:var(--color-forest);" for="modal-status-select">Status:</label>
            <select id="modal-status-select" class="status-change-select status-${currentStatus.toLowerCase().replace(/\s+/g, '-')}">
              <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Approved" ${currentStatus === 'Approved' ? 'selected' : ''}>Approved</option>
              <option value="In Progress" ${currentStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Completed" ${currentStatus === 'Completed' ? 'selected' : ''}>Completed</option>
              <option value="Rejected" ${currentStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          </div>
        </div>

        <h5>Complete Client Information</h5>
        <div class="client-meta-grid">
          <div>
            <span class="meta-field-label">Full Name</span>
            <div class="meta-field-value">${project.fullName}</div>
          </div>
          <div>
            <span class="meta-field-label">Business / Brand Name</span>
            <div class="meta-field-value">${project.businessName || 'Individual Client'}</div>
          </div>
          <div>
            <span class="meta-field-label">Phone / WhatsApp</span>
            <div>
              <a href="${waLink}" target="_blank" style="color:var(--color-emerald); font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                ${project.phone}
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          </div>
          <div>
            <span class="meta-field-label">Email Address</span>
            <div class="meta-field-value">${project.email || 'Not provided'}</div>
          </div>
          <div>
            <span class="meta-field-label">Address / Location</span>
            <div class="meta-field-value">${project.address || 'Not specified'}</div>
          </div>
          <div>
            <span class="meta-field-label">Preferred Timeline</span>
            <div class="meta-field-value">${project.timeline || 'Flexible'}</div>
          </div>
          <div>
            <span class="meta-field-label">Registration Date</span>
            <div class="meta-field-value">${dateFormatted}</div>
          </div>
          <div>
            <span class="meta-field-label">Registration Time</span>
            <div class="meta-field-value">${timeFormatted}</div>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h5>Selected Work & Services</h5>
        <div class="services-tag-list" style="max-width:100%;">
          ${(project.services || project.selectedWork || []).map(s => `<span class="service-tag" style="font-size:0.88rem; padding:0.4rem 0.85rem;">${s}</span>`).join('')}
        </div>
      </div>

      <div class="detail-section">
        <h5>Application Requirements & Project Brief</h5>
        <div class="detail-req-box">${project.requirements || 'No additional requirements provided.'}</div>
      </div>

      <div class="detail-section">
        <h5>Internal Studio Notes</h5>
        <textarea id="modal-project-notes" class="notes-textarea" placeholder="Add private admin follow-up notes, client discussions, or milestones...">${project.notes || ''}</textarea>
        <div style="margin-top:0.6rem; display:flex; justify-content:flex-end;">
          <button class="admin-btn-primary" id="save-notes-btn" style="width:auto; padding:0.45rem 1.25rem; font-size:0.85rem;">Save Notes</button>
        </div>
      </div>

      <div class="modal-bottom-actions">
        <button class="admin-btn-danger" id="modal-delete-btn">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          <span>Delete Registration</span>
        </button>
        <div style="display:flex; gap:0.5rem;">
          <a href="${waLink}" target="_blank" class="admin-btn-secondary" style="color:var(--color-emerald); font-weight:700;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>WhatsApp Client</span>
          </a>
          <button class="admin-btn-secondary" data-action="close-admin-modal">Close</button>
        </div>
      </div>
    `;

    const statusModalSelect = this.detailModalBody.querySelector('#modal-status-select');
    if (statusModalSelect) {
      statusModalSelect.addEventListener('change', async (e) => {
        await this.updateProjectStatus(project.id, e.target.value);
        statusModalSelect.className = `status-change-select status-${e.target.value.toLowerCase().replace(/\s+/g, '-')}`;
      });
    }

    const saveBtn = this.detailModalBody.querySelector('#save-notes-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const notes = document.getElementById('modal-project-notes').value;
        await this.saveProjectNotes(project.id, notes);
        saveBtn.textContent = 'Notes Saved ✓';
        setTimeout(() => { saveBtn.textContent = 'Save Notes'; }, 2000);
      });
    }

    const deleteBtn = this.detailModalBody.querySelector('#modal-delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        this.confirmAndDeleteProject(project.id, project.fullName);
      });
    }

    const closeBtn = this.detailModalBody.querySelector('[data-action="close-admin-modal"]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDetailModal());
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

    const p = this.projects.find(x => x.id === projectId || x.referenceToken === projectId);
    if (p) p.notes = notes;

    const list = this.getLocalProjects();
    const lp = list.find(x => x.id === projectId || x.referenceToken === projectId);
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
        id: "ELYRA-2026-0001",
        referenceToken: "ELYRA-2026-0001",
        registrationNumber: "ELYRA-2026-0001",
        fullName: "Kavitha R.",
        businessName: "Aura Botanical Skincare",
        phone: "+91 98765 43210",
        email: "contact@aurabotanicals.in",
        address: "Bengaluru, Karnataka",
        services: ["Branding", "Logo Design", "Visiting Card"],
        requirements: "We need a complete earthy, premium visual identity for our organic skincare line, including primary logo, secondary badge, visiting cards and brand color guidelines.",
        timeline: "2-3 weeks",
        status: "In Progress",
        notes: "Initial brand moodboard approved.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "ELYRA-2026-0002",
        referenceToken: "ELYRA-2026-0002",
        registrationNumber: "ELYRA-2026-0002",
        fullName: "Vikram Mehta",
        businessName: "Apex Logistics Tech",
        phone: "+91 91234 56789",
        email: "vikram@apexlogistics.io",
        address: "Mumbai, Maharashtra",
        services: ["Website", "Web Page / Landing Page"],
        requirements: "Modern responsive website for our B2B tech logistics platform with interactive dashboard preview and lead capture flow.",
        timeline: "1 month",
        status: "Pending",
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
        title: "New Client Registration",
        message: "Vikram Mehta registered for Apex Logistics Tech [ELYRA-2026-0002]",
        clientName: "Vikram Mehta",
        services: ["Website", "Web Page / Landing Page"],
        projectId: "ELYRA-2026-0002",
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
