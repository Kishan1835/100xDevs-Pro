// Quick Test Script for TO Maintenance API Endpoints
// Run this file with: node test-to-maintenance-api.js

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/maintenance';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function testToStats() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.blue}Testing TO Stats Endpoint${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  try {
    const response = await axios.get(`${BASE_URL}/to-stats`);
    
    if (response.data && response.data.data) {
      console.log(`${colors.green}✓ Stats endpoint working!${colors.reset}`);
      console.log('\nStats Data:');
      console.log(`  Active Machines: ${colors.yellow}${response.data.data.activeMachines}${colors.reset}`);
      console.log(`  Under Maintenance: ${colors.yellow}${response.data.data.underMaintenance}${colors.reset}`);
      console.log(`  Upcoming Maintenance: ${colors.yellow}${response.data.data.upcomingMaintenance}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ Unexpected response format${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Stats endpoint failed${colors.reset}`);
    console.log(`  Error: ${error.message}`);
    return false;
  }
}

async function testLogsDetailed() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.blue}Testing Logs Detailed Endpoint${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  try {
    const response = await axios.get(`${BASE_URL}/logs/detailed?limit=5`);
    
    if (response.data && response.data.data) {
      const logs = response.data.data;
      console.log(`${colors.green}✓ Logs endpoint working!${colors.reset}`);
      console.log(`\nFound ${colors.yellow}${logs.length}${colors.reset} maintenance logs:`);
      
      if (logs.length > 0) {
        console.log('\nSample Log:');
        const log = logs[0];
        console.log(`  Log ID: ${colors.yellow}${log.logId}${colors.reset}`);
        console.log(`  Machine: ${colors.yellow}${log.machineName}${colors.reset}`);
        console.log(`  Worker: ${colors.yellow}${log.workerName}${colors.reset}`);
        console.log(`  Contact: ${colors.yellow}${log.workerContact}${colors.reset}`);
        console.log(`  Issue: ${colors.yellow}${log.requestType || log.description}${colors.reset}`);
        console.log(`  Status: ${colors.yellow}${log.status}${colors.reset}`);
        console.log(`  Days Since Report: ${colors.yellow}${log.daysSinceReport}${colors.reset}`);
        console.log(`  Report Date: ${colors.yellow}${new Date(log.reportDate).toLocaleDateString()}${colors.reset}`);
        
        // Check for overdue logs
        const overdueLogs = logs.filter(l => 
          l.daysSinceReport > 3 && 
          l.status.toLowerCase() !== 'closed' && 
          l.status.toLowerCase() !== 'completed'
        );
        
        if (overdueLogs.length > 0) {
          console.log(`\n${colors.red}⚠ Warning: ${overdueLogs.length} overdue log(s) found!${colors.reset}`);
          overdueLogs.forEach(log => {
            console.log(`  - ${log.machineName}: ${log.daysSinceReport} days (${log.status})`);
          });
        }
      } else {
        console.log(`${colors.yellow}⚠ No logs found in database${colors.reset}`);
      }
      
      return true;
    } else {
      console.log(`${colors.red}✗ Unexpected response format${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Logs endpoint failed${colors.reset}`);
    console.log(`  Error: ${error.message}`);
    return false;
  }
}

async function testWithoutLimit() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.blue}Testing Logs Without Limit${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  try {
    const response = await axios.get(`${BASE_URL}/logs/detailed`);
    
    if (response.data && response.data.data) {
      const logs = response.data.data;
      console.log(`${colors.green}✓ Unlimited logs endpoint working!${colors.reset}`);
      console.log(`  Total logs: ${colors.yellow}${logs.length}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ Unexpected response format${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Unlimited logs endpoint failed${colors.reset}`);
    console.log(`  Error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log(`\n${colors.green}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.green}║  TO Maintenance API Test Suite        ║${colors.reset}`);
  console.log(`${colors.green}╚════════════════════════════════════════╝${colors.reset}`);
  
  const results = {
    stats: false,
    logsLimited: false,
    logsUnlimited: false,
  };
  
  // Test 1: Stats endpoint
  results.stats = await testToStats();
  await sleep(500);
  
  // Test 2: Logs with limit
  results.logsLimited = await testLogsDetailed();
  await sleep(500);
  
  // Test 3: Logs without limit
  results.logsUnlimited = await testWithoutLimit();
  
  // Summary
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.blue}Test Summary${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.values(results).length;
  
  console.log(`\nResults:`);
  console.log(`  Stats Endpoint:           ${results.stats ? colors.green + '✓ PASS' : colors.red + '✗ FAIL'}${colors.reset}`);
  console.log(`  Logs (Limited):           ${results.logsLimited ? colors.green + '✓ PASS' : colors.red + '✗ FAIL'}${colors.reset}`);
  console.log(`  Logs (Unlimited):         ${results.logsUnlimited ? colors.green + '✓ PASS' : colors.red + '✗ FAIL'}${colors.reset}`);
  
  console.log(`\n${colors.cyan}Total: ${passed}/${total} tests passed${colors.reset}`);
  
  if (passed === total) {
    console.log(`\n${colors.green}🎉 All tests passed! API is ready.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}❌ Some tests failed. Please check the backend.${colors.reset}\n`);
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests
runAllTests().catch(err => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, err);
  process.exit(1);
});
