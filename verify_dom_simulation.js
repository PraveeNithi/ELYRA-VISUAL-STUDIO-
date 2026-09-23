// Comprehensive DOM event and submission simulation test
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== Running Full DOM Simulation & Event Test ===');

// Mock a lightweight browser DOM environment
class MockClassList {
  constructor(el) {
    this.el = el;
    this.classes = new Set();
  }
  add(...names) { names.forEach(n => this.classes.add(n)); }
  remove(...names) { names.forEach(n => this.classes.delete(n)); }
  toggle(name, force) {
    if (typeof force === 'boolean') {
      if (force) this.classes.add(name);
      else this.classes.delete(name);
      return force;
    }
    if (this.classes.has(name)) {
      this.classes.delete(name);
      return false;
    } else {
      this.classes.add(name);
      return true;
    }
  }
  contains(name) { return this.classes.has(name); }
}

class MockElement {
  constructor(tagName, id = '', className = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.className = className;
    this.classList = new MockClassList(this);
    if (className) className.split(/\s+/).forEach(c => c && this.classList.add(c));
    this.attributes = {};
    this.children = [];
    this.parentElement = null;
    this.value = '';
    this.textContent = '';
    this.innerHTML = '';
    this.listeners = {};
    this.options = [];
    this.selectedIndex = 0;
    this.checked = false;
    this.disabled = false;
    this.type = tagName.toLowerCase() === 'textarea' ? 'textarea' : 'text';
  }

  setAttribute(name, val) { this.attributes[name] = String(val); }
  getAttribute(name) { return this.attributes[name] || null; }
  hasAttribute(name) { return name in this.attributes; }
  removeAttribute(name) { delete this.attributes[name]; }

  addEventListener(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }

  dispatchEvent(event) {
    if (this.listeners[event.type]) {
      this.listeners[event.type].forEach(fn => fn(event));
    }
  }

  appendChild(child) {
    this.children.push(child);
    child.parentElement = this;
    return child;
  }

  remove() {
    if (this.parentElement) {
      const idx = this.parentElement.children.indexOf(this);
      if (idx !== -1) this.parentElement.children.splice(idx, 1);
      this.parentElement = null;
    }
  }

  querySelector(sel) {
    const all = this.querySelectorAll(sel);
    return all.length > 0 ? all[0] : null;
  }

  querySelectorAll(sel) {
    const results = [];
    const traverse = (node) => {
      for (const child of node.children) {
        if (matchesSelector(child, sel)) results.push(child);
        traverse(child);
      }
    };
    traverse(this);
    return results;
  }

  closest(sel) {
    let curr = this;
    while (curr) {
      if (matchesSelector(curr, sel)) return curr;
      curr = curr.parentElement;
    }
    return null;
  }

  cloneNode(deep) {
    const clone = new MockElement(this.tagName, this.id, this.className);
    clone.textContent = this.textContent;
    clone.value = this.value;
    clone.type = this.type;
    clone.name = this.name;
    if (deep) {
      this.children.forEach(c => clone.appendChild(c.cloneNode(deep)));
    }
    return clone;
  }

  focus() {}
  reset() {
    this.querySelectorAll('input, select, textarea').forEach(el => {
      if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
      else el.value = '';
    });
  }
}

function matchesSelector(el, sel) {
  if (sel.startsWith('#')) return el.id === sel.slice(1);
  if (sel.startsWith('.')) return el.classList.contains(sel.slice(1));
  if (sel.includes('[data-service-name')) {
    const match = sel.match(/data-service-name="([^"]+)"/);
    if (match) return el.getAttribute('data-service-name') === match[1];
  }
  if (sel.includes('[data-action')) {
    const match = sel.match(/data-action="([^"]+)"/);
    if (match) return el.getAttribute('data-action') === match[1];
  }
  if (sel.includes('input[type="checkbox"]')) {
    return el.tagName === 'INPUT' && el.type === 'checkbox';
  }
  if (sel.includes('label[for="')) {
    const match = sel.match(/label\[for="([^"]+)"\]/);
    if (match) return el.tagName === 'LABEL' && el.getAttribute('for') === match[1];
  }
  return el.tagName === sel.toUpperCase();
}

// Global window & document mock
const elementsById = {};
const elementsByTag = {};

global.document = {
  body: new MockElement('BODY'),
  getElementById(id) { return elementsById[id] || null; },
  querySelectorAll(sel) {
    const res = [];
    Object.values(elementsById).forEach(el => {
      if (matchesSelector(el, sel)) res.push(el);
      res.push(...el.querySelectorAll(sel));
    });
    return Array.from(new Set(res));
  },
  querySelector(sel) {
    const all = this.querySelectorAll(sel);
    return all.length > 0 ? all[0] : null;
  },
  createElement(tag) { return new MockElement(tag); },
  addEventListener() {}
};

global.window = {
  openUrls: [],
  open(url, target) {
    this.openUrls.push({ url, target });
    return { closed: false };
  },
  location: { href: '' }
};

// Create the required HTML DOM structure
function createDomElement(tag, id, className, parent) {
  const el = new MockElement(tag, id, className);
  elementsById[id] = el;
  if (parent) parent.appendChild(el);
  return el;
}

const modal = createDomElement('DIV', 'project-modal', 'modal-overlay', document.body);
const step1 = createDomElement('DIV', 'builder-step-1', 'builder-step-panel active', modal);
const serviceGrid = createDomElement('DIV', 'builder-service-grid', '', step1);
const summaryBar = createDomElement('DIV', 'builder-selected-summary', '', step1);
const chipsContainer = createDomElement('DIV', 'builder-selected-chips', '', summaryBar);
const countSpan = createDomElement('SPAN', 'builder-selected-count', '', summaryBar);
const nextBtn = createDomElement('BUTTON', 'builder-next-btn', 'btn btn-gold', summaryBar);
const backBtn = createDomElement('BUTTON', 'builder-back-btn', 'btn btn-outline', modal);
const step2 = createDomElement('DIV', 'builder-step-2', 'builder-step-panel', modal);
const pillsContainer = createDomElement('DIV', 'form-selected-services-pills', '', step2);
const projectForm = createDomElement('FORM', 'builder-project-form', '', step2);
const toastContainer = createDomElement('DIV', 'toast-container', '', document.body);
const submitBtn = createDomElement('BUTTON', 'builder-submit-btn', 'btn btn-emerald', projectForm);

// Add form controls to projectForm
const inputs = [
  { id: 'client-fullname', name: 'Full Name', label: 'Full Name *', value: 'Sundar Pichai' },
  { id: 'client-business', name: 'Company / Business Name', label: 'Company / Business Name *', value: 'Alphabet & Google' },
  { id: 'client-phone', name: 'Phone / WhatsApp Number', label: 'Phone / WhatsApp Number *', value: '+91 93457 68934' },
  { id: 'client-email', name: 'Email Address', label: 'Email Address (optional)', value: 'sundar@google.com' },
  { id: 'client-address', name: 'City / Location', label: 'City / Location (optional)', value: 'Mountain View & Chennai' },
  { id: 'client-project-type', name: 'Project Type', label: 'Project Type', isSelect: true, options: ['Responsive Website / Web App', 'Logo Design'], selectedIndex: 0 },
  { id: 'client-pages', name: 'Pages / Deliverables Required', label: 'Pages / Deliverables Required', value: '10 Enterprise Pages' },
  { id: 'client-style', name: 'Style Preference', label: 'Design & Style Preference', isSelect: true, options: ['Minimalist, Clean & Modern', 'Luxury'], selectedIndex: 0 },
  { id: 'client-colors', name: 'Colour Preferences', label: 'Colour Preferences', value: 'Google Quad-Color Palette' },
  { id: 'client-references', name: 'Reference Details / Links', label: 'Design References / Competitor Links', value: 'https://design.google' },
  { id: 'client-budget', name: 'Budget', label: 'Estimated Budget', isSelect: true, options: ['₹1,00,000+', 'Flexible'], selectedIndex: 0 },
  { id: 'client-timeline', name: 'Deadline / Timeline', label: 'Preferred Deadline / Timeline', isSelect: true, options: ['1 – 2 weeks', 'Flexible'], selectedIndex: 0 },
  { id: 'client-requirements', name: 'Complete Requirements', label: 'Complete Project Requirements & Goals *', isTextarea: true, value: 'Reimagining the future of intelligent design interfaces with next-generation typography and fluid micro-interactions.' },
  { id: 'client-additional', name: 'Additional Requirements', label: 'Additional Requirements / Special Notes', isTextarea: true, value: 'Include custom vector illustrations and interactive WebGL assets.' }
];

inputs.forEach(inp => {
  const label = createDomElement('LABEL', `label-${inp.id}`, 'form-label', projectForm);
  label.setAttribute('for', inp.id);
  label.textContent = inp.label;

  let control;
  if (inp.isSelect) {
    control = createDomElement('SELECT', inp.id, 'form-select', projectForm);
    control.options = inp.options.map(opt => ({ textContent: opt, value: opt }));
    control.selectedIndex = inp.selectedIndex;
  } else if (inp.isTextarea) {
    control = createDomElement('TEXTAREA', inp.id, 'form-textarea', projectForm);
    control.value = inp.value;
    control.type = 'textarea';
  } else {
    control = createDomElement('INPUT', inp.id, 'form-input', projectForm);
    control.value = inp.value;
    control.type = 'text';
  }
  control.name = inp.name;
});

// Add feature checkboxes
const featuresGroup = createDomElement('DIV', 'builder-features-grid', 'checkbox-pills-grid', projectForm);
const feat1Label = createDomElement('LABEL', '', 'checkbox-pill-label', featuresGroup);
const feat1 = createDomElement('INPUT', 'feat-1', '', feat1Label);
feat1.type = 'checkbox';
feat1.name = 'Features Required';
feat1.value = 'Mobile-First Responsive UI';
feat1.checked = true;

const feat2Label = createDomElement('LABEL', '', 'checkbox-pill-label', featuresGroup);
const feat2 = createDomElement('INPUT', 'feat-2', '', feat2Label);
feat2.type = 'checkbox';
feat2.name = 'Features Required';
feat2.value = 'Direct WhatsApp Chat Integration';
feat2.checked = true;

projectForm.elements = Object.values(elementsById).filter(el => 
  el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA'
);

// Initialize ProjectBuilder in the simulated DOM
delete require.cache[require.resolve('./js/project-builder.js')];
const { ProjectBuilder } = require('./js/project-builder.js');
const builder = new ProjectBuilder();

// 1. Simulate user opening modal
builder.open('Logo Design');
assert.strictEqual(modal.classList.contains('active'), true, 'Modal should be open');
assert.strictEqual(builder.selectedServices.has('Logo Design'), true, 'Preselected service Logo Design should be added');

// Select a second service
const websiteCard = serviceGrid.children.find(c => c.getAttribute('data-service-name') === 'Website');
assert(websiteCard, 'Website service card should exist in grid');
websiteCard.dispatchEvent({ type: 'click' });
assert.strictEqual(builder.selectedServices.has('Website'), true, 'Website should be added');
assert.strictEqual(builder.selectedServices.size, 2, '2 services should be selected');

// 2. Click next to go to Step 2
nextBtn.dispatchEvent({ type: 'click' });
assert.strictEqual(builder.currentStep, 2, 'Should advance to step 2');

// 3. Submit form
const preventDefaultCalled = { val: false };
projectForm.dispatchEvent({
  type: 'submit',
  preventDefault: () => { preventDefaultCalled.val = true; }
});

assert.strictEqual(preventDefaultCalled.val, true, 'preventDefault should be called');
assert.strictEqual(window.openUrls.length, 1, 'WhatsApp window.open should be triggered');

const openedUrl = window.openUrls[0].url;
assert(openedUrl.startsWith('https://wa.me/919345768934?text='), 'Target WhatsApp URL mismatch');

const decodedMessage = decodeURIComponent(openedUrl.split('?text=')[1]);
console.log('\n--- Decoded WhatsApp Message from DOM Simulation ---');
console.log(decodedMessage);
console.log('-----------------------------------------------------\n');

// Assertions on the simulated message content:
assert(decodedMessage.includes('Name: Sundar Pichai'), 'Client name missing');
assert(decodedMessage.includes('Company: Alphabet & Google'), 'Company missing');
assert(decodedMessage.includes('Phone: +91 93457 68934'), 'Phone missing');
assert(decodedMessage.includes('Email: sundar@google.com'), 'Email missing');
assert(decodedMessage.includes('Location: Mountain View & Chennai'), 'Location missing');
assert(decodedMessage.includes('• Logo Design'), 'Logo Design missing');
assert(decodedMessage.includes('• Website'), 'Website missing');
assert(decodedMessage.includes('Project Type: Responsive Website / Web App'), 'Project Type missing');
assert(decodedMessage.includes('Pages: 10 Enterprise Pages'), 'Pages missing');
assert(decodedMessage.includes('• Mobile-First Responsive UI'), 'Feature 1 missing');
assert(decodedMessage.includes('• Direct WhatsApp Chat Integration'), 'Feature 2 missing');
assert(decodedMessage.includes('Style: Minimalist, Clean & Modern'), 'Style missing');
assert(decodedMessage.includes('Colours: Google Quad-Color Palette'), 'Colours missing');
assert(decodedMessage.includes('References: https://design.google'), 'References missing');
assert(decodedMessage.includes('Budget: ₹1,00,000+'), 'Budget missing');
assert(decodedMessage.includes('Deadline: 1 – 2 weeks'), 'Deadline missing');
assert(decodedMessage.includes('PROJECT REQUIREMENTS'), 'Project Requirements missing');
assert(decodedMessage.includes('Reimagining the future of intelligent design interfaces'), 'Requirements text missing');
assert(decodedMessage.includes('ADDITIONAL REQUIREMENTS'), 'Additional requirements missing');
assert(decodedMessage.includes('Include custom vector illustrations'), 'Additional text missing');

console.log('✓ Full DOM simulation and WhatsApp submission verification passed perfectly with 100% data fidelity!');
