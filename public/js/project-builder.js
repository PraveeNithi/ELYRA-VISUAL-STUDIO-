// ELYRA Visual Studio — Interactive Project Builder Engine
// Handles multi-service selection, live toast feedback, dynamic 100% form harvesting, and direct WhatsApp routing (+91 9345768934)

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
    if (typeof document !== 'undefined') {
      this.initElements();
      this.bindEvents();
      this.renderServiceCards();
    }
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
    this.projectForm = document.getElementById('builder-project-form');
    this.formSelectedPills = document.getElementById('form-selected-services-pills');
    this.toastContainer = document.getElementById('toast-container');
    this.submitBtn = document.getElementById('builder-submit-btn');
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
          chip.innerHTML = `${name} <button type="button" aria-label="Remove ${name}" title="Remove">×</button>`;
          const btn = chip.querySelector('button');
          if (btn) {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const card = Array.from(this.serviceGrid.children).find(c => c.getAttribute('data-service-name') === name);
              if (card) {
                this.toggleService(name, card);
              } else {
                this.selectedServices.delete(name);
                this.updateSummaryUI();
              }
            });
          }
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

  /**
   * Helper: Determine clean human-readable label for any form element
   */
  getFieldLabel(el) {
    if (el.type === 'checkbox' || el.type === 'radio') {
      const nameAttr = el.getAttribute('name') || el.name;
      if (nameAttr) {
        return this.cleanLabelText(nameAttr);
      }
    }
    if (el.id) {
      const labelEl = document.querySelector(`label[for="${el.id}"]`);
      if (labelEl) {
        return this.cleanLabelText(labelEl.textContent);
      }
    }
    const parentLabel = el.closest('label');
    if (parentLabel) {
      const clone = parentLabel.cloneNode(true);
      clone.querySelectorAll('input, select, textarea').forEach(n => n.remove());
      const txt = clone.textContent.trim();
      if (txt) return this.cleanLabelText(txt);
    }
    if (el.getAttribute('name')) {
      return this.cleanLabelText(el.getAttribute('name'));
    }
    if (el.getAttribute('aria-label')) {
      return this.cleanLabelText(el.getAttribute('aria-label'));
    }
    if (el.getAttribute('placeholder')) {
      return this.cleanLabelText(el.getAttribute('placeholder').replace(/^e\.g\.\s*/i, ''));
    }
    if (el.id) {
      return this.cleanLabelText(
        el.id
          .replace(/^(client|builder)-/i, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase())
      );
    }
    return 'Field';
  }

  cleanLabelText(str) {
    if (!str) return '';
    return str
      .replace(/\s*\*\s*$/, '')
      .replace(/\s*\(optional\)\s*$/i, '')
      .replace(/\s*\(select all that apply\)\s*$/i, '')
      .replace(/:\s*$/, '')
      .trim();
  }

  /**
   * Universal Dynamic Form Harvester:
   * Captures 100% of all fields in the form dynamically.
   */
  collectAllFormData(formElement) {
    const rawData = {};

    // 1. Collect Step 1 Selected Services
    if (this.selectedServices && this.selectedServices.size > 0) {
      rawData['Selected Services'] = Array.from(this.selectedServices);
    }

    // 2. Collect all form controls
    const elements = Array.from(formElement.elements || formElement.querySelectorAll('input, select, textarea'));
    const groupedCheckboxes = {};
    const groupedRadios = {};

    elements.forEach(el => {
      if (!el || !el.tagName) return;
      const tag = el.tagName.toLowerCase();
      const type = (el.type || '').toLowerCase();
      if (type === 'submit' || type === 'button' || type === 'reset') return;

      const label = this.getFieldLabel(el);
      const nameKey = el.name || el.id || label;

      if (type === 'checkbox') {
        if (!groupedCheckboxes[nameKey]) {
          groupedCheckboxes[nameKey] = { label, values: [] };
        }
        if (el.checked) {
          const val = (el.value && el.value !== 'on')
            ? el.value
            : (el.nextElementSibling ? el.nextElementSibling.textContent.trim() : 'Selected');
          groupedCheckboxes[nameKey].values.push(val);
        }
        return;
      }

      if (type === 'radio') {
        if (!groupedRadios[nameKey]) {
          groupedRadios[nameKey] = { label, value: '' };
        }
        if (el.checked) {
          const val = el.value || (el.nextElementSibling ? el.nextElementSibling.textContent.trim() : '');
          groupedRadios[nameKey].value = val;
        }
        return;
      }

      if (tag === 'select') {
        if (el.selectedIndex >= 0) {
          const opt = el.options[el.selectedIndex];
          const val = opt ? (opt.textContent.trim() || opt.value.trim()) : '';
          if (val) {
            rawData[label] = val;
          }
        }
        return;
      }

      if (tag === 'input' || tag === 'textarea') {
        const val = el.value ? el.value.trim() : '';
        if (val) {
          rawData[label] = val;
        }
      }
    });

    // Merge multi-checkbox values
    Object.values(groupedCheckboxes).forEach(group => {
      if (group.values.length > 0) {
        rawData[group.label] = group.values;
      }
    });

    // Merge radio values
    Object.values(groupedRadios).forEach(group => {
      if (group.value) {
        rawData[group.label] = group.value;
      }
    });

    return rawData;
  }

  /**
   * Builds the formatted executive WhatsApp message containing 100% of data.
   */
  buildWhatsAppMessage(data) {
    const usedKeys = new Set();

    const consume = (pattern) => {
      for (const k of Object.keys(data)) {
        if (usedKeys.has(k)) continue;
        if (pattern.test(k)) {
          usedKeys.add(k);
          return { key: k, val: data[k] };
        }
      }
      return null;
    };

    const lines = [];

    // Header Box
    lines.push('━━━━━━━━━━━━━━━━');
    lines.push('ELYRA VISUAL STUDIO');
    lines.push('NEW PROJECT REQUEST');
    lines.push('━━━━━━━━━━━━━━━━');
    lines.push('');

    // --- CLIENT DETAILS ---
    const clientLines = [];
    const nameItem = consume(/^(full\s*)?name$/i);
    const phoneItem = consume(/phone|whatsapp|contact/i);
    const emailItem = consume(/email/i);
    const companyItem = consume(/company|business|brand/i);
    const locationItem = consume(/location|city|address/i);

    if (nameItem && nameItem.val) clientLines.push(`Name: ${nameItem.val}`);
    if (phoneItem && phoneItem.val) clientLines.push(`Phone: ${phoneItem.val}`);
    if (emailItem && emailItem.val) clientLines.push(`Email: ${emailItem.val}`);
    if (companyItem && companyItem.val) clientLines.push(`Company: ${companyItem.val}`);
    if (locationItem && locationItem.val) clientLines.push(`Location: ${locationItem.val}`);

    if (clientLines.length > 0) {
      lines.push('CLIENT DETAILS');
      clientLines.forEach(l => lines.push(l));
      lines.push('');
    }

    // --- PROJECT DETAILS ---
    const projectLines = [];
    const typeItem = consume(/project\s*type|category/i);
    const serviceItem = consume(/service/i);
    const pagesItem = consume(/page|deliverable/i);
    const featuresItem = consume(/feature|option/i);

    if (typeItem && typeItem.val) projectLines.push(`Project Type: ${typeItem.val}`);
    if (serviceItem && serviceItem.val) {
      if (Array.isArray(serviceItem.val)) {
        projectLines.push(`Service:\n${serviceItem.val.map(s => `• ${s}`).join('\n')}`);
      } else {
        projectLines.push(`Service: ${serviceItem.val}`);
      }
    }
    if (pagesItem && pagesItem.val) projectLines.push(`Pages: ${pagesItem.val}`);
    if (featuresItem && featuresItem.val) {
      if (Array.isArray(featuresItem.val)) {
        projectLines.push(`Features:\n${featuresItem.val.map(f => `• ${f}`).join('\n')}`);
      } else {
        projectLines.push(`Features: ${featuresItem.val}`);
      }
    }

    if (projectLines.length > 0) {
      lines.push('PROJECT DETAILS');
      projectLines.forEach(l => lines.push(l));
      lines.push('');
    }

    // --- DESIGN DETAILS ---
    const designLines = [];
    const styleItem = consume(/style|aesthetic/i);
    const colorsItem = consume(/colou?r/i);
    const refItem = consume(/reference|link|inspiration/i);

    if (styleItem && styleItem.val) designLines.push(`Style: ${styleItem.val}`);
    if (colorsItem && colorsItem.val) designLines.push(`Colours: ${colorsItem.val}`);
    if (refItem && refItem.val) designLines.push(`References: ${refItem.val}`);

    if (designLines.length > 0) {
      lines.push('DESIGN DETAILS');
      designLines.forEach(l => lines.push(l));
      lines.push('');
    }

    // --- BUDGET & TIMELINE ---
    const budgetLines = [];
    const budgetItem = consume(/budget|cost|pricing/i);
    const timelineItem = consume(/timeline|deadline|schedule/i);

    if (budgetItem && budgetItem.val) budgetLines.push(`Budget: ${budgetItem.val}`);
    if (timelineItem && timelineItem.val) budgetLines.push(`Deadline: ${timelineItem.val}`);

    if (budgetLines.length > 0) {
      lines.push('PROJECT DETAILS');
      budgetLines.forEach(l => lines.push(l));
      lines.push('');
    }

    // --- PROJECT REQUIREMENTS ---
    const reqItem = consume(/requirement|scope|goal|brief|vision|description/i);
    if (reqItem && reqItem.val) {
      lines.push('PROJECT REQUIREMENTS');
      lines.push(`${reqItem.val}`);
      lines.push('');
    }

    // --- ADDITIONAL REQUIREMENTS ---
    const addItem = consume(/additional|note|comment|remark|special/i);
    if (addItem && addItem.val) {
      lines.push('ADDITIONAL REQUIREMENTS');
      lines.push(`${addItem.val}`);
      lines.push('');
    }

    // --- 100% DATA PRESERVATION FOR ANY EXTRA/CUSTOM FIELDS ---
    const remainingKeys = Object.keys(data).filter(k => !usedKeys.has(k));
    if (remainingKeys.length > 0) {
      lines.push('ADDITIONAL DETAILS');
      remainingKeys.forEach(k => {
        const v = data[k];
        if (Array.isArray(v)) {
          lines.push(`${k}:`);
          v.forEach(item => lines.push(`• ${item}`));
        } else {
          lines.push(`${k}: ${v}`);
        }
      });
      lines.push('');
    }

    // Footer
    lines.push('━━━━━━━━━━━━━━━━');
    lines.push('END OF REQUIREMENTS');
    lines.push('━━━━━━━━━━━━━━━━');

    return lines.join('\n');
  }

  /**
   * Direct Form Submission Handler
   * Validates required inputs, extracts 100% form data, and immediately opens WhatsApp chat (+91 9345768934)
   */
  handleSubmit(e) {
    e.preventDefault();

    const fullNameEl = document.getElementById('client-fullname');
    const businessEl = document.getElementById('client-business');
    const phoneEl = document.getElementById('client-phone');
    const reqEl = document.getElementById('client-requirements');

    const fullName = fullNameEl ? fullNameEl.value.trim() : '';
    const businessName = businessEl ? businessEl.value.trim() : '';
    const phone = phoneEl ? phoneEl.value.trim() : '';
    const requirements = reqEl ? reqEl.value.trim() : '';

    if (this.selectedServices.size === 0) {
      this.showToast('Please select at least one service.', 'warning');
      this.goToStep(1);
      return;
    }
    if (!fullName || fullName.length < 2) {
      this.showToast('Please enter your full name.', 'warning');
      if (fullNameEl) fullNameEl.focus();
      return;
    }
    if (!businessName) {
      this.showToast('Please enter your company / business name.', 'warning');
      if (businessEl) businessEl.focus();
      return;
    }
    if (!phone || phone.length < 6) {
      this.showToast('Please enter a valid WhatsApp / Phone number.', 'warning');
      if (phoneEl) phoneEl.focus();
      return;
    }
    if (!requirements || requirements.length < 5) {
      this.showToast('Please describe your project requirements & goals.', 'warning');
      if (reqEl) reqEl.focus();
      return;
    }

    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = `
        <span class="btn-spinner"></span>
        <span>Connecting to WhatsApp...</span>
      `;
    }

    try {
      // 1. Extract 100% of all fields dynamically
      const formData = this.collectAllFormData(this.projectForm);

      // 2. Build full executive message
      const message = this.buildWhatsAppMessage(formData);

      // 3. Target WhatsApp Number
      const targetPhone = '919345768934';
      const encodedMsg = encodeURIComponent(message);
      const waUrl = `https://wa.me/${targetPhone}?text=${encodedMsg}`;

      this.showToast('Opening WhatsApp with your project brief...', 'success');

      // 4. Direct WhatsApp Launch
      const waWindow = window.open(waUrl, '_blank');
      if (!waWindow || waWindow.closed || typeof waWindow.closed === 'undefined') {
        window.location.href = waUrl;
      }

      // 5. Reset modal and selections
      setTimeout(() => {
        this.projectForm.reset();
        this.selectedServices.clear();
        Array.from(this.serviceGrid.children).forEach(c => {
          c.classList.remove('selected');
          c.setAttribute('aria-checked', 'false');
        });
        this.updateSummaryUI();
        this.close();
      }, 800);

    } catch (err) {
      console.error('WhatsApp dispatch error:', err);
      this.showToast('Error formatting message. Please message +91 9345768934 directly.', 'warning');
    } finally {
      if (this.submitBtn) {
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = `
          <span>Send Full Brief to WhatsApp</span>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/></svg>
        `;
      }
    }
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.elyraBuilder = new ProjectBuilder();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProjectBuilder, AVAILABLE_SERVICES };
}
