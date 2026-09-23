// ELYRA Visual Studio — Main Interactive Engine
// Navigation, Portfolio Filtering, Preview Modals, Scroll Animations & Contact Handlers

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initPortfolioGallery();
  initServiceModals();
  initScrollAnimations();
  initContactQuickForm();
  initAdminModal();
});

// ==========================================
// 1. STICKY NAVBAR & MOBILE MENU
// ==========================================
function initNavbar() {
  const navbar = document.getElementById('main-header');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  // Scroll glass state
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile Hamburger Toggle
  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburgerBtn.classList.toggle('active', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('drawer-open', isOpen);
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('drawer-open');
      });
    });
  }

  // Smooth Active Nav Link Observer
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.desktop-nav a');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const currentId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${currentId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(sec => navObserver.observe(sec));
}

// ==========================================
// 2. PORTFOLIO GALLERY & PREVIEW MODAL
// ==========================================
function initPortfolioGallery() {
  const galleryGrid = document.getElementById('portfolio-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const previewModal = document.getElementById('portfolio-preview-modal');

  if (!galleryGrid || typeof PORTFOLIO_PROJECTS === 'undefined') return;

  // Render Project Cards
  function renderProjects(category = 'all') {
    galleryGrid.innerHTML = '';

    const filtered = category === 'all'
      ? PORTFOLIO_PROJECTS
      : PORTFOLIO_PROJECTS.filter(p => p.categoryKey === category || p.category.toLowerCase() === category.toLowerCase());

    filtered.forEach((project, idx) => {
      const card = document.createElement('div');
      card.className = 'portfolio-card fade-in-up';
      card.style.animationDelay = `${idx * 0.08}s`;
      card.setAttribute('data-category', project.categoryKey);

      card.innerHTML = `
        <div class="card-media-wrapper">
          ${getProjectVisualSVG(project.visualType, 500, 320)}
          <div class="card-badge">${project.badge || project.category}</div>
          <div class="card-hover-overlay">
            <span class="preview-cta">
              <span>View Case Study</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </div>
        </div>
        <div class="card-body">
          <div class="card-category-tag">${project.tag}</div>
          <h3 class="card-title">${project.title}</h3>
          <p class="card-desc">${project.description}</p>
        </div>
      `;

      card.addEventListener('click', () => openProjectModal(project));
      galleryGrid.appendChild(card);
    });
  }

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      renderProjects(cat);
    });
  });

  // Initial render
  renderProjects('all');

  // Preview Modal
  function openProjectModal(project) {
    if (!previewModal) return;

    const modalBody = document.getElementById('preview-modal-content');
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="preview-hero-visual">
          ${getProjectVisualSVG(project.visualType, 800, 420)}
        </div>
        <div class="preview-details-container">
          <div class="preview-header-meta">
            <div>
              <span class="preview-cat-badge">${project.category}</span>
              <h2 class="preview-title">${project.title}</h2>
              <p class="preview-subtitle">${project.subtitle}</p>
            </div>
            <div class="preview-client-box">
              <div class="meta-item">
                <span class="meta-label">Client</span>
                <span class="meta-val">${project.client}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Timeline</span>
                <span class="meta-val">${project.timeline}</span>
              </div>
            </div>
          </div>

          <div class="preview-description-section">
            <h4>Overview & Creative Strategy</h4>
            <p>${project.description} Engineered with precision craft, balancing timeless aesthetics with contemporary visual resonance.</p>
          </div>

          <div class="preview-deliverables-section">
            <h4>Project Deliverables</h4>
            <div class="deliverables-grid">
              ${project.deliverables.map(d => `
                <div class="deliverable-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>${d}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="preview-palette-section">
            <h4>Brand Palette</h4>
            <div class="preview-color-chips">
              ${project.colors.map(c => `
                <div class="color-chip-wrap">
                  <span class="color-chip" style="background-color: ${c}"></span>
                  <span class="color-chip-hex">${c}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="preview-modal-actions">
            <button class="btn btn-gold" id="btn-request-similar">
              <span>Start a Similar Project</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button class="btn btn-outline" data-action="close-preview-modal">Close Preview</button>
          </div>
        </div>
      `;

      // Hook up Similar Project CTA
      modalBody.querySelector('#btn-request-similar').addEventListener('click', () => {
        closePreviewModal();
        if (window.elyraBuilder) {
          window.elyraBuilder.open(project.category);
        }
      });

      modalBody.querySelector('[data-action="close-preview-modal"]').addEventListener('click', closePreviewModal);
    }

    previewModal.classList.add('active');
    document.body.classList.add('modal-locked');
  }

  function closePreviewModal() {
    if (!previewModal) return;
    previewModal.classList.remove('active');
    document.body.classList.remove('modal-locked');
  }

  document.querySelectorAll('[data-action="close-preview-modal"]').forEach(btn => {
    btn.addEventListener('click', closePreviewModal);
  });
}

// ==========================================
// 3. SERVICE CARDS & "LEARN MORE" MODALS
// ==========================================
const SERVICE_DETAILS = {
  "logo-design": {
    title: "Logo Design",
    tagline: "Distinctive brand marks and timeless monograms",
    description: "Your logo is the cornerstone of your brand identity. We craft bespoke vector logos, monograms, and emblem marks that resonate with your target audience across print and digital media.",
    deliverables: ["Primary & Secondary Logo Marks", "Monogram & Sub-mark Variations", "Vector Source Files (AI, SVG, EPS, PNG)", "Light & Dark Mode Asset Variations", "Basic Brand Usage Cheat Sheet"],
    timeline: "1-2 Weeks"
  },
  "banner-design": {
    title: "Banner Design",
    tagline: "High-impact visual communication for digital & print",
    description: "Whether you need digital ad banners for Google/Meta campaigns, website hero banners, or trade show backdrops, we design creative that demands attention.",
    deliverables: ["High-Resolution Display Banners", "Social Platform Formats (16:9, 1:1, 9:16)", "Print-Ready Vector Files with Bleeds", "Promotional Campaign Variants"],
    timeline: "3-5 Days"
  },
  "poster-social": {
    title: "Poster & Social Media Design",
    tagline: "Modern promotional posters and engaging social creatives",
    description: "Transform your social feed and event presence with cohesive, editorial-grade creative designs built for high engagement.",
    deliverables: ["Editorial Event Posters", "Instagram Carousel Templates", "Story & Reel Static Covers", "LinkedIn/Twitter Infographics"],
    timeline: "4-7 Days"
  },
  "branding": {
    title: "Branding & Identity System",
    tagline: "Consistent visual identity and complete brand systems",
    description: "From color theory and typography hierarchy to packaging architecture and comprehensive brand guideline books, we build cohesive brand worlds.",
    deliverables: ["Full Brand Identity System", "Custom Typography & Palette Guidelines", "Stationery & Collateral Guidelines", "Brand Strategy & Voice Blueprint", "Comprehensive Brand Stylebook (PDF)"],
    timeline: "3-4 Weeks"
  },
  "visiting-card": {
    title: "Visiting Card & Stationery",
    tagline: "Executive stationery with tactile luxury finishes",
    description: "Make a powerful first impression in every handshake with exquisitely designed business cards, letterheads, and envelope suites.",
    deliverables: ["Double-Sided Business Card Layouts", "Special Finish Die-lines (Foil, Spot UV, Emboss)", "Letterhead & Corporate Envelope Mockups", "Commercial Print Ready PDF Files"],
    timeline: "3-5 Days"
  },
  "website": {
    title: "Complete Website",
    tagline: "Full responsive multi-page websites for modern brands",
    description: "We design and build bespoke, high-performance responsive websites with modern visual aesthetics, rapid load speeds, and engaging micro-interactions.",
    deliverables: ["Multi-Page Responsive Architecture", "Tailored Design System & Interactive UI", "Mobile & Tablet Optimization", "SEO Metadata & Performance Tuning", "Contact & WhatsApp Integrations"],
    timeline: "2-4 Weeks"
  },
  "landing-page": {
    title: "Web Page / Landing Page",
    tagline: "High-conversion single page websites and product launches",
    description: "Focused single-page destinations engineered to turn visitors into paying clients with high-clarity copy, engaging bento layouts, and streamlined CTAs.",
    deliverables: ["High-Conversion Single Page Layout", "Engaging Hero & Feature Bento Grids", "Lead Capture Form Integration", "Ultra-Fast 95+ PageSpeed Architecture"],
    timeline: "1-2 Weeks"
  },
  "qr-web-page": {
    title: "QR Scanner Web Page",
    tagline: "Instant mobile landing pages designed for QR discovery",
    description: "Frictionless web experiences accessed instantaneously via QR code. Perfect for digital menus, product authenticity checks, event guides, and instant WhatsApp ordering.",
    deliverables: ["Instant-Load Mobile First Web App", "Direct WhatsApp / Call Integration", "Custom Branded QR Code Graphics", "Table Standee / Sticker Print Mockups"],
    timeline: "3-5 Days"
  }
};

function initServiceModals() {
  const serviceModal = document.getElementById('service-info-modal');
  const serviceTitle = document.getElementById('service-modal-title');
  const serviceTagline = document.getElementById('service-modal-tagline');
  const serviceDesc = document.getElementById('service-modal-desc');
  const serviceDeliverables = document.getElementById('service-modal-deliverables');
  const serviceTimeline = document.getElementById('service-modal-timeline');
  const serviceCta = document.getElementById('service-modal-cta');

  document.querySelectorAll('[data-action="open-service-modal"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceKey = btn.getAttribute('data-service-key');
      const data = SERVICE_DETAILS[serviceKey];
      if (!data || !serviceModal) return;

      serviceTitle.textContent = data.title;
      serviceTagline.textContent = data.tagline;
      serviceDesc.textContent = data.description;
      serviceTimeline.textContent = data.timeline;

      serviceDeliverables.innerHTML = data.deliverables.map(d => `
        <div class="service-deliv-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>${d}</span>
        </div>
      `).join('');

      serviceCta.onclick = () => {
        closeServiceModal();
        if (window.elyraBuilder) {
          window.elyraBuilder.open(data.title);
        }
      };

      serviceModal.classList.add('active');
      document.body.classList.add('modal-locked');
    });
  });

  function closeServiceModal() {
    if (!serviceModal) return;
    serviceModal.classList.remove('active');
    document.body.classList.remove('modal-locked');
  }

  document.querySelectorAll('[data-action="close-service-modal"]').forEach(btn => {
    btn.addEventListener('click', closeServiceModal);
  });
}

// ==========================================
// 4. SCROLL REVEAL ANIMATIONS
// ==========================================
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });
}

// ==========================================
// 5. CONTACT QUICK FORM
// ==========================================
function initContactQuickForm() {
  const form = document.getElementById('quick-contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameEl = document.getElementById('quick-name');
    const phoneEl = document.getElementById('quick-phone');
    const msgEl = document.getElementById('quick-message');

    const name = nameEl ? nameEl.value.trim() : '';
    const phone = phoneEl ? phoneEl.value.trim() : '';
    const message = msgEl ? msgEl.value.trim() : '';

    if (!name || !phone) {
      if (window.elyraBuilder) {
        window.elyraBuilder.showToast('Please provide your name and phone number.', 'warning');
      }
      return;
    }

    const lines = [
      '━━━━━━━━━━━━━━━━',
      'ELYRA VISUAL STUDIO',
      'QUICK STUDIO ENQUIRY',
      '━━━━━━━━━━━━━━━━',
      '',
      'CLIENT DETAILS',
      `Name: ${name}`,
      `Phone: ${phone}`,
      ''
    ];

    if (message) {
      lines.push('ENQUIRY NOTE');
      lines.push(message);
      lines.push('');
    }

    lines.push('━━━━━━━━━━━━━━━━');
    lines.push('END OF ENQUIRY');
    lines.push('━━━━━━━━━━━━━━━━');

    const text = encodeURIComponent(lines.join('\n'));
    const waUrl = `https://wa.me/919345768934?text=${text}`;
    
    if (window.elyraBuilder) {
      window.elyraBuilder.showToast('Connecting to studio WhatsApp (+91 93457 68934)...', 'success');
    }

    const waWindow = window.open(waUrl, '_blank');
    if (!waWindow || waWindow.closed || typeof waWindow.closed === 'undefined') {
      window.location.href = waUrl;
    }
    form.reset();
  });
}

// ==========================================
// 6. ADMIN PORTAL LOGIN MODAL & ROUTING
// ==========================================
function initAdminModal() {
  const modal = document.getElementById('home-admin-modal');
  const form = document.getElementById('home-admin-login-form');
  const emailInput = document.getElementById('home-admin-email');
  const passInput = document.getElementById('home-admin-pass');
  const errorBox = document.getElementById('home-admin-error');
  const submitBtn = document.getElementById('home-admin-submit-btn');

  document.querySelectorAll('[data-action="open-admin-login-modal"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-locked');
        if (errorBox) errorBox.style.display = 'none';
        if (emailInput) {
          emailInput.value = 'elyravisualstudio@gmail.com';
          if (passInput) passInput.focus();
        }
      }
    });
  });

  document.querySelectorAll('[data-action="close-admin-modal"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-locked');
      }
    });
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-locked');
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passInput ? passInput.value : '';

      if (!email || !password) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Verifying...</span>`;
      }

      let loginSuccess = false;

      // Try Node backend
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username: email, password })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            localStorage.setItem('elyra_admin_token', data.token);
            localStorage.setItem('elyra_admin_email', email);
            loginSuccess = true;
          }
        }
      } catch (err) {}

      // Fallback static auth for GitHub pages
      if (!loginSuccess) {
        const validEmails = ['elyravisualstudio@gmail.com', 'admin'];
        if (validEmails.includes(email.toLowerCase()) && (password === 'elyra2026!secure' || password === 'admin')) {
          localStorage.setItem('elyra_admin_token', 'elyra_static_token_valid');
          localStorage.setItem('elyra_admin_email', email);
          loginSuccess = true;
        }
      }

      if (loginSuccess) {
        if (window.elyraBuilder) {
          window.elyraBuilder.showToast('Admin login successful! Opening Admin Portal...', 'success');
        }
        setTimeout(() => {
          window.location.href = './admin/index.html';
        }, 500);
      } else {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <span>Login & Open Admin Portal</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          `;
        }
        if (errorBox) {
          errorBox.textContent = 'Invalid credentials. Please enter your designated admin email (elyravisualstudio@gmail.com) and secure password.';
          errorBox.style.display = 'block';
        }
      }
    });
  }
}
