# ✨ ELYRA Visual Studio

> **"Designs that build brands."**  
> *Creative Design • Branding • Web Design*

A complete, production-ready, highly professional website and private admin dashboard for **ELYRA Visual Studio**. Crafted with modern creative agency aesthetics, glassmorphism, responsive architecture, and persistent backend database storage.

---

## 🎨 Brand Identity & Color Palette

| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Deep Forest Green** | `#12372A` | Primary brand identity & dark accents |
| **Off-White** | `#F7F4EA` | Primary background canvas |
| **Emerald Green** | `#2E8B62` | Secondary accent & interactive highlights |
| **Warm Gold** | `#D6A84F` | Premium CTA buttons, badges & active states |
| **Dark Green** | `#183027` | High-contrast primary typography |
| **Muted Green-Gray**| `#667A70` | Secondary & metadata typography |

---

## 🚀 Key Features

### 1. Public Agency Experience
- **Sticky Glass Navbar**: Blur backdrop with smooth scroll links and mobile animated drawer.
- **Hero Section**: High-impact brand statement, tagline, services strip, dual CTAs, and interactive vector showcase.
- **About Studio**: Creative philosophy with authentic metrics (**10+ Projects**, **100% Creative Designs**, **Responsive Websites**, **Client-Focused Approach**).
- **8 Core Service Cards**:
  1. *Logo Design*
  2. *Banner Design*
  3. *Poster & Social Media Design*
  4. *Branding*
  5. *Visiting Card*
  6. *Website*
  7. *Web Page / Landing Page*
  8. *QR Scanner Web Page*
  *(Each with interactive "Learn More" modal and "+ Select" quick add)*.
- **Portfolio Gallery**: Filterable case studies with animated tabs (*All, Logos, Banners, Posters, Branding, Visiting Cards, Websites, Web Pages, QR Web Pages*) and full-screen project preview modal.
- **Dedicated Web Design Section**: *"Your business deserves a strong digital presence"* with feature list and device mockup.
- **Why Choose ELYRA**: 6 distinct studio pillars.
- **Interactive Project Builder Flow (Multi-Step)**:
  - Multi-service selection grid with checkmark badges.
  - Live toast feedback (e.g. *“Logo Design selected.”*).
  - Selected services summary chips with instant removal.
  - Client requirement form with validation (*Full Name, Business Name, Phone/WhatsApp, Email, Timeline, Brief*).
  - Celebratory confirmation screen with reference ID and direct WhatsApp quick link.
- **Contact & Footer**: 1-click WhatsApp, phone, email, and Instagram links.

### 2. Private Admin Dashboard (`/admin`)
- **Authentication**: PBKDF2/SHA256 salted password hashing & session management.
- **Real-Time Overview Metrics**:
  - *New Requests*
  - *Total Requests*
  - *In Progress*
  - *Completed*
- **Live Notifications System**:
  - `🔔 New Project Request` alerts with client name and services.
  - Unread count badge with polling updates.
  - Mark single/all as read.
- **Project Requests Management**:
  - Filter by status (*New, Contacted, In Progress, Completed*) & search.
  - Direct 1-tap WhatsApp chat bridge with prepopulated greetings.
  - Detailed request modal & persistent internal studio notes.
- **Persistent Storage**: Atomic transactional disk persistence in `data/database.json`.

---

## 📁 Architecture & File Structure

```
elyra-visual-studio/
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies and npm scripts
├── README.md                   # Complete documentation
├── data/
│   └── database.json           # Persistent database for requests & notifications
├── server/
│   ├── config.js               # Environment config
│   ├── db.js                   # Atomic transactional JSON database driver
│   ├── auth.js                 # Admin cryptographic auth & session engine
│   ├── routes.js               # REST API endpoints (/api/projects, /api/admin)
│   ├── server.js               # Express server entry point & static file server
│   ├── test-api.js             # Automated API test suite
│   └── test-e2e.js             # Full end-to-end workflow verification
└── public/
    ├── favicon.svg             # Luxury geometric SVG monogram favicon
    ├── index.html              # Main public website
    ├── admin/
    │   ├── index.html          # Private admin dashboard portal
    │   ├── admin.css           # Admin styling with ELYRA palette
    │   └── admin.js            # Admin dashboard client controller
    ├── css/
    │   ├── main.css            # Core design system tokens & typography
    │   ├── components.css      # Hero, services, portfolio, modals & toasts
    │   └── responsive.css      # Mobile, tablet, laptop & desktop breakpoints
    ├── js/
    │   ├── main.js             # Main interactive engine & scroll observer
    │   ├── portfolio-data.js   # Portfolio case studies dataset
    │   └── project-builder.js  # Multi-service interactive project enquiry builder
    └── images/                 # Custom vector assets & mockups
```

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js** (v18.0.0 or later)
- **npm** (v9.0.0 or later)

### 2. Installation
```bash
# Navigate to the project directory
cd elyra-visual-studio

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```

Default credentials in `.env`:
```env
PORT=3000
NODE_ENV=development
ADMIN_USERNAME=admin
ADMIN_PASSWORD=elyra2026!secure
SESSION_SECRET=elyra_studio_production_secret_change_in_prod_992183127391
```

### 4. Run the Development Server
```bash
# Start server with file watching
npm run dev

# Or standard production start
npm start
```

Visit the application:
- **Public Studio Website**: [http://localhost:3000](http://localhost:3000)
- **Private Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
  - *Username*: `admin`
  - *Password*: `elyra2026!secure`

### 5. Run Automated Tests
```bash
# Run API endpoint tests
npm test

# Run full end-to-end client-to-admin workflow verification
node server/test-e2e.js
```

---

## 🚢 Deployment Guide

### Option 1: Render / Railway / DigitalOcean App Platform
1. Push the repository to GitHub: `git push -u origin main`
2. Create a new **Web Service** on Render / Railway pointing to your repository.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Set Environment Variables in dashboard:
   - `PORT=3000` (or leave default assigned by provider)
   - `ADMIN_USERNAME=your_custom_admin_user`
   - `ADMIN_PASSWORD=your_strong_admin_password`
   - `SESSION_SECRET=generate_a_random_32_char_secret`

### Option 2: Linux / VPS / Ubuntu with PM2
```bash
git clone https://github.com/PraveeNithi/ELYRA-VISUAL-STUDIO-.git
cd ELYRA-VISUAL-STUDIO-
npm install --production
npm install -g pm2
pm2 start server/server.js --name "elyra-studio"
pm2 save
pm2 startup
```

---

## 🔒 Security & Best Practices
- **No hardcoded secrets**: All credentials are dynamically loaded via environment variables.
- **Session Protection**: Protected with `SameSite=Lax` and `HttpOnly` cookie tokens.
- **Strict Data Validation**: Server-side and client-side validation on all client submissions.
- **Persistent Data**: Atomic writes prevent database file corruption.

---

## 👤 Author
**PraveeNithi**  
*ELYRA Visual Studio — Designs that build brands.*
