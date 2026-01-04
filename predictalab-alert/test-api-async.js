async function testAPI() {
  try {
    const response = await fetch('http://localhost:5000/api/schedules');
    console.log('✓ API Response received');
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('\n✓ JSON parsed successfully');
    console.log('Full response:', JSON.stringify(data, null, 2));
    if (data.data && data.data.length > 0) {
      console.log('\n✓ First record:');
      console.log('  S_Log_ID:', data.data[0].S_Log_ID);
      console.log('  worker:', JSON.stringify(data.data[0].worker));
      console.log('  student:', JSON.stringify(data.data[0].student));
      console.log('  Scheduled_On:', data.data[0].Scheduled_On);
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

testAPI();
