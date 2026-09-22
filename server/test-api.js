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
  console.log('🧪 Starting ELYRA Visual Studio Admin Portal & Registration Automated Test Suite...\n');
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

    // 2. Client Registration Validation (Missing Required Fields)
    console.log('\n[Test 2: Registration Validation]');
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
    assert(invalidSubRes.statusCode === 400, 'Rejects empty registration with 400 Bad Request');
    assert(invalidSubRes.body.errors.length >= 3, 'Returns detailed validation errors array');

    // 3. Valid Client Registration Submission (with Address, Work Selection, and Reference Token)
    console.log('\n[Test 3: Valid Client Registration Flow]');
    const validSubRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/projects',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'Meera Krishnan',
      businessName: 'Lumina Organic Cosmetics',
      phone: '+91 94444 33333',
      email: 'meera@luminabrand.com',
      address: 'Indiranagar, Bengaluru, Karnataka',
      services: ['Logo Design', 'Branding', 'Website'],
      requirements: 'Need complete brand identity, luxury cosmetic packaging design and responsive e-commerce landing page.',
      timeline: '2-3 weeks'
    });
    assert(validSubRes.statusCode === 201, 'Creates registration with 201 Created');
    assert(validSubRes.body.success === true, 'Returns success: true');
    assert(validSubRes.body.referenceToken && validSubRes.body.referenceToken.startsWith('ELYRA-'), 'Generates unique branded reference token (ELYRA-2026-XXXX)');
    assert(validSubRes.body.registration.address === 'Indiranagar, Bengaluru, Karnataka', 'Properly saves client address');
    assert(validSubRes.body.registration.status === 'Pending', 'Default status is Pending');
    const createdToken = validSubRes.body.referenceToken;

    // 4. Admin Auth Protection (Unauthorized without token)
    console.log('\n[Test 4: Admin Route Protection]');
    const unauthRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/stats',
      method: 'GET'
    });
    assert(unauthRes.statusCode === 401, 'Blocks unauthenticated admin request with 401 Unauthorized');

    // 5. Admin Login with Email (Invalid Password)
    console.log('\n[Test 5: Admin Login Validation]');
    const badLoginRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'elyravisualstudio@gmail.com',
      password: 'wrongpassword'
    });
    assert(badLoginRes.statusCode === 401, 'Rejects incorrect password with 401');

    // 6. Admin Login with designated email: elyravisualstudio@gmail.com (Successful)
    console.log('\n[Test 6: Admin Login Success with elyravisualstudio@gmail.com]');
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
    assert(loginRes.statusCode === 200, 'Logs in admin with 200 OK');
    assert(loginRes.body.token && loginRes.body.token.length > 20, 'Returns session token');
    const adminToken = loginRes.body.token;

    // 7. Get Dashboard Stats (Total, Pending, Approved, etc.)
    console.log('\n[Test 7: Admin Dashboard Stats]');
    const statsRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { 'x-admin-token': adminToken }
    });
    assert(statsRes.statusCode === 200, 'Fetches stats successfully');
    assert(statsRes.body.stats.totalRegistrations >= 1, 'Stats include total registrations count');
    assert(statsRes.body.stats.pending >= 1, 'Stats include pending registrations count');

    // 8. Admin Fetch All Registrations & Verify Complete Client Details
    console.log('\n[Test 8: Admin Complete Client Registration Details]');
    const singleProjectRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/projects/${createdToken}`,
      method: 'GET',
      headers: { 'x-admin-token': adminToken }
    });
    assert(singleProjectRes.statusCode === 200, 'Admin fetches complete client registration');
    const reg = singleProjectRes.body.registration || singleProjectRes.body.project;
    assert(reg.referenceToken === createdToken, 'Shows client Reference Token');
    assert(reg.fullName === 'Meera Krishnan', 'Shows client Full Name');
    assert(reg.email === 'meera@luminabrand.com', 'Shows client Email');
    assert(reg.phone === '+91 94444 33333', 'Shows client Phone Number');
    assert(reg.address === 'Indiranagar, Bengaluru, Karnataka', 'Shows client Address');
    assert(reg.services.includes('Branding') && reg.services.includes('Website'), 'Shows client Selected Work');
    assert(reg.requirements.includes('cosmetic packaging'), 'Shows client project requirements');
    assert(reg.createdAt !== undefined, 'Shows registration date & time');

    // 9. Search Registrations (by Token, Name, Phone, Email, Address)
    console.log('\n[Test 9: Admin Search Filter]');
    const searchRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/projects?search=Meera`,
      method: 'GET',
      headers: { 'x-admin-token': adminToken }
    });
    assert(searchRes.statusCode === 200, 'Search executes successfully');
    assert(searchRes.body.projects.some(p => p.fullName === 'Meera Krishnan'), 'Finds registration by client name');

    const searchPhoneRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/projects?search=94444`,
      method: 'GET',
      headers: { 'x-admin-token': adminToken }
    });
    assert(searchPhoneRes.body.projects.some(p => p.phone.includes('94444')), 'Finds registration by phone number');

    // 10. Filter by Work / Service
    console.log('\n[Test 10: Filter by Selected Work]');
    const workFilterRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/projects?work=Branding`,
      method: 'GET',
      headers: { 'x-admin-token': adminToken }
    });
    assert(workFilterRes.statusCode === 200, 'Work filter executes successfully');
    assert(workFilterRes.body.projects.every(p => p.services.some(s => s.toLowerCase().includes('brand'))), 'All filtered registrations include Branding');

    // 11. Update Status (Pending -> Approved)
    console.log('\n[Test 11: Update Registration Status]');
    const statusRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/projects/${createdToken}/status`,
      method: 'PATCH',
      headers: {
        'x-admin-token': adminToken,
        'Content-Type': 'application/json'
      }
    }, {
      status: 'Approved'
    });
    assert(statusRes.statusCode === 200, 'Updates registration status');
    assert(statusRes.body.project.status === 'Approved', 'Registration status is now Approved');

    // 12. Save Internal Studio Notes
    console.log('\n[Test 12: Update Internal Notes]');
    const notesRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/projects/${createdToken}/notes`,
      method: 'PATCH',
      headers: {
        'x-admin-token': adminToken,
        'Content-Type': 'application/json'
      }
    }, {
      notes: 'Initial client briefing call scheduled for Friday 4 PM.'
    });
    assert(notesRes.statusCode === 200, 'Saves internal notes');
    assert(notesRes.body.project.notes.includes('Friday 4 PM'), 'Notes saved in database correctly');

    // 13. Delete Registration
    console.log('\n[Test 13: Delete Registration]');
    const deleteRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/projects/${createdToken}`,
      method: 'DELETE',
      headers: { 'x-admin-token': adminToken }
    });
    assert(deleteRes.statusCode === 200, 'Deletes registration successfully');

    // Verify deletion
    const verifyDelRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/projects/${createdToken}`,
      method: 'GET',
      headers: { 'x-admin-token': adminToken }
    });
    assert(verifyDelRes.statusCode === 404, 'Registration no longer exists in database');

    console.log(`\n====================================================`);
    console.log(`🏁 All API Tests Passed: ${passed} Passed, ${failed} Failed`);
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
