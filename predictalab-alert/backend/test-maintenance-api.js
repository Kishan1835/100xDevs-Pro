const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/maintenance';

async function testEndpoints() {
  console.log('Testing Maintenance API Endpoints...\n');

  try {
    // Test 1: Get maintenance stats
    console.log('1. Testing GET /api/maintenance/stats');
    const statsResponse = await axios.get(`${BASE_URL}/stats`);
    console.log('✓ Stats Response:', JSON.stringify(statsResponse.data, null, 2));
    console.log('');

    // Test 2: Get detailed maintenance logs
    console.log('2. Testing GET /api/maintenance/logs/detailed');
    const logsResponse = await axios.get(`${BASE_URL}/logs/detailed`);
    console.log('✓ Logs Response (first 2 entries):');
    console.log(JSON.stringify(logsResponse.data.data.slice(0, 2), null, 2));
    console.log(`Total logs: ${logsResponse.data.data.length}`);
    console.log('');

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Stack:', error.stack);
  }
}

// Run tests
testEndpoints();
