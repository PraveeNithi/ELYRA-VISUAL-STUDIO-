// ELYRA Visual Studio — Portfolio Projects Data
// Authentic studio case studies with vector visuals, color palettes and full deliverable breakdowns.

const PORTFOLIO_PROJECTS = [
  {
    id: "ely-proj-1",
    title: "Lumina Botanical Identity",
    category: "Branding",
    categoryKey: "branding",
    subtitle: "Complete Organic Brand Identity & Packaging Suite",
    description: "Holistic brand identity and sustainable packaging system designed for a luxury botanical skincare house.",
    tag: "Brand Identity",
    accentColor: "#D6A84F",
    colors: ["#12372A", "#D6A84F", "#F7F4EA", "#2E8B62"],
    deliverables: ["Visual Identity System", "Custom Typography", "Packaging Architecture", "Brand Guidelines Book"],
    client: "Lumina Botanicals",
    timeline: "4 Weeks",
    visualType: "branding",
    badge: "Featured Branding"
  },
  {
    id: "ely-proj-2",
    title: "Apex Dynamics Tech Portal",
    category: "Websites",
    categoryKey: "websites",
    subtitle: "Enterprise Logistics & Fleet Intelligence Platform",
    description: "High-performance responsive platform built with interactive fleet dashboards, live calculator, and dark-emerald aesthetics.",
    tag: "Full Website",
    accentColor: "#2E8B62",
    colors: ["#12372A", "#2E8B62", "#183027", "#D6A84F"],
    deliverables: ["Full Responsive Website", "Interactive Dashboard UI", "Custom SVG Iconography", "Lead Conversion Flow"],
    client: "Apex Dynamics Global",
    timeline: "3 Weeks",
    visualType: "website",
    badge: "Interactive UI"
  },
  {
    id: "ely-proj-3",
    title: "Zenith Executive Suite",
    category: "Visiting Cards",
    categoryKey: "visiting-cards",
    subtitle: "Premium Matte Velvet Business Card System",
    description: "Minimalist executive business stationery featuring gold foil stamping on heavy forest green cotton cardstock.",
    tag: "Print & Stationery",
    accentColor: "#D6A84F",
    colors: ["#12372A", "#D6A84F", "#F7F4EA"],
    deliverables: ["Executive Visiting Cards", "Letterhead Design", "Foil Stamping Die-lines", "Print Specs Guide"],
    client: "Zenith Capital Advisors",
    timeline: "1 Week",
    visualType: "visiting-card",
    badge: "Print Craft"
  },
  {
    id: "ely-proj-4",
    title: "Verde Artisan Coffee & Bistro",
    category: "QR Web Pages",
    categoryKey: "qr-web-pages",
    subtitle: "Instant Mobile QR Interactive Dining Experience",
    description: "Lightning-fast QR dining portal offering real-time menu categorization, dietary filters, and direct WhatsApp table ordering.",
    tag: "QR Experience",
    accentColor: "#2E8B62",
    colors: ["#12372A", "#2E8B62", "#F7F4EA", "#D6A84F"],
    deliverables: ["QR Scanner Web App", "Table Tent Standee Graphics", "WhatsApp Ordering Hook", "Instant PWA Cache"],
    client: "Verde Artisan Cafe",
    timeline: "5 Days",
    visualType: "qr-page",
    badge: "Instant QR"
  },
  {
    id: "ely-proj-5",
    title: "Aura Minimalist Studio Mark",
    category: "Logos",
    categoryKey: "logos",
    subtitle: "Timeless Monogram & Geometric Emblem",
    description: "Precision-crafted geometric monogram crafted with harmonic proportions for a contemporary architecture and interior studio.",
    tag: "Logo Design",
    accentColor: "#D6A84F",
    colors: ["#12372A", "#D6A84F", "#183027"],
    deliverables: ["Primary & Secondary Marks", "Monogram Variations", "Vector Source Assets", "Favicon & App Icon"],
    client: "Aura Architectural Studio",
    timeline: "2 Weeks",
    visualType: "logo",
    badge: "Monogram Design"
  },
  {
    id: "ely-proj-6",
    title: "Nova Horizon Product Launch",
    category: "Web Pages",
    categoryKey: "web-pages",
    subtitle: "High-Conversion SaaS Landing Page",
    description: "Sleek single-page conversion engine featuring glassmorphic feature bento-grids, interactive pricing toggle, and animated micro-interactions.",
    tag: "Landing Page",
    accentColor: "#2E8B62",
    colors: ["#12372A", "#2E8B62", "#D6A84F", "#F7F4EA"],
    deliverables: ["High-Conversion Landing Page", "Interactive Bento Grid", "Mobile First Layout", "Form Lead Generation"],
    client: "Nova Horizon Labs",
    timeline: "2 Weeks",
    visualType: "landing-page",
    badge: "Conversion UI"
  },
  {
    id: "ely-proj-7",
    title: "Velox Grand Exhibition",
    category: "Banners",
    categoryKey: "banners",
    subtitle: "Digital Display & Billboard Campaign",
    description: "High-impact visual banner campaign spanning ultra-wide digital displays, trade show backdrops, and digital ad sets.",
    tag: "Banner Campaign",
    accentColor: "#D6A84F",
    colors: ["#12372A", "#D6A84F", "#2E8B62", "#F7F4EA"],
    deliverables: ["Digital Display Banners", "Large Format Print Banners", "Social Display Ads", "Animated Billboard Specs"],
    client: "Velox Summit Expo",
    timeline: "1.5 Weeks",
    visualType: "banner",
    badge: "Large Format"
  },
  {
    id: "ely-proj-8",
    title: "Solis Soundwave Series",
    category: "Posters",
    categoryKey: "posters",
    subtitle: "Modernist Poster & Social Creative Suite",
    description: "Editorial typographic poster series and cohesive multi-platform Instagram/LinkedIn story layouts.",
    tag: "Poster & Social",
    accentColor: "#2E8B62",
    colors: ["#183027", "#2E8B62", "#D6A84F", "#F7F4EA"],
    deliverables: ["Editorial Event Posters", "Instagram Carousel Templates", "Story Motion Graphics", "Print Poster Files"],
    client: "Solis Collective",
    timeline: "1 Week",
    visualType: "poster",
    badge: "Creative Editorial"
  },
  {
    id: "ely-proj-9",
    title: "Chronos Heritage Watchmakers",
    category: "Branding",
    categoryKey: "branding",
    subtitle: "Luxury Horology Brand Identity & Emblem",
    description: "Refined luxury heritage branding fusing Swiss precision geometry with regal gold foil accents and bespoke serif typography.",
    tag: "Luxury Branding",
    accentColor: "#D6A84F",
    colors: ["#12372A", "#D6A84F", "#183027", "#F7F4EA"],
    deliverables: ["Heritage Emblem Mark", "Certificate of Authenticity", "Packaging Sleeve Design", "Digital Identity Assets"],
    client: "Chronos Timepieces",
    timeline: "3.5 Weeks",
    visualType: "branding-luxury",
    badge: "Luxury Suite"
  }
];

// Helper to generate dynamic SVG previews for each project type
function getProjectVisualSVG(type, width = 600, height = 380) {
  switch (type) {
    case 'branding':
      return `
        <svg viewBox="0 0 ${width} ${height}" class="project-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#12372A"/>
          <defs>
            <radialGradient id="gradBrand" cx="70%" cy="30%" r="80%">
              <stop offset="0%" stop-color="#2E8B62" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="#12372A" stop-opacity="1"/>
            </radialGradient>
            <linearGradient id="goldLumina" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F3E5AB"/>
              <stop offset="50%" stop-color="#D6A84F"/>
              <stop offset="100%" stop-color="#B8860B"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#gradBrand)"/>
          
          <!-- Decorative grid lines -->
          <line x1="60" y1="40" x2="60" y2="${height - 40}" stroke="#D6A84F" stroke-opacity="0.15" stroke-dasharray="4 4"/>
          <line x1="${width - 60}" y1="40" x2="${width - 60}" y2="${height - 40}" stroke="#D6A84F" stroke-opacity="0.15" stroke-dasharray="4 4"/>
          <line x1="40" y1="${height - 70}" x2="${width - 40}" y2="${height - 70}" stroke="#D6A84F" stroke-opacity="0.15"/>
          
          <!-- Central Brand Geometry -->
          <circle cx="${width/2}" cy="${height/2 - 25}" r="75" fill="none" stroke="url(#goldLumina)" stroke-width="1.5" stroke-dasharray="3 3"/>
          <circle cx="${width/2}" cy="${height/2 - 25}" r="65" fill="#183027" stroke="#2E8B62" stroke-width="1"/>
          
          <!-- Botanical stylized leaf symbol -->
          <path d="M${width/2} ${height/2 - 65} C${width/2 + 35} ${height/2 - 40} ${width/2 + 35} ${height/2} ${width/2} ${height/2 + 15} C${width/2 - 35} ${height/2} ${width/2 - 35} ${height/2 - 40} ${width/2} ${height/2 - 65} Z" fill="url(#goldLumina)" opacity="0.95"/>
          <path d="M${width/2} ${height/2 - 55} L${width/2} ${height/2 + 5}" stroke="#12372A" stroke-width="2"/>
          
          <!-- Typography -->
          <text x="${width/2}" y="${height/2 + 55}" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="22" font-weight="700" fill="#F7F4EA" letter-spacing="4">LUMINA</text>
          <text x="${width/2}" y="${height/2 + 75}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="500" fill="#D6A84F" letter-spacing="3">BOTANICAL IDENTITY SYSTEM</text>
          
          <!-- Palette Chips Bottom -->
          <rect x="60" y="${height - 50}" width="24" height="24" rx="6" fill="#12372A" stroke="#D6A84F" stroke-width="1"/>
          <rect x="92" y="${height - 50}" width="24" height="24" rx="6" fill="#D6A84F"/>
          <rect x="124" y="${height - 50}" width="24" height="24" rx="6" fill="#2E8B62"/>
          <rect x="156" y="${height - 50}" width="24" height="24" rx="6" fill="#F7F4EA"/>
          <text x="${width - 60}" y="${height - 34}" text-anchor="end" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#667A70">01 / BRAND SYSTEM</text>
        </svg>
      `;

    case 'website':
      return `
        <svg viewBox="0 0 ${width} ${height}" class="project-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#183027"/>
          <defs>
            <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#12372A"/>
              <stop offset="100%" stop-color="#0E231B"/>
            </linearGradient>
            <linearGradient id="emGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#2E8B62"/>
              <stop offset="100%" stop-color="#D6A84F"/>
            </linearGradient>
          </defs>
          
          <!-- Browser Window Frame -->
          <rect x="40" y="30" width="${width - 80}" height="${height - 60}" rx="12" fill="url(#screenGrad)" stroke="#2E8B62" stroke-opacity="0.4" stroke-width="1.5"/>
          
          <!-- Browser Header Bar -->
          <rect x="40" y="30" width="${width - 80}" height="32" rx="12" fill="#12372A"/>
          <path d="M40 50 H${width - 40} V62 H40 Z" fill="#12372A"/>
          <circle cx="62" cy="46" r="4" fill="#FF5F56"/>
          <circle cx="76" cy="46" r="4" fill="#FFBD2E"/>
          <circle cx="90" cy="46" r="4" fill="#27C93F"/>
          <rect x="120" y="38" width="${width - 240}" height="16" rx="4" fill="#183027" stroke="#2E8B62" stroke-opacity="0.3"/>
          <text x="${width/2}" y="50" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" fill="#667A70">https://apex-dynamics.io</text>
          
          <!-- Web Content Mockup -->
          <!-- Navbar Mock -->
          <text x="70" y="90" font-family="'Outfit', sans-serif" font-size="14" font-weight="700" fill="#D6A84F">APEX // DYNAMICS</text>
          <rect x="${width - 150}" y="78" width="70" height="18" rx="9" fill="#2E8B62"/>
          <text x="${width - 115}" y="90" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="600" fill="#F7F4EA">Get Started</text>
          
          <!-- Hero Section inside browser -->
          <text x="70" y="135" font-family="'Outfit', sans-serif" font-size="20" font-weight="700" fill="#F7F4EA">Next-Gen Logistics Engine</text>
          <text x="70" y="155" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#667A70">Real-time intelligence and autonomous fleet coordination.</text>
          
          <!-- Cards inside UI -->
          <rect x="70" y="180" width="130" height="90" rx="8" fill="#12372A" stroke="#2E8B62" stroke-opacity="0.5"/>
          <rect x="85" y="195" width="36" height="6" rx="3" fill="#D6A84F"/>
          <text x="85" y="230" font-family="'Outfit', sans-serif" font-size="18" font-weight="700" fill="#F7F4EA">99.98%</text>
          <text x="85" y="248" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" fill="#667A70">Uptime SLA</text>
          
          <rect x="220" y="180" width="130" height="90" rx="8" fill="#12372A" stroke="#2E8B62" stroke-opacity="0.5"/>
          <rect x="235" y="195" width="36" height="6" rx="3" fill="#2E8B62"/>
          <text x="235" y="230" font-family="'Outfit', sans-serif" font-size="18" font-weight="700" fill="#F7F4EA">4.8x</text>
          <text x="235" y="248" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" fill="#667A70">Route Velocity</text>
          
          <!-- Chart mockup -->
          <rect x="370" y="180" width="${width - 450}" height="90" rx="8" fill="#12372A" stroke="#2E8B62" stroke-opacity="0.5"/>
          <path d="M385 245 L415 220 L445 235 L475 200 L505 195" fill="none" stroke="url(#emGrad)" stroke-width="2.5"/>
          <circle cx="505" cy="195" r="4" fill="#D6A84F"/>
        </svg>
      `;

    case 'visiting-card':
      return `
        <svg viewBox="0 0 ${width} ${height}" class="project-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#F7F4EA"/>
          <defs>
            <linearGradient id="cardGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#12372A"/>
              <stop offset="100%" stop-color="#183027"/>
            </linearGradient>
            <linearGradient id="goldFoil" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F3E5AB"/>
              <stop offset="50%" stop-color="#D6A84F"/>
              <stop offset="100%" stop-color="#B8860B"/>
            </linearGradient>
            <filter id="cardShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="15" stdDeviation="15" flood-color="#12372A" flood-opacity="0.2"/>
            </filter>
          </defs>
          
          <!-- Subtle background grid -->
          <rect x="0" y="0" width="${width}" height="${height}" fill="#F7F4EA"/>
          <circle cx="100" cy="80" r="140" fill="#2E8B62" opacity="0.08"/>
          
          <!-- Front Card (Dark Forest & Gold) -->
          <g filter="url(#cardShadow)" transform="rotate(-6, ${width/2 - 60}, ${height/2 - 10})">
            <rect x="${width/2 - 200}" y="${height/2 - 120}" width="280" height="165" rx="10" fill="url(#cardGradDark)" stroke="#D6A84F" stroke-width="1.5"/>
            <path d="M${width/2 - 170} ${height/2 - 80} L${width/2 - 150} ${height/2 - 100} L${width/2 - 130} ${height/2 - 80} Z" fill="url(#goldFoil)"/>
            <text x="${width/2 - 170}" y="${height/2 - 40}" font-family="'Outfit', sans-serif" font-size="16" font-weight="700" fill="#F7F4EA" letter-spacing="2">ZENITH</text>
            <text x="${width/2 - 170}" y="${height/2 - 24}" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="600" fill="#D6A84F" letter-spacing="1.5">CAPITAL ADVISORS</text>
            
            <line x1="${width/2 - 170}" y1="${height/2 - 5}" x2="${width/2 - 80}" y2="${height/2 - 5}" stroke="#2E8B62" stroke-width="1"/>
            <text x="${width/2 - 170}" y="${height/2 + 15}" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" fill="#F7F4EA">Alexander Vance • Managing Director</text>
            <text x="${width/2 - 170}" y="${height/2 + 28}" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" fill="#667A70">contact@zenithadvisors.com</text>
          </g>
          
          <!-- Back Card (Off-white & Forest Monogram) -->
          <g filter="url(#cardShadow)" transform="rotate(8, ${width/2 + 80}, ${height/2 + 20})">
            <rect x="${width/2 - 40}" y="${height/2 - 60}" width="280" height="165" rx="10" fill="#F7F4EA" stroke="#12372A" stroke-width="1"/>
            <circle cx="${width/2 + 100}" cy="${height/2 + 15}" r="32" fill="none" stroke="#12372A" stroke-width="1.5"/>
            <path d="M${width/2 + 88} ${height/2 + 3} H${width/2 + 112} L${width/2 + 88} ${height/2 + 27} H${width/2 + 112}" fill="none" stroke="url(#goldFoil)" stroke-width="3" stroke-linecap="round"/>
            <text x="${width/2 + 100}" y="${height/2 + 65}" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="10" font-weight="700" fill="#12372A" letter-spacing="3">ZENITH // ADVISORY</text>
          </g>
        </svg>
      `;

    case 'qr-page':
      return `
        <svg viewBox="0 0 ${width} ${height}" class="project-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#12372A"/>
          <defs>
            <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F7F4EA"/>
              <stop offset="100%" stop-color="#EDE8D6"/>
            </linearGradient>
            <linearGradient id="goldQ" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#D6A84F"/>
              <stop offset="100%" stop-color="#B8860B"/>
            </linearGradient>
          </defs>
          
          <!-- Ambient Glow -->
          <circle cx="${width/2}" cy="${height/2}" r="120" fill="#2E8B62" opacity="0.25"/>
          
          <!-- Smartphone Silhouette -->
          <rect x="${width/2 - 110}" y="25" width="220" height="${height - 50}" rx="28" fill="#183027" stroke="#D6A84F" stroke-width="2"/>
          <rect x="${width/2 - 95}" y="45" width="190" height="${height - 90}" rx="16" fill="url(#phoneGrad)"/>
          
          <!-- Phone Notch -->
          <rect x="${width/2 - 35}" y="32" width="70" height="8" rx="4" fill="#12372A"/>
          
          <!-- Web QR Interface Mockup -->
          <rect x="${width/2 - 80}" y="65" width="160" height="24" rx="6" fill="#12372A"/>
          <text x="${width/2}" y="81" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="10" font-weight="700" fill="#D6A84F" letter-spacing="1">VERDE ARTISAN CAFE</text>
          <text x="${width/2}" y="105" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="600" fill="#183027">Table #14 • Digital QR Menu</text>
          
          <!-- QR Code visual -->
          <g transform="translate(${width/2 - 40}, 120)">
            <rect width="80" height="80" fill="#FFFFFF" rx="8" stroke="#12372A" stroke-width="1"/>
            <!-- Stylized QR blocks -->
            <rect x="10" y="10" width="20" height="20" fill="#12372A"/>
            <rect x="14" y="14" width="12" height="12" fill="#FFFFFF"/>
            <rect x="17" y="17" width="6" height="6" fill="#D6A84F"/>
            
            <rect x="50" y="10" width="20" height="20" fill="#12372A"/>
            <rect x="54" y="14" width="12" height="12" fill="#FFFFFF"/>
            <rect x="57" y="17" width="6" height="6" fill="#D6A84F"/>
            
            <rect x="10" y="50" width="20" height="20" fill="#12372A"/>
            <rect x="14" y="54" width="12" height="12" fill="#FFFFFF"/>
            <rect x="17" y="57" width="6" height="6" fill="#D6A84F"/>
            
            <rect x="40" y="40" width="8" height="8" fill="#2E8B62"/>
            <rect x="52" y="45" width="6" height="12" fill="#12372A"/>
            <rect x="42" y="58" width="16" height="6" fill="#12372A"/>
            <rect x="62" y="55" width="8" height="15" fill="#2E8B62"/>
          </g>
          
          <!-- Menu Items Preview -->
          <rect x="${width/2 - 80}" y="220" width="160" height="30" rx="6" fill="#FFFFFF" stroke="#12372A" stroke-opacity="0.1"/>
          <text x="${width/2 - 70}" y="235" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="700" fill="#12372A">Single Origin Cold Brew</text>
          <text x="${width/2 - 70}" y="244" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" fill="#667A70">Ethiopian Guji • Citrus Note</text>
          <text x="${width/2 + 65}" y="238" text-anchor="end" font-family="'Outfit', sans-serif" font-size="9" font-weight="700" fill="#2E8B62">₹280</text>
          
          <!-- Direct WhatsApp Button -->
          <rect x="${width/2 - 80}" y="260" width="160" height="26" rx="6" fill="#2E8B62"/>
          <text x="${width/2}" y="277" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="700" fill="#F7F4EA">Order via WhatsApp</text>
        </svg>
      `;

    case 'logo':
      return `
        <svg viewBox="0 0 ${width} ${height}" class="project-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#183027"/>
          <defs>
            <linearGradient id="goldLogo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F3E5AB"/>
              <stop offset="50%" stop-color="#D6A84F"/>
              <stop offset="100%" stop-color="#B8860B"/>
            </linearGradient>
          </defs>
          
          <!-- Geometric Construction Lines -->
          <circle cx="${width/2}" cy="${height/2 - 20}" r="90" fill="none" stroke="#2E8B62" stroke-opacity="0.25" stroke-width="1"/>
          <circle cx="${width/2}" cy="${height/2 - 20}" r="60" fill="none" stroke="#D6A84F" stroke-opacity="0.25" stroke-dasharray="2 4"/>
          <line x1="${width/2 - 110}" y1="${height/2 - 20}" x2="${width/2 + 110}" y2="${height/2 - 20}" stroke="#667A70" stroke-opacity="0.2"/>
          <line x1="${width/2}" y1="${height/2 - 130}" x2="${width/2}" y2="${height/2 + 90}" stroke="#667A70" stroke-opacity="0.2"/>
          
          <!-- Architectural A Monogram -->
          <path d="M${width/2} ${height/2 - 75} L${width/2 + 48} ${height/2 + 25} H${width/2 + 26} L${width/2} ${height/2 - 25} L${width/2 - 26} ${height/2 + 25} H${width/2 - 48} Z" fill="url(#goldLogo)"/>
          <circle cx="${width/2}" cy="${height/2 - 8}" r="5" fill="#2E8B62"/>
          
          <!-- Typography -->
          <text x="${width/2}" y="${height/2 + 65}" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="24" font-weight="700" fill="#F7F4EA" letter-spacing="6">AURA</text>
          <text x="${width/2}" y="${height/2 + 85}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="600" fill="#667A70" letter-spacing="4">ARCHITECTURAL STUDIO</text>
        </svg>
      `;

    case 'landing-page':
      return `
        <svg viewBox="0 0 ${width} ${height}" class="project-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#12372A"/>
          <defs>
            <linearGradient id="glowNova" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#2E8B62" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="#12372A" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <circle cx="80%" cy="20%" r="180" fill="url(#glowNova)"/>
          
          <!-- Device preview frame -->
          <rect x="50" y="30" width="${width - 100}" height="${height - 60}" rx="12" fill="#183027" stroke="#2E8B62" stroke-width="1.5"/>
          
          <!-- Top bar -->
          <rect x="50" y="30" width="${width - 100}" height="32" rx="12" fill="#12372A"/>
          <circle cx="70" cy="46" r="3.5" fill="#D6A84F"/>
          <circle cx="82" cy="46" r="3.5" fill="#2E8B62"/>
          <circle cx="94" cy="46" r="3.5" fill="#667A70"/>
          <text x="120" y="50" font-family="'Outfit', sans-serif" font-size="11" font-weight="700" fill="#F7F4EA">NOVA // HORIZON</text>
          
          <!-- Bento Grid Layout -->
          <text x="80" y="95" font-family="'Outfit', sans-serif" font-size="18" font-weight="700" fill="#F7F4EA">The Modern Workflow Stack</text>
          <text x="80" y="112" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#667A70">Designed for hyper-growth creative teams.</text>
          
          <!-- Bento Card 1 -->
          <rect x="80" y="130" width="220" height="130" rx="8" fill="#12372A" stroke="#2E8B62" stroke-opacity="0.3"/>
          <circle cx="110" cy="160" r="16" fill="#2E8B62" opacity="0.3"/>
          <text x="110" y="165" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="12" font-weight="700" fill="#D6A84F">⚡</text>
          <text x="140" y="165" font-family="'Outfit', sans-serif" font-size="14" font-weight="700" fill="#F7F4EA">Instant Sync</text>
          <text x="100" y="195" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" fill="#667A70">Zero-latency distributed collaboration.</text>
          <rect x="100" y="220" width="80" height="20" rx="4" fill="#D6A84F"/>
          <text x="140" y="234" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="700" fill="#12372A">Explore</text>
          
          <!-- Bento Card 2 -->
          <rect x="315" y="130" width="${width - 400}" height="130" rx="8" fill="#12372A" stroke="#D6A84F" stroke-opacity="0.4"/>
          <text x="335" y="165" font-family="'Outfit', sans-serif" font-size="14" font-weight="700" fill="#F7F4EA">AI Assisted Assets</text>
          <rect x="335" y="180" width="140" height="12" rx="4" fill="#2E8B62" opacity="0.3"/>
          <rect x="335" y="200" width="100" height="12" rx="4" fill="#D6A84F" opacity="0.3"/>
          <rect x="335" y="220" width="120" height="12" rx="4" fill="#667A70" opacity="0.3"/>
        </svg>
      `;

    case 'banner':
      return `
        <svg viewBox="0 0 ${width} ${height}" class="project-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#12372A"/>
          <defs>
            <linearGradient id="goldBanner" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#D6A84F"/>
              <stop offset="100%" stop-color="#2E8B62"/>
            </linearGradient>
          </defs>
          
          <!-- Dynamic geometric stripes -->
          <path d="M0 0 L180 0 L120 ${height} L0 ${height} Z" fill="#183027" opacity="0.7"/>
          <path d="M${width - 220} 0 L${width} 0 L${width} ${height} L${width - 160} ${height} Z" fill="#2E8B62" opacity="0.2"/>
          
          <!-- Banner Frame -->
          <rect x="40" y="40" width="${width - 80}" height="${height - 80}" rx="12" fill="none" stroke="url(#goldBanner)" stroke-width="1.5"/>
          
          <text x="${width/2}" y="${height/2 - 40}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="700" fill="#D6A84F" letter-spacing="4">ANNUAL DESIGN & TECH SUMMIT</text>
          <text x="${width/2}" y="${height/2 + 5}" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="32" font-weight="800" fill="#F7F4EA" letter-spacing="2">VELOX SUMMIT 2026</text>
          <text x="${width/2}" y="${height/2 + 35}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#667A70">Grand Convention Center • Keynotes • Masterclasses</text>
          
          <rect x="${width/2 - 80}" y="${height/2 + 55}" width="160" height="34" rx="8" fill="#D6A84F"/>
          <text x="${width/2}" y="${height/2 + 77}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="800" fill="#12372A" letter-spacing="1">RESERVE PASS</text>
        </svg>
      `;

    case 'poster':
      return `
        <svg viewBox="0 0 ${width} ${height}" class="project-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#183027"/>
          <!-- Swiss Grid Style Poster Layout -->
          <rect x="40" y="30" width="${width - 80}" height="${height - 60}" fill="#12372A" stroke="#D6A84F" stroke-width="1"/>
          
          <text x="65" y="70" font-family="'Outfit', sans-serif" font-size="11" font-weight="700" fill="#D6A84F">ISSUE N° 04</text>
          <text x="${width - 65}" y="70" text-anchor="end" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#667A70">SEPTEMBER 2026</text>
          
          <line x1="65" y1="85" x2="${width - 65}" y2="85" stroke="#2E8B62" stroke-width="1.5"/>
          
          <!-- Big Typographic Treatment -->
          <text x="65" y="145" font-family="'Outfit', sans-serif" font-size="44" font-weight="800" fill="#F7F4EA" letter-spacing="-1">SOLIS</text>
          <text x="65" y="190" font-family="'Outfit', sans-serif" font-size="44" font-weight="800" fill="#D6A84F" letter-spacing="-1">SOUNDWAVE</text>
          
          <circle cx="${width - 130}" cy="160" r="50" fill="#2E8B62" opacity="0.3"/>
          <circle cx="${width - 130}" cy="160" r="35" fill="none" stroke="#D6A84F" stroke-width="2"/>
          
          <!-- Bottom editorial text -->
          <line x1="65" y1="${height - 90}" x2="${width - 65}" y2="${height - 90}" stroke="#667A70" stroke-opacity="0.3"/>
          <text x="65" y="${height - 60}" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#F7F4EA">An exploratory acoustic and visual experience in Bangalore.</text>
          <text x="${width - 65}" y="${height - 60}" text-anchor="end" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" fill="#2E8B62">LIMITED EDITION</text>
        </svg>
      `;

    case 'branding-luxury':
      return `
        <svg viewBox="0 0 ${width} ${height}" class="project-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#12372A"/>
          <defs>
            <linearGradient id="goldChronos" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFF3C4"/>
              <stop offset="50%" stop-color="#D6A84F"/>
              <stop offset="100%" stop-color="#996515"/>
            </linearGradient>
          </defs>
          
          <!-- Guilloche fine concentric rings -->
          <circle cx="${width/2}" cy="${height/2 - 25}" r="85" fill="none" stroke="#D6A84F" stroke-opacity="0.2" stroke-width="1"/>
          <circle cx="${width/2}" cy="${height/2 - 25}" r="70" fill="none" stroke="#2E8B62" stroke-opacity="0.3" stroke-width="1"/>
          <circle cx="${width/2}" cy="${height/2 - 25}" r="55" fill="none" stroke="#D6A84F" stroke-opacity="0.4" stroke-width="1.5"/>
          
          <!-- Horology Crown Symbol -->
          <path d="M${width/2 - 30} ${height/2 - 10} L${width/2 - 20} ${height/2 - 45} L${width/2} ${height/2 - 25} L${width/2 + 20} ${height/2 - 45} L${width/2 + 30} ${height/2 - 10} Z" fill="url(#goldChronos)"/>
          <circle cx="${width/2}" cy="${height/2 - 25}" r="4" fill="#12372A"/>
          
          <!-- Typography -->
          <text x="${width/2}" y="${height/2 + 50}" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="20" font-weight="700" fill="#F7F4EA" letter-spacing="6">CHRONOS</text>
          <text x="${width/2}" y="${height/2 + 70}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="600" fill="#D6A84F" letter-spacing="4">HERITAGE HOROLOGY</text>
          <text x="${width/2}" y="${height/2 + 88}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" fill="#667A70" letter-spacing="2">GENÈVE • EST. 2026</text>
        </svg>
      `;

    default:
      return `
        <svg viewBox="0 0 ${width} ${height}" class="project-svg" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#12372A"/>
          <text x="${width/2}" y="${height/2}" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="18" fill="#D6A84F">ELYRA VISUAL STUDIO</text>
        </svg>
      `;
  }
}
