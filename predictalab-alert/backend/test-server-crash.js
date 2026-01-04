// Simple server test
require('dotenv').config();
const app = require('./src/app');

const PORT = 5001; // Use different port

const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log('Testing request in 2 seconds...');
  
  setTimeout(async () => {
    const http = require('http');
    
    http.get(`http://localhost:${PORT}/api/map/stats`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Response received:', data);
        server.close();
        process.exit(0);
      });
    }).on('error', err => {
      console.error('Request error:', err.message);
      server.close();
      process.exit(1);
    });
  }, 2000);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:',err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});
