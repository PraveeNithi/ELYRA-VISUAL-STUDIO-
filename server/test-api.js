const http = require('http');
const app = require('./server');
const db = require('./db');

let server;
const PORT = 3099;

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

async function runTests() {
  console.log('🧪 Starting ELYRA Visual Studio API Automated Test Suite...\n');
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
    // 1. Health Check
    console.log('[Test 1: Health Check]');
    const healthRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/health',
      method: 'GET'
    });
    assert(healthRes.statusCode === 200, 'Health endpoint responds with 200 OK');
    assert(healthRes.body.brand === 'ELYRA Visual Studio', 'Returns correct brand name');

    // 2. Client Project Submission Validation (Missing Fields)
    console.log('\n[Test 2: Project Submission Validation]');
    const invalidSubRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/projects',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: '',
      businessName: '',
      phone: ''
    });
    assert(invalidSubRes.statusCode === 400, 'Rejects empty submission with 400 Bad Request');
    assert(invalidSubRes.body.errors.length >= 3, 'Returns detailed validation errors array');

    // 3. Valid Client Project Submission
    console.log('\n[Test 3: Valid Project Submission]');
    const validSubRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/projects',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'Dev Testing User',
      businessName: 'Starlight Media Corp',
      phone: '+91 98888 77777',
      email: 'dev@starlight.com',
      services: ['Logo Design', 'Branding', 'Website'],
      requirements: 'Need modern logo, brand guidelines and a 5-page responsive studio website.',
      timeline: '2-3 weeks'
    });
    assert(validSubRes.statusCode === 201, 'Creates project submission with 201 Created');
    assert(validSubRes.body.success === true, 'Returns success: true');
    assert(validSubRes.body.projectId.startsWith('ELY-'), 'Generates valid ELY-ID format');
    const createdId = validSubRes.body.projectId;

    // 4. Admin Auth Protection (Unauthorized without token)
    console.log('\n[Test 4: Admin Route Protection]');
    const unauthRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/stats',
      method: 'GET'
    });
    assert(unauthRes.statusCode === 401, 'Blocks unauthenticated admin request with 401 Unauthorized');

    // 5. Admin Login (Invalid Password)
    console.log('\n[Test 5: Admin Login Validation]');
    const badLoginRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      username: 'admin',
      password: 'wrongpassword'
    });
    assert(badLoginRes.statusCode === 401, 'Rejects incorrect password with 401');

    // 6. Admin Login (Successful)
    console.log('\n[Test 6: Admin Login Success]');
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
    assert(loginRes.statusCode === 200, 'Logs in admin with 200 OK');
    assert(loginRes.body.token.length > 20, 'Returns session token');
    const adminToken = loginRes.body.token;

    // 7. Get Dashboard Stats
    console.log('\n[Test 7: Admin Dashboard Stats]');
    const statsRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { 'x-admin-token': adminToken }
    });
    assert(statsRes.statusCode === 200, 'Fetches stats successfully');
    assert(statsRes.body.stats.totalRequests >= 4, 'Stats include new submission in total count');
    assert(statsRes.body.stats.newRequests >= 1, 'Stats show at least 1 new request');

    // 8. Get Notifications List
    console.log('\n[Test 8: Admin Notifications List]');
    const notifsRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/notifications',
      method: 'GET',
      headers: { 'x-admin-token': adminToken }
    });
    assert(notifsRes.statusCode === 200, 'Fetches notifications');
    const latestNotif = notifsRes.body.notifications.find(n => n.projectId === createdId);
    assert(latestNotif !== undefined, 'Found notification created for the new project submission');
    assert(latestNotif.read === false, 'Notification is marked unread initially');

    // 9. Mark Notification Read
    console.log('\n[Test 9: Mark Notification Read]');
    if (latestNotif) {
      const markReadRes = await request({
        hostname: 'localhost',
        port: PORT,
        path: `/api/admin/notifications/${latestNotif.id}/read`,
        method: 'PATCH',
        headers: { 'x-admin-token': adminToken }
      });
      assert(markReadRes.statusCode === 200, 'Marks notification as read');
      assert(markReadRes.body.notification.read === true, 'Notification status updated to true');
    }

    // 10. Update Project Status (New -> In Progress)
    console.log('\n[Test 10: Update Project Status]');
    const statusRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/projects/${createdId}/status`,
      method: 'PATCH',
      headers: {
        'x-admin-token': adminToken,
        'Content-Type': 'application/json'
      }
    }, {
      status: 'In Progress'
    });
    assert(statusRes.statusCode === 200, 'Updates project status');
    assert(statusRes.body.project.status === 'In Progress', 'Project status is now In Progress');

    // Clean up test project
    db.deleteProject(createdId);

    console.log(`\n====================================================`);
    console.log(`🏁 API Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`====================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();
