require('dotenv').config();
const monitoringService = require('./monitoring.service');
const emailService = require('./email.service');

/**
 * Machine Status Monitoring Scheduler
 * Runs every 2 minutes to check database for machines with ALERT/CRITICAL status
 * 
 * This is an external service that can run independently of the main server
 * 
 * Usage:
 *   node src/services/monitor-scheduler.js
 * 
 * Or add to package.json:
 *   "monitor": "node src/services/monitor-scheduler.js"
 */

const CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds

let isRunning = false;
let intervalId = null;

/**
 * Main monitoring function
 */
async function runMonitoring() {
  if (isRunning) {
    console.log('⏳ Previous monitoring cycle still running, skipping...');
    return;
  }

  isRunning = true;
  const startTime = new Date();

  try {
    console.log('\n' + '='.repeat(60));
    console.log(`🔄 Starting monitoring cycle at ${startTime.toLocaleString()}`);
    console.log('='.repeat(60));

    // Process all alerts
    const result = await monitoringService.processAllAlerts();

    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('='.repeat(60));
    console.log(`✅ Monitoring cycle completed in ${duration}s`);
    console.log(`   Processed: ${result.processed} machine(s)`);
    console.log(`   Next check in 2 minutes...`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error in monitoring cycle:', error);
  } finally {
    isRunning = false;
  }
}

/**
 * Start the monitoring scheduler
 */
function startMonitoring() {
  console.log('\n🚀 Machine Status Monitoring Service Started');
  console.log(`⏰ Checking database every 2 minutes`);
  console.log(`📊 Monitoring for machines with ALERT or CRITICAL status\n`);

  // Test email configuration on startup
  emailService.testEmailConfig().then(isReady => {
    if (!isReady) {
      console.warn('⚠️  Email service not configured. Email notifications will be skipped.');
      console.warn('   Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env file to enable emails.\n');
    }
  });

  // Run immediately on start
  runMonitoring();

  // Then run every 2 minutes
  intervalId = setInterval(runMonitoring, CHECK_INTERVAL);
}

/**
 * Stop the monitoring scheduler
 */
function stopMonitoring() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('\n🛑 Monitoring service stopped');
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📡 SIGTERM received, shutting down gracefully...');
  stopMonitoring();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n📡 SIGINT received, shutting down gracefully...');
  stopMonitoring();
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  stopMonitoring();
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  stopMonitoring();
  process.exit(1);
});

// Start monitoring if this file is run directly
if (require.main === module) {
  startMonitoring();
}

module.exports = {
  startMonitoring,
  stopMonitoring,
  runMonitoring
};

