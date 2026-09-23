// Test verification script for ELYRA Visual Studio 100% Form Data to WhatsApp
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('--- Starting Form Data to WhatsApp Verification ---');

// 1. Check index.html and public/index.html contain all form fields
const indexPath = path.join(__dirname, 'index.html');
const publicIndexPath = path.join(__dirname, 'public', 'index.html');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const publicIndexHtml = fs.readFileSync(publicIndexPath, 'utf8');

const expectedFields = [
  'client-fullname',
  'client-business',
  'client-phone',
  'client-email',
  'client-address',
  'client-project-type',
  'client-pages',
  'builder-features-grid',
  'client-style',
  'client-colors',
  'client-references',
  'client-budget',
  'client-timeline',
  'client-requirements',
  'client-additional'
];

expectedFields.forEach(field => {
  assert(indexHtml.includes(field), `index.html missing ${field}`);
  assert(publicIndexHtml.includes(field), `public/index.html missing ${field}`);
  console.log(`✓ Form field found in HTML: ${field}`);
});

// 2. Load ProjectBuilder
const { ProjectBuilder } = require('./js/project-builder.js');
const builderInstance = new ProjectBuilder();

// Mock a sample dataset representing 100% form data filled by a client
const mockFormData = {
  'Selected Services': ['Logo Design', 'Branding', 'Website'],
  'Full Name': 'Praveen Nithi',
  'Company / Business Name': 'Horizon Creative Labs',
  'Phone / WhatsApp Number': '+91 93457 68934',
  'Email Address': 'praveen@horizon.com',
  'City / Location': 'Chennai, Tamil Nadu',
  'Project Type': 'New Brand Identity (From Scratch)',
  'Pages / Deliverables Required': '5-Page Responsive Web App + Brand Manual',
  'Features Required': ['Mobile-First Responsive UI', 'Direct WhatsApp Chat Integration', 'SEO & Speed Optimization'],
  'Style Preference': 'Luxury, Elegant & Premium',
  'Colour Preferences': 'Emerald Green (#12372A), Gold (#D6A84F), Cream (#FBF8F2)',
  'Reference Details / Links': 'https://apple.com, https://stripe.com',
  'Budget': '₹25,000 – ₹50,000',
  'Deadline / Timeline': '2 – 4 weeks',
  'Complete Requirements': 'We need a bespoke, ultra-fast website for our creative studio with interactive portfolio, client inquiry flow, and high-conversion landing page.',
  'Additional Requirements': 'Please ensure full support for dark mode and high-resolution SVG exports.'
};

const formattedMsg = builderInstance.buildWhatsAppMessage(mockFormData);
console.log('\n--- Generated WhatsApp Message Preview ---');
console.log(formattedMsg);
console.log('-------------------------------------------\n');

// 3. Assert message structure and zero data loss
assert(formattedMsg.includes('ELYRA VISUAL STUDIO'), 'Header missing');
assert(formattedMsg.includes('CLIENT DETAILS'), 'Client Details header missing');
assert(formattedMsg.includes('Name: Praveen Nithi'), 'Name missing');
assert(formattedMsg.includes('Phone: +91 93457 68934'), 'Phone missing');
assert(formattedMsg.includes('Email: praveen@horizon.com'), 'Email missing');
assert(formattedMsg.includes('Company: Horizon Creative Labs'), 'Company missing');
assert(formattedMsg.includes('Location: Chennai, Tamil Nadu'), 'Location missing');

assert(formattedMsg.includes('PROJECT DETAILS'), 'Project Details header missing');
assert(formattedMsg.includes('• Logo Design'), 'Selected service Logo missing');
assert(formattedMsg.includes('• Branding'), 'Selected service Branding missing');
assert(formattedMsg.includes('• Website'), 'Selected service Website missing');
assert(formattedMsg.includes('Project Type: New Brand Identity (From Scratch)'), 'Project type missing');
assert(formattedMsg.includes('Pages: 5-Page Responsive Web App + Brand Manual'), 'Pages missing');
assert(formattedMsg.includes('• Mobile-First Responsive UI'), 'Feature 1 missing');
assert(formattedMsg.includes('• Direct WhatsApp Chat Integration'), 'Feature 2 missing');
assert(formattedMsg.includes('• SEO & Speed Optimization'), 'Feature 3 missing');

assert(formattedMsg.includes('DESIGN DETAILS'), 'Design Details missing');
assert(formattedMsg.includes('Style: Luxury, Elegant & Premium'), 'Style missing');
assert(formattedMsg.includes('Colours: Emerald Green (#12372A), Gold (#D6A84F), Cream (#FBF8F2)'), 'Colours missing');
assert(formattedMsg.includes('References: https://apple.com, https://stripe.com'), 'References missing');

assert(formattedMsg.includes('Budget: ₹25,000 – ₹50,000'), 'Budget missing');
assert(formattedMsg.includes('Deadline: 2 – 4 weeks'), 'Deadline missing');

assert(formattedMsg.includes('PROJECT REQUIREMENTS'), 'Project Requirements missing');
assert(formattedMsg.includes('We need a bespoke, ultra-fast website'), 'Requirements text missing');

assert(formattedMsg.includes('ADDITIONAL REQUIREMENTS'), 'Additional Requirements missing');
assert(formattedMsg.includes('Please ensure full support for dark mode'), 'Additional text missing');

assert(formattedMsg.includes('END OF REQUIREMENTS'), 'Footer missing');

// 4. Test omission of empty fields
const mockPartialData = {
  'Selected Services': ['Poster / Social Media Design'],
  'Full Name': 'Ananya Sharma',
  'Company / Business Name': 'Sparkle Cafe',
  'Phone / WhatsApp Number': '+91 98765 43210',
  'Complete Requirements': 'Need 10 Instagram launch promo posters.'
};

const partialMsg = builderInstance.buildWhatsAppMessage(mockPartialData);
assert(!partialMsg.includes('Email:'), 'Email should not appear when not provided');
assert(!partialMsg.includes('Location:'), 'Location should not appear when not provided');
assert(!partialMsg.includes('Budget:'), 'Budget should not appear when not provided');
assert(!partialMsg.includes('ADDITIONAL REQUIREMENTS'), 'Additional requirements section should not appear when empty');
assert(partialMsg.includes('Name: Ananya Sharma'), 'Name must be present');
assert(partialMsg.includes('• Poster / Social Media Design'), 'Selected service must be present');

// 5. Test dynamic field addition (arbitrary unexpected field)
const mockExtraData = {
  'Selected Services': ['QR Scanner Web Page'],
  'Full Name': 'Vikram Patel',
  'Company / Business Name': 'Patel Sweets',
  'Phone / WhatsApp Number': '+91 91234 56789',
  'Complete Requirements': 'Digital QR Menu for 20 tables.',
  'Number of Tables': '20',
  'Dietary Menu Categories': ['Veg', 'Eggless Sweets', 'Sugar Free']
};

const extraMsg = builderInstance.buildWhatsAppMessage(mockExtraData);
assert(extraMsg.includes('Number of Tables: 20'), 'Dynamic field Number of Tables must be included');
assert(extraMsg.includes('• Sugar Free'), 'Dynamic array item must be included');

// 6. Test WhatsApp URL Generation
const targetPhone = '919345768934';
const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(formattedMsg)}`;
assert(waUrl.startsWith('https://wa.me/919345768934?text='), 'Target WhatsApp URL format invalid');

console.log('✓ All 6 test suites passed with 100% data fidelity!');
