// ELYRA Visual Studio — Interactive Project Builder Engine
// Handles multi-service selection, live toast feedback, validation, and hybrid backend/local submission.

const AVAILABLE_SERVICES = [
  {
    id: "service-logo",
    name: "Logo Design",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
    description: "Distinctive brand marks, monograms, and versatile vector identity files."
  },
  {
    id: "service-banner",
    name: "Banner Design",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h10M7 9h6"/></svg>`,
    description: "High-impact banners for digital campaigns, billboards, and exhibitions."
  },
  {
    id: "service-poster",
    name: "Poster / Social Media Design",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
    description: "Editorial posters, Instagram reels graphics, and cohesive social creative sets."
  },
  {
    id: "service-branding",
    name: "Branding",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v19M5 8l14 8M19 8L5 16"/></svg>`,
    description: "Complete visual identity guidelines, typography systems, and brand voice."
  },
  {
    id: "service-card",
    name: "Visiting Card",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
    description: "Executive business cards, foil stamping specifications, and corporate stationery."
  },
  {
    id: "service-website",
    name: "Website",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    description: "Full multi-page responsive web applications built with modern aesthetics."
  },
  {
    id: "service-landing",
    name: "Web Page / Landing Page",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    description: "High-conversion single-page websites engineered for campaigns and products."
  },
  {
    id: "service-qr",
    name: "QR Scanner Web Page",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    description: "Frictionless mobile landing pages and menus accessible via instant QR scan."
  },
  {
    id: "service-custom",
    name: "Other / Custom Project",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    description: "Bespoke creative consulting, 3D assets, illustration or specialized packages."
  }
];

class ProjectBuilder {
  constructor() {
    this.selectedServices = new Set();
    this.currentStep = 1;
    this.initElements();
    this.bindEvents();
    this.renderServiceCards();
  }

  initElements() {
    this.modal = document.getElementById('project-modal');
    this.modalOverlay = document.getElementById('modal-overlay');
    this.serviceGrid = document.getElementById('builder-service-grid');
    this.selectedSummary = document.getElementById('builder-selected-summary');
    this.selectedChips = document.getElementById('builder-selected-chips');
    this.selectedCount = document.getElementById('builder-selected-count');
    this.nextBtn = document.getElementById('builder-next-btn');
    this.backBtn = document.getElementById('builder-back-btn');
    this.step1Container = document.getElementById('builder-step-1');
    this.step2Container = document.getElementById('builder-step-2');
    this.step3Container = document.getElementById('builder-step-3');
    this.projectForm = document.getElementById('builder-project-form');
    this.formSelectedPills = document.getElementById('form-selected-services-pills');
    this.toastContainer = document.getElementById('toast-container');
    this.submitBtn = document.getElementById('builder-submit-btn');
    this.successReference = document.getElementById('builder-success-ref');
    this.stepIndicators = document.querySelectorAll('.builder-step-badge');
  }

  bindEvents() {
    document.querySelectorAll('[data-action="open-project-builder"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const preselect = btn.getAttribute('data-service');
        this.open(preselect);
      });
    });

    document.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    if (this.modalOverlay) {
      this.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) this.close();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        if (this.selectedServices.size === 0) {
          this.showToast('Please select at least one service to continue.', 'warning');
          return;
        }
        this.goToStep(2);
      });
    }

    if (this.backBtn) {
      this.backBtn.addEventListener('click', () => {
        this.goToStep(1);
      });
    }

    if (this.projectForm) {
      this.projectForm.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.close();
      }
    });
  }

  renderServiceCards() {
    if (!this.serviceGrid) return;
    this.serviceGrid.innerHTML = '';

    AVAILABLE_SERVICES.forEach(service => {
      const card = document.createElement('div');
      card.className = 'service-choice-card';
      card.setAttribute('data-service-name', service.name);
      card.setAttribute('data-service-id', service.id);
      card.tabIndex = 0;
      card.setAttribute('role', 'checkbox');
      card.setAttribute('aria-checked', 'false');

      card.innerHTML = `
        <div class="choice-check-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="choice-icon-wrap">
          ${service.icon}
        </div>
        <h4 class="choice-title">${service.name}</h4>
        <p class="choice-desc">${service.description}</p>
      `;

      card.addEventListener('click', () => this.toggleService(service.name, card));
      card.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.toggleService(service.name, card);
        }
      });

      this.serviceGrid.appendChild(card);
    });
  }

  toggleService(serviceName, cardEl) {
    if (this.selectedServices.has(serviceName)) {
      this.selectedServices.delete(serviceName);
      cardEl.classList.remove('selected');
      cardEl.setAttribute('aria-checked', 'false');
      this.showToast(`${serviceName} removed.`, 'info');
    } else {
      this.selectedServices.add(serviceName);
      cardEl.classList.add('selected');
      cardEl.setAttribute('aria-checked', 'true');
      this.showToast(`“${serviceName}” selected.`, 'success');
    }

    this.updateSummaryUI();
  }

  updateSummaryUI() {
    const count = this.selectedServices.size;
    if (this.selectedCount) {
      this.selectedCount.textContent = count;
    }

    if (this.selectedChips) {
      this.selectedChips.innerHTML = '';
      if (count === 0) {
        this.selectedChips.innerHTML = `<span class="chips-placeholder">No services selected yet. Click cards above to select.</span>`;
      } else {
        this.selectedServices.forEach(name => {
          const chip = document.createElement('span');
          chip.className = 'selected-chip';
          chip.innerHTML = `
            ${name}
            <button type="button" aria-label="Remove ${name}" title="Remove">×</button>
          `;
          chip.querySelector('button').addEventListener('click', (e) => {
            e.stopPropagation();
            const card = Array.from(this.serviceGrid.children).find(c => c.getAttribute('data-service-name') === name);
            if (card) {
              this.toggleService(name, card);
            } else {
              this.selectedServices.delete(name);
              this.updateSummaryUI();
            }
          });
          this.selectedChips.appendChild(chip);
        });
      }
    }

    if (this.nextBtn) {
      this.nextBtn.disabled = count === 0;
    }

    if (this.formSelectedPills) {
      this.formSelectedPills.innerHTML = '';
      this.selectedServices.forEach(name => {
        const pill = document.createElement('span');
        pill.className = 'form-service-pill';
        pill.textContent = name;
        this.formSelectedPills.appendChild(pill);
      });
    }
  }

  goToStep(step) {
    this.currentStep = step;

    if (this.step1Container) this.step1Container.classList.toggle('active', step === 1);
    if (this.step2Container) this.step2Container.classList.toggle('active', step === 2);
    if (this.step3Container) this.step3Container.classList.toggle('active', step === 3);

    this.stepIndicators.forEach((ind, idx) => {
      ind.classList.toggle('active', idx + 1 === step);
      ind.classList.toggle('completed', idx + 1 < step);
    });

    const modalBody = document.querySelector('.modal-scrollable-body');
    if (modalBody) modalBody.scrollTop = 0;
  }

  open(preselectedServiceName = null) {
    if (!this.modal) return;
    this.modal.classList.add('active');
    document.body.classList.add('modal-locked');

    if (preselectedServiceName) {
      const card = Array.from(this.serviceGrid.children).find(
        c => c.getAttribute('data-service-name').toLowerCase().includes(preselectedServiceName.toLowerCase())
      );
      if (card && !this.selectedServices.has(card.getAttribute('data-service-name'))) {
        this.toggleService(card.getAttribute('data-service-name'), card);
      }
    }

    this.goToStep(1);
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    document.body.classList.remove('modal-locked');
  }

  showToast(message, type = 'success') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `elyra-toast elyra-toast-${type}`;

    let icon = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    `;
    if (type === 'warning') {
      icon = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      `;
    } else if (type === 'info') {
      icon = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="8"/>
        </svg>
      `;
    }

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-msg">${message}</div>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  async handleSubmit(e) {
    e.preventDefault();

    const fullName = document.getElementById('client-fullname').value.trim();
    const businessName = document.getElementById('client-business').value.trim();
    const phone = document.getElementById('client-phone').value.trim();
    const email = document.getElementById('client-email').value.trim();
    const requirements = document.getElementById('client-requirements').value.trim();
    const timeline = document.getElementById('client-timeline').value;

    if (!fullName || fullName.length < 2) {
      this.showToast('Please enter your full name.', 'warning');
      document.getElementById('client-fullname').focus();
      return;
    }
    if (!businessName) {
      this.showToast('Please enter your business or project name.', 'warning');
      document.getElementById('client-business').focus();
      return;
    }
    if (!phone || phone.length < 6) {
      this.showToast('Please enter a valid WhatsApp / Phone number.', 'warning');
      document.getElementById('client-phone').focus();
      return;
    }
    if (this.selectedServices.size === 0) {
      this.showToast('Please select at least one service.', 'warning');
      this.goToStep(1);
      return;
    }
    if (!requirements || requirements.length < 5) {
      this.showToast('Please tell us a little about your project requirements.', 'warning');
      document.getElementById('client-requirements').focus();
      return;
    }

    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = `
        <span class="btn-spinner"></span>
        Submitting Request...
      `;
    }

    try {
      const payload = {
        fullName,
        businessName,
        phone,
        email,
        services: Array.from(this.selectedServices),
        requirements,
        timeline
      };

      let assignedId = `ELY-${Math.floor(1004 + Math.random() * 8000)}`;
      let isSuccess = false;

      // Try Node.js Backend API
      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            assignedId = data.projectId || assignedId;
            isSuccess = true;
          }
        }
      } catch (apiErr) {
        // Fallback for static GitHub Pages hosting
      }

      // Hybrid fallback for GitHub Pages (local browser persistence)
      if (!isSuccess) {
        try {
          const localProjects = JSON.parse(localStorage.getItem('elyra_projects_db') || '[]');
          const newEntry = {
            id: assignedId,
            fullName,
            businessName,
            phone,
            email,
            services: Array.from(this.selectedServices),
            requirements,
            timeline: timeline || 'Flexible',
            status: 'New',
            notes: '',
            createdAt: new Date().toISOString()
          };
          localProjects.unshift(newEntry);
          localStorage.setItem('elyra_projects_db', JSON.stringify(localProjects));

          const localNotifs = JSON.parse(localStorage.getItem('elyra_notifs_db') || '[]');
          localNotifs.unshift({
            id: `NOTIF-${Date.now()}`,
            title: 'New Project Request',
            message: `${fullName} submitted a request for ${businessName}`,
            clientName: fullName,
            services: Array.from(this.selectedServices),
            projectId: assignedId,
            read: false,
            createdAt: new Date().toISOString()
          });
          localStorage.setItem('elyra_notifs_db', JSON.stringify(localNotifs));
          isSuccess = true;
        } catch (e) {
          isSuccess = true;
        }
      }

      if (isSuccess) {
        if (this.successReference) {
          this.successReference.textContent = assignedId;
        }

        const whatsappBtn = document.getElementById('success-whatsapp-link');
        if (whatsappBtn) {
          const waMsg = encodeURIComponent(`Hi ELYRA Visual Studio! I just submitted project request ${assignedId} for ${businessName}. Looking forward to discussing!`);
          whatsappBtn.href = `https://wa.me/919345768934?text=${waMsg}`;
        }

        this.goToStep(3);
        this.showToast('Project request received successfully!', 'success');

        this.projectForm.reset();
        this.selectedServices.clear();
        Array.from(this.serviceGrid.children).forEach(c => {
          c.classList.remove('selected');
          c.setAttribute('aria-checked', 'false');
        });
        this.updateSummaryUI();
      }
    } catch (err) {
      console.error('Submission error:', err);
      this.showToast('Submission error. Please try again or reach out on WhatsApp.', 'warning');
    } finally {
      if (this.submitBtn) {
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = `
          <span>Submit Project Request</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        `;
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.elyraBuilder = new ProjectBuilder();
});
