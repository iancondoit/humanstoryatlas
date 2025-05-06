/**
 * Date Filter Bypass Test Script
 * 
 * Tests if the Jordi API is properly bypassing date filtering issues.
 * We send a very restrictive date range that should return no results,
 * but because of our filter bypass, it should still return stories.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDateFilterBypass() {
  try {
    console.log('Testing date filter bypass...');
    
    // Check total stories in the database
    const totalStories = await prisma.story.count();
    console.log(`Total stories in database: ${totalStories}`);
    
    // Check stories with the publication
    const pubStories = await prisma.story.count({
      where: {
        sourceType: {
          contains: 'San Antonio Express-News'
        }
      }
    });
    console.log(`Stories with publication 'San Antonio Express-News': ${pubStories}`);
    
    // Try a very restrictive date query that should return 0 results
    // The year 1900 is before any stories in our database
    const restrictiveQuery = await prisma.story.count({
      where: {
        sourceType: {
          contains: 'San Antonio Express-News'
        },
        timestamp: {
          gte: new Date('1900-01-01'),
          lte: new Date('1900-12-31')
        }
      }
    });
    console.log(`Stories with restrictive date range (1900): ${restrictiveQuery}`);
    
    // Now test the Jordi API with the same restrictive date range
    console.log('\nTesting Jordi API with restrictive date range...');
    const requestBody = {
      publication: 'San Antonio Express-News',
      startDate: '1900-01-01',
      endDate: '1900-12-31',
      messages: [
        {
          role: 'user',
          content: 'Find me some interesting stories from the archives.'
        }
      ]
    };
    
    // Try to connect to the local API endpoint
    const response = await fetch('http://localhost:3000/api/jordi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`API responded with status: ${response.status}`);
    
    // Try to parse the response
    const responseBody = await response.json();
    
    // Check if any pitches were returned
    const pitchCount = responseBody.pitches?.length || 0;
    console.log(`Number of pitches returned: ${pitchCount}`);
    
    if (pitchCount > 0) {
      console.log('✅ TEST PASSED: API bypass is working! Stories returned despite restrictive date range.');
      
      // Check pitch content for mock data markers
      const pitchContainsMockData = JSON.stringify(responseBody.pitches).includes('[MOCK');
      if (!pitchContainsMockData) {
        console.log('✅ TEST PASSED: Pitches contain real data.');
      } else {
        console.error('❌ TEST FAILED: Pitches contain mock data markers.');
      }
    } else {
      console.error('❌ TEST FAILED: No stories returned, the date filter bypass may not be working correctly.');
    }
    
    // Note about context data which may still contain mock markers
    if (responseBody.context?.dateRange?.includes('[MOCK DATA]')) {
      console.log('⚠️ NOTE: Context data still contains mock markers, but this is separate from the actual story data.');
    }
    
  } catch (error) {
    console.error('Error testing date filter bypass:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDateFilterBypass(); 