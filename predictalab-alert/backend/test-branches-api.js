/**
 * Test suite for Branches API endpoints
 * Run backend server first: node src/server.js
 * Then run this test: node test-branches-api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/branches';
const TEST_ITI_ID = 1; // Change this if needed

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`)
};

async function testGetAllBranches() {
  log.section('TEST 1: GET /api/branches');
  try {
    const response = await axios.get(BASE_URL);
    
    if (response.data.success) {
      log.success('Successfully fetched all branches');
      log.info(`Total ITIs: ${response.data.data.length}`);
      
      if (response.data.data.length > 0) {
        const sample = response.data.data[0];
        log.info(`Sample ITI: ${sample.name}`);
        log.info(`  - Total Machines: ${sample.totalMachines}`);
        log.info(`  - Working Machines: ${sample.workingMachines}`);
        log.info(`  - Total Students: ${sample.totalStudents}`);
        log.info(`  - Workforce Count: ${sample.workforceCount}`);
        log.info(`  - ITI Score: ${sample.itiScore}`);
      }
    } else {
      log.error('Response success flag is false');
    }
  } catch (error) {
    log.error(`Request failed: ${error.message}`);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
  }
}

async function testGetBranchById() {
  log.section(`TEST 2: GET /api/branches/${TEST_ITI_ID}`);
  try {
    const response = await axios.get(`${BASE_URL}/${TEST_ITI_ID}`);
    
    if (response.data.success) {
      log.success('Successfully fetched branch details');
      const data = response.data.data;
      log.info(`ITI Name: ${data.name}`);
      log.info(`Address: ${data.address}, ${data.city}, ${data.state}`);
      log.info(`ITI Score: ${data.itiScore}`);
      log.info(`\nMachine Health:`);
      log.info(`  - Total: ${data.totalMachines}`);
      log.info(`  - Healthy: ${data.healthyMachines}`);
      log.info(`  - Alert: ${data.alertMachines}`);
      log.info(`  - Critical: ${data.criticalMachines}`);
      log.info(`\nStudent Info:`);
      log.info(`  - Total: ${data.totalStudents}`);
      log.info(`  - Placed: ${data.placedStudents}`);
      log.info(`\nWorkforce:`);
      log.info(`  - ITI Staff: ${data.itiStaffCount}`);
      log.info(`  - Maintenance Workers: ${data.maintenanceWorkersCount}`);
      log.info(`\nTrades: ${data.trades?.join(', ') || 'None'}`);
    } else {
      log.error('Response success flag is false');
    }
  } catch (error) {
    log.error(`Request failed: ${error.message}`);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
  }
}

async function testGetRecentActivities() {
  log.section(`TEST 3: GET /api/branches/${TEST_ITI_ID}/recent-activities`);
  try {
    const response = await axios.get(`${BASE_URL}/${TEST_ITI_ID}/recent-activities`);
    
    if (response.data.success) {
      log.success('Successfully fetched recent activities');
      log.info(`Total Activities: ${response.data.data.length}`);
      
      response.data.data.forEach((activity, index) => {
        log.info(`\nActivity ${index + 1}:`);
        log.info(`  - Issue: ${activity.issue}`);
        log.info(`  - Status: ${activity.status}`);
        log.info(`  - Severity: ${activity.severity}`);
        log.info(`  - Machine ID: ${activity.machineId}`);
        log.info(`  - Reported: ${new Date(activity.reportedAt).toLocaleString()}`);
      });
    } else {
      log.error('Response success flag is false');
    }
  } catch (error) {
    log.error(`Request failed: ${error.message}`);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
  }
}

async function testGetComplaintTrend() {
  log.section(`TEST 4: GET /api/branches/${TEST_ITI_ID}/complaint-trend`);
  try {
    const response = await axios.get(`${BASE_URL}/${TEST_ITI_ID}/complaint-trend`);
    
    if (response.data.success) {
      log.success('Successfully fetched complaint trend');
      log.info(`Total Months: ${response.data.data.length}`);
      
      response.data.data.forEach((month) => {
        log.info(`  ${month.month}: ${month.count} complaints`);
      });
    } else {
      log.error('Response success flag is false');
    }
  } catch (error) {
    log.error(`Request failed: ${error.message}`);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
  }
}

async function testGetReportData() {
  log.section(`TEST 5: GET /api/branches/${TEST_ITI_ID}/report-data`);
  try {
    const response = await axios.get(`${BASE_URL}/${TEST_ITI_ID}/report-data`);
    
    if (response.data.success) {
      log.success('Successfully fetched report data');
      const data = response.data.data;
      
      log.info('\nInstitute Profile:');
      log.info(`  - Name: ${data.instituteProfile.name}`);
      log.info(`  - Address: ${data.instituteProfile.address}`);
      log.info(`  - City: ${data.instituteProfile.city}, ${data.instituteProfile.state}`);
      log.info(`  - Established: ${data.instituteProfile.establishedYear}`);
      log.info(`  - Contact: ${data.instituteProfile.contact || 'N/A'}`);
      log.info(`  - Score: ${data.instituteProfile.itiScore}`);
      log.info(`  - Trades: ${data.instituteProfile.tradesOffered?.join(', ') || 'None'}`);
      
      log.info('\nInfrastructure:');
      log.info(`  - Total Machines: ${data.infrastructure.totalMachines}`);
      log.info(`  - Healthy Machines: ${data.infrastructure.healthyMachines}`);
      
      log.info('\nStaff & Training:');
      log.info(`  - ITI Staff: ${data.staffTraining.itiStaffCount}`);
      log.info(`  - Maintenance Workers: ${data.staffTraining.maintenanceWorkersCount}`);
      
      log.info('\nStudents:');
      log.info(`  - Total: ${data.students.totalStudents}`);
      log.info(`  - Placed: ${data.students.placedStudents}`);
    } else {
      log.error('Response success flag is false');
    }
  } catch (error) {
    log.error(`Request failed: ${error.message}`);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
  }
}

async function runAllTests() {
  console.log(`${colors.yellow}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.yellow}║   Branches API Test Suite             ║${colors.reset}`);
  console.log(`${colors.yellow}╚════════════════════════════════════════╝${colors.reset}`);
  console.log(`Testing against: ${BASE_URL}`);
  console.log(`Using ITI_ID: ${TEST_ITI_ID}`);
  
  await testGetAllBranches();
  await testGetBranchById();
  await testGetRecentActivities();
  await testGetComplaintTrend();
  await testGetReportData();
  
  log.section('TEST SUITE COMPLETED');
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
