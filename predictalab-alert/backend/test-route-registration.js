// Test route registration
console.log('Testing route registration...\n');

try {
  const express = require('express');
  const routes = require('./src/routes/index');
  
  const app = express();
  app.use('/api', routes);
  
  // Get all registered routes
  function getRoutes(stack, prefix = '') {
    const routesList = [];
    stack.forEach((layer) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods);
        routesList.push({
          path: prefix + layer.route.path,
          methods: methods
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        const path = layer.regexp.source
          .replace('\\/?', '')
          .replace('(?=\\/|$)', '')
          .replace(/\\\//g, '/')
          .replace(/\^/g, '');
        routesList.push(...getRoutes(layer.handle.stack, prefix + path));
      }
    });
    return routesList;
  }
  
  const routes_list = getRoutes(app._router.stack, '');
  
  console.log('Registered routes:');
  routes_list.forEach(route => {
    console.log(`${route.methods.join(', ').toUpperCase()} ${route.path}`);
  });
  
  const notificationRoutes = routes_list.filter(r => r.path.includes('notification'));
  if (notificationRoutes.length > 0) {
    console.log('\n✅ Notification routes are registered!');
  } else {
    console.log('\n❌ Notification routes NOT found!');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
}
