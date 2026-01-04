const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testMapEndpoints() {
  console.log('🧪 Testing Map API Endpoints...\n');

  try {
    // Test 1: Get all locations
    console.log('1️⃣ Testing GET /api/map/locations');
    const locationsRes = await axios.get(`${API_BASE_URL}/map/locations`);
    console.log(`✅ Success! Found ${locationsRes.data.data.length} ITI locations`);
    if (locationsRes.data.data.length > 0) {
      console.log(`   Sample: ${locationsRes.data.data[0].Name} - ${locationsRes.data.data[0].City}, ${locationsRes.data.data[0].State}`);
    }
    console.log('');

    // Test 2: Get stats
    console.log('2️⃣ Testing GET /api/map/stats');
    const statsRes = await axios.get(`${API_BASE_URL}/map/stats`);
    console.log('✅ Success! Maintenance Stats:');
    console.log(`   Total Issues: ${statsRes.data.data.totalIssues}`);
    console.log(`   Opened: ${statsRes.data.data.opened}`);
    console.log(`   In Progress: ${statsRes.data.data.inProgress}`);
    console.log(`   Closed: ${statsRes.data.data.closed}`);
    console.log('');

    // Test 3: Get filter options
    console.log('3️⃣ Testing GET /api/map/filter-options');
    const filterOptionsRes = await axios.get(`${API_BASE_URL}/map/filter-options`);
    console.log(`✅ Success! Found ${filterOptionsRes.data.data.cities.length} cities and ${filterOptionsRes.data.data.states.length} states`);
    console.log(`   Sample Cities: ${filterOptionsRes.data.data.cities.slice(0, 5).join(', ')}`);
    console.log(`   Sample States: ${filterOptionsRes.data.data.states.slice(0, 5).join(', ')}`);
    console.log('');

    // Test 4: Search
    console.log('4️⃣ Testing GET /api/map/search?query=Pune');
    const searchRes = await axios.get(`${API_BASE_URL}/map/search`, {
      params: { query: 'Pune' }
    });
    console.log(`✅ Success! Found ${searchRes.data.data.length} results for "Pune"`);
    if (searchRes.data.data.length > 0) {
      console.log(`   Sample: ${searchRes.data.data[0].Name}`);
    }
    console.log('');

    // Test 5: Filter by city
    if (filterOptionsRes.data.data.cities.length > 0) {
      const testCity = filterOptionsRes.data.data.cities[0];
      console.log(`5️⃣ Testing GET /api/map/filter?city=${testCity}`);
      const filterCityRes = await axios.get(`${API_BASE_URL}/map/filter`, {
        params: { city: testCity }
      });
      console.log(`✅ Success! Found ${filterCityRes.data.data.length} ITIs in ${testCity}`);
      console.log('');
    }

    // Test 6: Filter by state
    if (filterOptionsRes.data.data.states.length > 0) {
      const testState = filterOptionsRes.data.data.states[0];
      console.log(`6️⃣ Testing GET /api/map/filter?state=${testState}`);
      const filterStateRes = await axios.get(`${API_BASE_URL}/map/filter`, {
        params: { state: testState }
      });
      console.log(`✅ Success! Found ${filterStateRes.data.data.length} ITIs in ${testState}`);
      console.log('');
    }

    console.log('🎉 All tests passed! Map API is working correctly.\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testMapEndpoints();
