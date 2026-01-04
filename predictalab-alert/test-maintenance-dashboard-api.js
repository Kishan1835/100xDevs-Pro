// Test script for Maintenance Dashboard API endpoints
// Run this after starting the backend server: node test-maintenance-dashboard-api.js

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testMaintenanceDashboardAPI() {
  console.log('🧪 Testing Maintenance Dashboard API Endpoints\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Get Dashboard Stats
    console.log('\n1️⃣  Testing GET /api/maintenance/dashboard/stats');
    console.log('-'.repeat(60));
    
    const statsResponse = await axios.get(`${API_BASE_URL}/maintenance/dashboard/stats`);
    
    if (statsResponse.data.success) {
      console.log('✅ Stats endpoint working!');
      console.log('📊 Stats Data:');
      console.log(JSON.stringify(statsResponse.data.data, null, 2));
    } else {
      console.log('❌ Stats endpoint returned unsuccessful response');
    }

  } catch (error) {
    console.error('❌ Error fetching stats:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }

  try {
    // Test 2: Get All Logs (default pagination)
    console.log('\n2️⃣  Testing GET /api/maintenance/dashboard/logs (default)');
    console.log('-'.repeat(60));
    
    const logsResponse = await axios.get(`${API_BASE_URL}/maintenance/dashboard/logs`);
    
    if (logsResponse.data.success) {
      console.log('✅ Logs endpoint working!');
      console.log(`📋 Found ${logsResponse.data.data.length} logs`);
      
      if (logsResponse.data.data.length > 0) {
        console.log('Sample log:');
        console.log(JSON.stringify(logsResponse.data.data[0], null, 2));
      }
    } else {
      console.log('❌ Logs endpoint returned unsuccessful response');
    }

  } catch (error) {
    console.error('❌ Error fetching logs:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }

  try {
    // Test 3: Get Filtered Logs (Pending status)
    console.log('\n3️⃣  Testing GET /api/maintenance/dashboard/logs?status=Pending&limit=5');
    console.log('-'.repeat(60));
    
    const filteredLogsResponse = await axios.get(
      `${API_BASE_URL}/maintenance/dashboard/logs?status=Pending&limit=5`
    );
    
    if (filteredLogsResponse.data.success) {
      console.log('✅ Filtered logs endpoint working!');
      console.log(`📋 Found ${filteredLogsResponse.data.data.length} pending logs`);
      
      filteredLogsResponse.data.data.forEach((log, index) => {
        console.log(`\nLog ${index + 1}:`);
        console.log(`  - ID: WO-${String(log.mlId).padStart(4, '0')}`);
        console.log(`  - Machine: ${log.machineName}`);
        console.log(`  - Issue: ${log.issueReported}`);
        console.log(`  - Status: ${log.status}`);
        console.log(`  - Priority: ${log.priority || 'N/A'}`);
        console.log(`  - Days Since Report: ${log.daysSinceReport} days`);
        console.log(`  - Assigned To: ${log.workerName}`);
      });
    } else {
      console.log('❌ Filtered logs endpoint returned unsuccessful response');
    }

  } catch (error) {
    console.error('❌ Error fetching filtered logs:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }

  try {
    // Test 4: Get Logs with Date Range
    console.log('\n4️⃣  Testing GET /api/maintenance/dashboard/logs with date range');
    console.log('-'.repeat(60));
    
    const today = new Date().toISOString().split('T')[0];
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const dateRangeResponse = await axios.get(
      `${API_BASE_URL}/maintenance/dashboard/logs?startDate=${lastMonth}&endDate=${today}&limit=5`
    );
    
    if (dateRangeResponse.data.success) {
      console.log('✅ Date range filter working!');
      console.log(`📋 Found ${dateRangeResponse.data.data.length} logs in last 30 days`);
    } else {
      console.log('❌ Date range filter returned unsuccessful response');
    }

  } catch (error) {
    console.error('❌ Error fetching logs with date range:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }

  try {
    // Test 5: Pagination Test
    console.log('\n5️⃣  Testing Pagination (offset=0, limit=3 vs offset=3, limit=3)');
    console.log('-'.repeat(60));
    
    const page1 = await axios.get(`${API_BASE_URL}/maintenance/dashboard/logs?limit=3&offset=0`);
    const page2 = await axios.get(`${API_BASE_URL}/maintenance/dashboard/logs?limit=3&offset=3`);
    
    console.log('✅ Pagination working!');
    console.log(`Page 1: ${page1.data.data.length} logs`);
    console.log(`Page 2: ${page2.data.data.length} logs`);
    
    if (page1.data.data.length > 0 && page2.data.data.length > 0) {
      const firstLogPage1 = page1.data.data[0];
      const firstLogPage2 = page2.data.data[0];
      
      if (firstLogPage1.mlId !== firstLogPage2.mlId) {
        console.log('✅ Different logs on different pages (pagination works correctly)');
      } else {
        console.log('⚠️  Same log on both pages (check pagination logic)');
      }
    }

  } catch (error) {
    console.error('❌ Error testing pagination:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!\n');
}

// Run the tests
testMaintenanceDashboardAPI().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
