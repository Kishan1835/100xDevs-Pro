/**
 * Test script for scheduleMachines function
 * Run this after starting the server
 */

const BASE_URL = 'http://localhost:5000';

async function testScheduleMachines() {
  try {
    console.log('🧪 Testing scheduleMachines endpoint...\n');

    // Example: Schedule machines for ITI_ID = 1
    const requestBody = {
      itiId: 1,          // Required: The ITI ID
      workerId: null,    // Optional: Worker ID (will use student's teacher if null)
      timeAllocation: 60 // Optional: Time in minutes (default 60)
    };

    console.log('📤 Request Body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${BASE_URL}/api/schedules/schedule-machines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('\n✅ Success!');
      console.log(`\nScheduled ${result.data.count} students to machines\n`);
      console.log('Assignments:');
      result.data.assignments.forEach((assignment, index) => {
        console.log(`\n${index + 1}. Student: ${assignment.StudentName} (ID: ${assignment.Student_ID})`);
        console.log(`   Machine: ${assignment.MachineName} (ID: ${assignment.Machine_ID})`);
        console.log(`   Time: ${assignment.Time} minutes`);
        console.log(`   Scheduled: ${new Date(assignment.Scheduled_On).toLocaleString()}`);
      });
    } else {
      console.error('\n❌ Error:', result);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testScheduleMachines();
