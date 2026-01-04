const http = require('http');

function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`\n${path}:`);
        console.log(`Status: ${res.statusCode}`);
        console.log('Response:', data);
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error(`Error on ${path}:`, error.message);
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  try {
    await testEndpoint('/api/complaints/stats');
    await testEndpoint('/api/complaints/branches');
  } catch (err) {
    console.error('Test failed:', err);
  }
}

runTests();
