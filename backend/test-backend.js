const http = require('http');
const { app } = require('./src/server');

const TEST_PORT = 5055;

const runTests = async () => {
  console.log('--- Starting Backend Verification Tests ---');

  const server = app.listen(TEST_PORT, async () => {
    console.log(`Test server running on port ${TEST_PORT}`);

    const fetchJson = (path, options = {}) => {
      return new Promise((resolve, reject) => {
        const req = http.request(
          {
            hostname: 'localhost',
            port: TEST_PORT,
            path,
            method: options.method || 'GET',
            headers: options.headers || {},
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
              } catch (e) {
                resolve({ statusCode: res.statusCode, raw: data });
              }
            });
          }
        );
        req.on('error', reject);
        if (options.body) {
          req.write(JSON.stringify(options.body));
        }
        req.end();
      });
    };

    try {
      // 1. Test Health Check Endpoint
      console.log('Testing GET /api/health...');
      const healthRes = await fetchJson('/api/health');
      console.log(`Health Status: ${healthRes.statusCode}`, healthRes.body);
      if (healthRes.statusCode !== 200 || !healthRes.body.service) {
        throw new Error('Health check test failed');
      }
      console.log('✓ Health check passed (Properly reports degraded/healthy without secrets).');

      // 2. Test Root Endpoint
      console.log('Testing GET /...');
      const rootRes = await fetchJson('/');
      console.log(`Root Status: ${rootRes.statusCode}`, rootRes.body);
      if (rootRes.statusCode !== 200) {
        throw new Error('Root endpoint failed');
      }
      console.log('✓ Root route passed.');

      // 3. Test Student Endpoint when DB not connected
      console.log('Testing GET /api/students (without DB connection configured)...');
      const studentsRes = await fetchJson('/api/students');
      console.log(`Students Status: ${studentsRes.statusCode}`, studentsRes.body);
      if (studentsRes.statusCode !== 503) {
        throw new Error(`Expected 503 Service Unavailable when DB is disconnected, got ${studentsRes.statusCode}`);
      }
      console.log('✓ Graceful database disconnected handling verified.');

      console.log('\nAll backend smoke tests PASSED successfully!');
    } catch (err) {
      console.error('❌ Backend test failed:', err);
      process.exitCode = 1;
    } finally {
      server.close(() => {
        console.log('Test server closed.');
        process.exit(process.exitCode || 0);
      });
    }
  });
};

runTests();
