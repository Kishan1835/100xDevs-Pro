const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/schedule-logs',
  method: 'GET'
};

console.log('🧪 Testing GET /api/schedule-logs...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('✅ Status:', res.statusCode);
    console.log('\n📦 Response:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.success && parsed.data && parsed.data.length > 0) {
        console.log('\n✓ Sample log entry:');
        console.log('  - Log ID:', parsed.data[0].logId);
        console.log('  - ITI Name:', parsed.data[0].itiName);
        console.log('  - Machine:', parsed.data[0].machineName);
        console.log('  - Worker:', parsed.data[0].workerName);
        console.log('  - Student:', parsed.data[0].studentName);
        console.log('  - Scheduled On:', parsed.data[0].scheduledOn);
        console.log('  - Time:', parsed.data[0].time, 'hours');
      } else if (parsed.success && parsed.data && parsed.data.length === 0) {
        console.log('\nℹ️  No schedule logs found in database');
      }
    } catch (e) {
      console.log(data);
      console.error('\n❌ Error parsing response:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.error('Make sure the backend server is running on http://localhost:5000');
});

req.end();
