const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

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

    // 3. Client Submission (Rohan Deshmukh)
    console.log('\n[Step 3: Client Submits Project Request]');
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
      services: ['Logo Design', 'Branding', 'Website'],
      requirements: 'We require a modern logo mark, complete sustainability brand guidelines, and a responsive 4-page corporate website with inquiry capture.',
      timeline: '2-3 weeks'
    });
    assert(subRes.statusCode === 201, 'Submission successfully returns 201 Created');
    assert(subRes.body.message === 'Project request received successfully!', 'Returns exact success message');
    const projectId = subRes.body.projectId;
    assert(projectId && projectId.startsWith('ELY-'), `Generated valid project reference ID: ${projectId}`);

    // 4. Admin Login
    console.log('\n[Step 4: Admin Authentication]');
    const loginRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      username: 'admin',
      password: 'elyra2026!secure'
    });
    assert(loginRes.statusCode === 200, 'Admin login succeeded with 200 OK');
    const token = loginRes.body.token;
    assert(token && token.length > 20, 'Received valid admin session token');

    // 5. Check Dashboard Stats & Notifications
    console.log('\n[Step 5: Dashboard Stats & Notifications]');
    const statsRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { 'x-admin-token': token }
    });
    assert(statsRes.statusCode === 200, 'Fetched stats successfully');
    assert(statsRes.body.stats.newRequests >= 1, `New requests counter: ${statsRes.body.stats.newRequests}`);

    const notifsRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/notifications',
      method: 'GET',
      headers: { 'x-admin-token': token }
    });
    const rohanNotif = notifsRes.body.notifications.find(n => n.projectId === projectId);
    assert(rohanNotif !== undefined, `Found notification for project ${projectId} (${rohanNotif?.message})`);

    // 6. Update Status (New -> In Progress)
    console.log('\n[Step 6: Update Status & Internal Notes]');
    const updateRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/projects/${projectId}/status`,
      method: 'PATCH',
      headers: {
        'x-admin-token': token,
        'Content-Type': 'application/json'
      }
    }, {
      status: 'In Progress'
    });
    assert(updateRes.statusCode === 200, 'Status update endpoint responded 200 OK');
    assert(updateRes.body.project.status === 'In Progress', 'Status persisted as In Progress');

    const notesRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/projects/${projectId}/notes`,
      method: 'PATCH',
      headers: {
        'x-admin-token': token,
        'Content-Type': 'application/json'
      }
    }, {
      notes: 'Brand moodboard presentation scheduled for Friday.'
    });
    assert(notesRes.statusCode === 200, 'Internal notes saved successfully');

    // 7. Verify Database Persistence on Disk
    console.log('\n[Step 7: Verify Database Persistence on Disk]');
    const dbPath = path.join(__dirname, '..', 'data', 'database.json');
    const dbRaw = fs.readFileSync(dbPath, 'utf-8');
    const dbJson = JSON.parse(dbRaw);
    const persistedProject = dbJson.projects.find(p => p.id === projectId);
    assert(persistedProject !== undefined, 'Project exists in persistent database.json file');
    assert(persistedProject.status === 'In Progress', 'Status "In Progress" persisted on disk');
    assert(persistedProject.notes.includes('Friday'), 'Internal notes persisted on disk');

    console.log(`\n====================================================`);
    console.log(`🎉 Complete End-to-End Verification: ${passed} Passed, ${failed} Failed`);
    console.log(`====================================================\n`);

  } catch (err) {
    console.error('Workflow error:', err);
  }
}

verifyFullWorkflow();
