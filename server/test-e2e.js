const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('./server');

const PORT = 3097;
let server;

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        let parsed = body;
        try {
          parsed = JSON.parse(body);
        } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function verifyFullWorkflow() {
  console.log('🚀 Running Complete ELYRA Visual Studio End-to-End Workflow Verification...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  server = app.listen(PORT);

  try {
    // 1. Static HTML serving & branding checks
    console.log('[Step 1: Homepage & Assets Serving]');
    const homeRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/',
      method: 'GET'
    });
    assert(homeRes.statusCode === 200, 'Homepage returns 200 OK');
    assert(homeRes.body.includes('ELYRA Visual Studio'), 'Homepage contains brand name ELYRA Visual Studio');
    assert(homeRes.body.includes('Designs that build brands.'), 'Homepage contains tagline');
    assert(homeRes.body.includes('Creative Design • Branding • Web Design'), 'Homepage contains services strip');
    assert(homeRes.body.includes('10+ Projects'), 'Homepage contains 10+ Projects stat');
    assert(homeRes.body.includes('Let’s create something great.'), 'Homepage contains Start a Project modal');

    // 2. Favicon & CSS Verification
    console.log('\n[Step 2: Static Stylesheets & Favicon]');
    const cssRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/css/main.css',
      method: 'GET'
    });
    assert(cssRes.statusCode === 200, 'Main CSS loaded successfully');
    assert(cssRes.body.includes('#12372A'), 'Contains Deep Forest Green #12372A');
    assert(cssRes.body.includes('#F7F4EA'), 'Contains Off-White background #F7F4EA');
    assert(cssRes.body.includes('#D6A84F'), 'Contains Warm Gold #D6A84F');

    // 3. Client Registration (Rohan Deshmukh with Address & Work Selection)
    console.log('\n[Step 3: Client Submits Project Application / Registration]');
    const subRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/projects',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'Rohan Deshmukh',
      businessName: 'Veritas Renewable Energy',
      phone: '+91 98765 00112',
      email: 'rohan@veritasenergy.in',
      address: 'Lavelle Road, Bengaluru, Karnataka',
      services: ['Logo Design', 'Branding', 'Website'],
      requirements: 'We require a modern logo mark, complete sustainability brand guidelines, and a responsive 4-page corporate website with inquiry capture.',
      timeline: '2-3 weeks'
    });
    assert(subRes.statusCode === 201, 'Submission successfully returns 201 Created');
    const token = subRes.body.referenceToken || subRes.body.projectId;
    assert(token && token.startsWith('ELYRA-'), `Generated valid branded reference token: ${token}`);
    assert(subRes.body.registration.address === 'Lavelle Road, Bengaluru, Karnataka', 'Address saved in registration');

    // 4. Admin Login with designated email elyravisualstudio@gmail.com
    console.log('\n[Step 4: Admin Authentication with elyravisualstudio@gmail.com]');
    const loginRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'elyravisualstudio@gmail.com',
      password: 'elyra2026!secure'
    });
    assert(loginRes.statusCode === 200, 'Admin login succeeded with 200 OK');
    const adminToken = loginRes.body.token;
    assert(adminToken && adminToken.length > 20, 'Received valid admin session token');

    // 5. Check Dashboard Stats & Notifications
    console.log('\n[Step 5: Dashboard Stats & Notifications]');
    const statsRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { 'x-admin-token': adminToken }
    });
    assert(statsRes.statusCode === 200, 'Fetched stats successfully');
    assert(statsRes.body.stats.totalRegistrations >= 1, `Total registrations: ${statsRes.body.stats.totalRegistrations}`);

    const notifsRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/notifications',
      method: 'GET',
      headers: { 'x-admin-token': adminToken }
    });
    const rohanNotif = notifsRes.body.notifications.find(n => n.projectId === token);
    assert(rohanNotif !== undefined, `Found notification for registration ${token} (${rohanNotif?.message})`);

    // 6. View Complete Client Details
    console.log('\n[Step 6: Admin Views Complete Registration Details]');
    const getRegRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/projects/${token}`,
      method: 'GET',
      headers: { 'x-admin-token': adminToken }
    });
    assert(getRegRes.statusCode === 200, 'Admin accesses client details');
    const clientData = getRegRes.body.registration || getRegRes.body.project;
    assert(clientData.fullName === 'Rohan Deshmukh', 'Shows Full Name: Rohan Deshmukh');
    assert(clientData.email === 'rohan@veritasenergy.in', 'Shows Email: rohan@veritasenergy.in');
    assert(clientData.phone === '+91 98765 00112', 'Shows Phone: +91 98765 00112');
    assert(clientData.address === 'Lavelle Road, Bengaluru, Karnataka', 'Shows Address: Lavelle Road, Bengaluru, Karnataka');
    assert(clientData.services.includes('Logo Design') && clientData.services.includes('Website'), 'Shows Selected Work');

    // 7. Update Status (Pending -> Approved) & Internal Notes
    console.log('\n[Step 7: Update Status & Internal Notes]');
    const updateRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/projects/${token}/status`,
      method: 'PATCH',
      headers: {
        'x-admin-token': adminToken,
        'Content-Type': 'application/json'
      }
    }, {
      status: 'Approved'
    });
    assert(updateRes.statusCode === 200, 'Status update endpoint responded 200 OK');
    assert(updateRes.body.project.status === 'Approved', 'Status persisted as Approved');

    const notesRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/projects/${token}/notes`,
      method: 'PATCH',
      headers: {
        'x-admin-token': adminToken,
        'Content-Type': 'application/json'
      }
    }, {
      notes: 'Brand moodboard presentation scheduled for Friday 3 PM.'
    });
    assert(notesRes.statusCode === 200, 'Internal notes saved successfully');

    // 8. Verify Database Persistence on Disk
    console.log('\n[Step 8: Verify Database Persistence on Disk]');
    const dbPath = path.join(__dirname, '..', 'data', 'database.json');
    const dbRaw = fs.readFileSync(dbPath, 'utf-8');
    const dbJson = JSON.parse(dbRaw);
    const persistedProject = dbJson.projects.find(p => p.id === token);
    assert(persistedProject !== undefined, 'Project exists in persistent database.json file');
    assert(persistedProject.status === 'Approved', 'Status "Approved" persisted on disk');
    assert(persistedProject.notes.includes('Friday 3 PM'), 'Internal notes persisted on disk');
    assert(persistedProject.address === 'Lavelle Road, Bengaluru, Karnataka', 'Address persisted on disk');

    console.log(`\n====================================================`);
    console.log(`🎉 Complete End-to-End Verification: ${passed} Passed, ${failed} Failed`);
    console.log(`====================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Workflow error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

verifyFullWorkflow();
