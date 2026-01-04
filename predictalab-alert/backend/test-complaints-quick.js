const axios = require('axios');

async function test() {
  try {
    console.log('Testing /api/complaints/stats...');
    const statsRes = await axios.get('http://localhost:5000/api/complaints/stats');
    console.log('✓ Stats endpoint working:');
    console.log(JSON.stringify(statsRes.data, null, 2));
    
    console.log('\nTesting /api/complaints/branches...');
    const branchesRes = await axios.get('http://localhost:5000/api/complaints/branches');
    console.log('✓ Branches endpoint working:');
    console.log(JSON.stringify(branchesRes.data, null, 2));
  } catch (err) {
    console.error('✗ Error:', err.response ? `${err.response.status} - ${JSON.stringify(err.response.data)}` : err.message);
  }
}

test();
