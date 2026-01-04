// Test if notifications routes load correctly
console.log('Testing notifications routes...');

try {
  const notificationsRoutes = require('./src/routes/notifications.routes');
  console.log('✅ notifications.routes.js loaded successfully');
  
  const notificationsController = require('./src/controllers/notifications.controller');
  console.log('✅ notifications.controller.js loaded successfully');
  
  const notificationsRepository = require('./src/repositories/notifications.repository');
  console.log('✅ notifications.repository.js loaded successfully');
  
  console.log('\n✅ All notification modules loaded without errors!');
} catch (error) {
  console.error('❌ Error loading modules:', error.message);
  console.error(error.stack);
}
