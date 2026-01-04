const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testDashboardEndpoints() {
  console.log('Testing Dashboard Endpoints...\n');

  try {
    // Test stats endpoint
    console.log('1. Testing GET /api/dashboard/stats');
    const statsResponse = await axios.get(`${API_BASE_URL}/dashboard/stats`);
    console.log('✅ Stats Response:', JSON.stringify(statsResponse.data, null, 2));
    console.log('');

    // Test locations endpoint
    console.log('2. Testing GET /api/dashboard/locations');
    const locationsResponse = await axios.get(`${API_BASE_URL}/dashboard/locations`);
    console.log('✅ Locations Response:', JSON.stringify(locationsResponse.data, null, 2));
    console.log('');

    // Test ITI scores endpoint
    console.log('3. Testing GET /api/dashboard/iti-scores');
    const scoresResponse = await axios.get(`${API_BASE_URL}/dashboard/iti-scores`);
    console.log('✅ ITI Scores Response:', JSON.stringify(scoresResponse.data, null, 2));
    console.log('');

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Wait a bit for server to start
setTimeout(testDashboardEndpoints, 2000);
