const dotenv = require('dotenv');
dotenv.config();

console.log('1. Starting server...');

try {
  const app = require('./src/app');
  console.log('2. App loaded');
  
  const PORT = process.env.PORT || 5000;
  console.log('3. PORT:', PORT);
  
  const server = app.listen(PORT, () => {
    console.log(`4. Server listening on port ${PORT}`);
  });
  
  console.log('5. Server object created');
  
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
  
  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    process.exit(0);
  });
  
  console.log('6. Event handlers attached');
  
} catch (err) {
  console.error('Caught error:', err);
  process.exit(1);
}

console.log('7. Script end reached - server should be running');

// Prevent the script from exiting
setInterval(() => {}, 1000);
