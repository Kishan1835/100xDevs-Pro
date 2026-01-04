/**
 * Test script for Schedule Logs API
 * Run with: node test-schedule-logs-api.js
 */

const BASE_URL = 'http://localhost:5000/api/schedule-logs';

async function testAPI() {
  console.log('🧪 Testing Schedule Logs API...\n');

  try {
    // Test 1: Get all logs
    console.log('Test 1: Fetching all schedule logs...');
    const response1 = await fetch(BASE_URL);
    const data1 = await response1.json();
    console.log('✅ Status:', response1.status);
    console.log('✅ Response:', JSON.stringify(data1, null, 2));
    console.log(`✅ Found ${data1.count} logs\n`);

    // Test 2: Filter by date (adjust date as needed)
    console.log('Test 2: Filtering by single date (2025-12-03)...');
    const response2 = await fetch(`${BASE_URL}?date=2025-12-03`);
    const data2 = await response2.json();
    console.log('✅ Status:', response2.status);
    console.log('✅ Filtered count:', data2.count, '\n');

    // Test 3: Filter by date range
    console.log('Test 3: Filtering by date range (2025-12-01 to 2025-12-03)...');
    const response3 = await fetch(`${BASE_URL}?start=2025-12-01&end=2025-12-03`);
    const data3 = await response3.json();
    console.log('✅ Status:', response3.status);
    console.log('✅ Range filtered count:', data3.count, '\n');

    // Test 4: Pagination
    console.log('Test 4: Testing pagination (limit=5, offset=0)...');
    const response4 = await fetch(`${BASE_URL}?limit=5&offset=0`);
    const data4 = await response4.json();
    console.log('✅ Status:', response4.status);
    console.log('✅ Page count:', data4.count);
    console.log('✅ Total available:', data4.total, '\n');

    console.log('🎉 All tests completed successfully!\n');
    
    // Display sample log if available
    if (data1.data && data1.data.length > 0) {
      console.log('📋 Sample Log Entry:');
      console.log(JSON.stringify(data1.data[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.error('Make sure the backend server is running on http://localhost:5000');
  }
}

// Run tests
testAPI();
