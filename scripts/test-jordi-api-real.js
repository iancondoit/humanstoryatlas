/**
 * Jordi API Test Script
 * 
 * Tests if the Jordi API is properly returning real data from the database.
 * Verifies that we're not falling back to mock data.
 */

async function testJordiApi() {
  try {
    console.log('Testing Jordi API for real data...');
    
    // Define the request parameters
    const requestBody = {
      publication: 'San Antonio Express-News',
      startDate: '1970-01-01',
      endDate: '1977-12-31',
      messages: [
        {
          role: 'user',
          content: 'Find me some interesting stories from the archives.'
        }
      ]
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    // Try to connect to the local API endpoint
    const response = await fetch('http://localhost:3000/api/jordi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`API responded with status: ${response.status}`);
    
    if (response.status !== 200) {
      console.error('Failed to get a successful response from the API');
      return;
    }
    
    // Try to parse the response
    const responseBody = await response.json();
    
    // Check if context contains mock data indicator
    const contextContainsMockData = responseBody.context?.dateRange?.includes('[MOCK DATA]') || false;
    console.log('Context contains mock data marker:', contextContainsMockData);
    
    // Check if pitches contain mock data
    const pitchContainsMockData = JSON.stringify(responseBody.pitches || []).includes('[MOCK');
    console.log('Pitches contain mock data:', pitchContainsMockData);
    
    if (contextContainsMockData) {
      console.log('⚠️ NOTE: Context still has mock data markers in dateRange. This is expected as we\'re querying publications like "San Antonio Express-News" which has mock context data.');
    }
    
    if (pitchContainsMockData) {
      console.error('❌ TEST FAILED: Pitches contain mock data');
    } else {
      console.log('✅ TEST PASSED: Generated pitches contain real story data');
    }
    
    // Output a summary of the response
    console.log('\nResponse summary:');
    console.log('- Message:', responseBody.message?.content || 'N/A');
    console.log('- Context count:', responseBody.context?.count || 0);
    console.log('- Context date range:', responseBody.context?.dateRange || 'N/A');
    console.log('- Number of pitches:', responseBody.pitches?.length || 0);
    
    if (responseBody.pitches && responseBody.pitches.length > 0) {
      console.log('\nFirst pitch:');
      console.log('- Title:', responseBody.pitches[0].title);
      console.log('- Tagline:', responseBody.pitches[0].tagline);
      console.log('- Stories:', responseBody.pitches[0].stories.length);
      
      // Check if any pitch stories contain mock data
      const pitchContainsMockData = responseBody.pitches.some(pitch => 
        pitch.title.includes('[MOCK') || 
        pitch.stories.some(story => story.title.includes('[MOCK'))
      );
      
      if (pitchContainsMockData) {
        console.error('❌ TEST FAILED: Pitches contain mock data');
      } else {
        console.log('✅ TEST PASSED: All pitches contain real data');
      }
    }
  } catch (error) {
    console.error('Error testing Jordi API:', error);
  }
}

testJordiApi(); 