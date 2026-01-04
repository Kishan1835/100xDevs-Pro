const http = require('http');

console.log('Attempting to fetch /api/schedules...');

setTimeout(() => {
  const req = http.get('http://localhost:5000/api/schedules', res => {
    console.log(`Status: ${res.statusCode}`);
    let data = '';
    res.on('data', chunk => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Response:', data);
      process.exit(0);
    });
  });

  req.on('error', e => {
    console.error('Error:', e.code, e.message);
    process.exit(1);
  });

  // Timeout after 5 seconds
  setTimeout(() => {
    console.error('Timeout');
    process.exit(1);
  }, 5000);
}, 1000);
