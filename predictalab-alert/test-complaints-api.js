/**
 * Test file for Complaints API endpoints
 * Run with: node test-complaints-api.js
 * Make sure the backend server is running first
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testComplaintsStats() {
  log('cyan', '\n========================================');
  log('cyan', 'Testing GET /api/complaints/stats');
  log('cyan', '========================================\n');

  try {
    const response = await axios.get(`${BASE_URL}/complaints/stats`);
    
    log('green', '✓ Request successful');
    log('blue', '\nResponse:');
    console.log(JSON.stringify(response.data, null, 2));

    // Validate response structure
    const { data } = response.data;
    if (data.raisedCount !== undefined && 
        data.inProgressCount !== undefined && 
        data.solvedCount !== undefined) {
      log('green', '\n✓ Response structure is valid');
    } else {
      log('red', '\n✗ Response structure is invalid');
    }

    return true;
  } catch (error) {
    log('red', '✗ Request failed');
    if (error.response) {
      log('red', `Status: ${error.response.status}`);
      log('red', `Message: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      log('red', `Error: ${error.message}`);
    }
    return false;
  }
}

async function testBranchComplaintSummary() {
  log('cyan', '\n========================================');
  log('cyan', 'Testing GET /api/complaints/branches');
  log('cyan', '========================================\n');

  try {
    const response = await axios.get(`${BASE_URL}/complaints/branches`);
    
    log('green', '✓ Request successful');
    log('blue', '\nResponse:');
    console.log(JSON.stringify(response.data, null, 2));

    // Validate response structure
    const { data } = response.data;
    if (Array.isArray(data)) {
      log('green', `\n✓ Response is an array with ${data.length} branches`);
      
      if (data.length > 0) {
        const firstBranch = data[0];
        const requiredFields = ['itiId', 'name', 'raisedCount', 'inProgressCount', 
                                'solvedCount', 'highestSeverity', 'score', 'lastUpdated'];
        const hasAllFields = requiredFields.every(field => field in firstBranch);
        
        if (hasAllFields) {
          log('green', '✓ Branch objects have all required fields');
        } else {
          log('red', '✗ Branch objects are missing required fields');
        }
      }
    } else {
      log('red', '\n✗ Response is not an array');
    }

    return true;
  } catch (error) {
    log('red', '✗ Request failed');
    if (error.response) {
      log('red', `Status: ${error.response.status}`);
      log('red', `Message: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      log('red', `Error: ${error.message}`);
    }
    return false;
  }
}

async function runTests() {
  log('yellow', '\n╔════════════════════════════════════════╗');
  log('yellow', '║   COMPLAINTS API TEST SUITE            ║');
  log('yellow', '╚════════════════════════════════════════╝');

  const results = [];

  // Test 1: Complaint Stats
  results.push(await testComplaintsStats());

  // Test 2: Branch Complaint Summary
  results.push(await testBranchComplaintSummary());

  // Summary
  log('cyan', '\n========================================');
  log('cyan', 'TEST SUMMARY');
  log('cyan', '========================================\n');

  const passed = results.filter(r => r).length;
  const total = results.length;

  if (passed === total) {
    log('green', `✓ All tests passed (${passed}/${total})`);
  } else {
    log('red', `✗ Some tests failed (${passed}/${total})`);
  }

  log('yellow', '\n========================================\n');
}

// Run tests
runTests().catch(error => {
  log('red', `Fatal error: ${error.message}`);
  process.exit(1);
});
