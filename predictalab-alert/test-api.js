const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/schedules',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      if (parsed.data && parsed.data.length > 0) {
        console.log('\n✓ First record details:');
        console.log('  - S_Log_ID:', parsed.data[0].S_Log_ID);
        console.log('  - worker:', parsed.data[0].worker);
        console.log('  - student:', parsed.data[0].student);
        console.log('  - Scheduled_On:', parsed.data[0].Scheduled_On);
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
