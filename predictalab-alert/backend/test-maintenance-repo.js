// Test the new maintenance dashboard repository functions
const maintenanceRepo = require('./src/repositories/maintenance.repository');

async function test() {
  try {
    console.log('Testing getMaintenanceDashboardStats...');
    const stats = await maintenanceRepo.getMaintenanceDashboardStats();
    console.log('✅ Stats:', JSON.stringify(stats, null, 2));

    console.log('\nTesting getFilteredMaintenanceLogs...');
    const logs = await maintenanceRepo.getFilteredMaintenanceLogs({ limit: 5, offset: 0 });
    console.log(`✅ Logs: Found ${logs.length} logs`);
    if (logs.length > 0) {
      console.log('Sample log:', JSON.stringify(logs[0], null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

test();
