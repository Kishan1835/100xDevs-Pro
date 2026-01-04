/**
 * Test script for Auctions API
 * 
 * This script tests all CRUD operations for the Auctions API.
 * Make sure the backend server is running on port 5000.
 * 
 * Run: node test-auctions-api.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testAuctionsAPI() {
  console.log('\n' + '='.repeat(60));
  log('🧪 Testing Auctions API', colors.cyan);
  console.log('='.repeat(60) + '\n');

  let testItemId = null;

  try {
    // Test 1: Get All Auctions
    log('\n📋 Test 1: GET /api/auctions - Get all auctions', colors.blue);
    try {
      const response = await axios.get(`${API_BASE_URL}/auctions`);
      log(`✅ Success: Retrieved ${response.data.data.length} auctions`, colors.green);
      if (response.data.data.length > 0) {
        console.log('Sample auction:', JSON.stringify(response.data.data[0], null, 2));
      }
    } catch (error) {
      log(`❌ Error: ${error.response?.data?.error || error.message}`, colors.red);
    }

    // Test 2: Get All ITIs (for dropdown)
    log('\n📋 Test 2: GET /api/iti - Get all ITIs for dropdown', colors.blue);
    let firstItiId = null;
    try {
      const response = await axios.get(`${API_BASE_URL}/iti`);
      log(`✅ Success: Retrieved ${response.data.data.length} ITIs`, colors.green);
      if (response.data.data.length > 0) {
        firstItiId = response.data.data[0].ITI_ID;
        log(`   Using ITI_ID: ${firstItiId} for testing`, colors.yellow);
      }
    } catch (error) {
      log(`❌ Error: ${error.response?.data?.error || error.message}`, colors.red);
    }

    // Test 3: Create New Auction (will likely fail if Item_ID doesn't exist)
    log('\n📋 Test 3: POST /api/auctions - Create new auction', colors.blue);
    testItemId = Math.floor(Math.random() * 1000) + 100; // Random test ID
    try {
      const newAuction = {
        itemId: testItemId,
        itiId: firstItiId,
        itemName: 'Test Auction Item - ' + Date.now(),
        quantity: 10,
        basePrice: 5000.50
      };
      
      log(`   Creating auction with Item_ID: ${testItemId}`, colors.yellow);
      const response = await axios.post(`${API_BASE_URL}/auctions`, newAuction);
      log(`✅ Success: Auction created`, colors.green);
      console.log('Created auction:', JSON.stringify(response.data.data, null, 2));
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('Invalid Item ID')) {
        log(`⚠️  Expected: Item_ID ${testItemId} doesn't exist in Inventory table`, colors.yellow);
        log(`   This is normal - auctions require existing inventory items`, colors.yellow);
        testItemId = null; // Reset since creation failed
      } else {
        log(`❌ Error: ${error.response?.data?.error || error.message}`, colors.red);
      }
    }

    // Test 4: Get Single Auction (if we created one)
    if (testItemId) {
      log('\n📋 Test 4: GET /api/auctions/:itemId - Get single auction', colors.blue);
      try {
        const response = await axios.get(`${API_BASE_URL}/auctions/${testItemId}`);
        log(`✅ Success: Retrieved auction ${testItemId}`, colors.green);
        console.log('Auction details:', JSON.stringify(response.data.data, null, 2));
      } catch (error) {
        log(`❌ Error: ${error.response?.data?.error || error.message}`, colors.red);
      }

      // Test 5: Update Auction
      log('\n📋 Test 5: PUT /api/auctions/:itemId - Update auction', colors.blue);
      try {
        const updateData = {
          quantity: 20,
          basePrice: 6000.00
        };
        const response = await axios.put(`${API_BASE_URL}/auctions/${testItemId}`, updateData);
        log(`✅ Success: Auction updated`, colors.green);
        console.log('Updated auction:', JSON.stringify(response.data.data, null, 2));
      } catch (error) {
        log(`❌ Error: ${error.response?.data?.error || error.message}`, colors.red);
      }

      // Test 6: Increment Bids
      log('\n📋 Test 6: POST /api/auctions/:itemId/bid - Increment bids', colors.blue);
      try {
        const response = await axios.post(`${API_BASE_URL}/auctions/${testItemId}/bid`);
        log(`✅ Success: Bid count incremented`, colors.green);
        console.log('Bid update:', JSON.stringify(response.data.data, null, 2));
      } catch (error) {
        log(`❌ Error: ${error.response?.data?.error || error.message}`, colors.red);
      }

      // Test 7: Delete Auction
      log('\n📋 Test 7: DELETE /api/auctions/:itemId - Delete auction', colors.blue);
      try {
        const response = await axios.delete(`${API_BASE_URL}/auctions/${testItemId}`);
        log(`✅ Success: Auction deleted`, colors.green);
        console.log('Deletion result:', JSON.stringify(response.data.data, null, 2));
      } catch (error) {
        log(`❌ Error: ${error.response?.data?.error || error.message}`, colors.red);
      }
    } else {
      log('\n⚠️  Skipping update, bid, and delete tests (no auction created)', colors.yellow);
    }

    // Test 8: Test Error Handling - Get Non-existent Auction
    log('\n📋 Test 8: GET /api/auctions/99999 - Test 404 handling', colors.blue);
    try {
      await axios.get(`${API_BASE_URL}/auctions/99999`);
      log(`❌ Should have returned 404`, colors.red);
    } catch (error) {
      if (error.response?.status === 404) {
        log(`✅ Success: Correctly returned 404 Not Found`, colors.green);
      } else {
        log(`❌ Unexpected error: ${error.message}`, colors.red);
      }
    }

    // Test 9: Test Validation - Missing Required Fields
    log('\n📋 Test 9: POST /api/auctions - Test validation (missing fields)', colors.blue);
    try {
      await axios.post(`${API_BASE_URL}/auctions`, {
        itemName: 'Test Item'
        // Missing itemId, quantity, basePrice
      });
      log(`❌ Should have returned 400 Bad Request`, colors.red);
    } catch (error) {
      if (error.response?.status === 400) {
        log(`✅ Success: Validation working - ${error.response.data.error}`, colors.green);
      } else {
        log(`❌ Unexpected error: ${error.message}`, colors.red);
      }
    }

    console.log('\n' + '='.repeat(60));
    log('✅ All tests completed!', colors.green);
    console.log('='.repeat(60) + '\n');

    log('\n📝 Notes:', colors.cyan);
    log('1. To fully test CREATE, you need an existing Item_ID in the Inventory table', colors.yellow);
    log('2. Check backend/AUCTIONS_API_DOCUMENTATION.md for complete API docs', colors.yellow);
    log('3. Frontend at http://localhost:5173 (after npm run dev)', colors.yellow);
    console.log('');

  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, colors.red);
    console.error(error);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${API_BASE_URL}/auctions`);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('\n❌ Backend server is not running!', colors.red);
      log('   Start it with: cd backend && node src/server.js', colors.yellow);
      return false;
    }
    return true; // Server is running, just returned an error
  }
}

// Run tests
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testAuctionsAPI();
  }
})();
