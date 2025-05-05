/**
 * API Data Integration Verification Script
 * 
 * This script verifies that the API is correctly using real data from the database
 * and not falling back to mock data unnecessarily.
 */

import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();
const API_BASE_URL = 'http://localhost:3000/api';

async function main() {
  console.log('==== API Data Integration Verification ====');
  
  // 1. Verify database connection and count stories
  try {
    const storyCount = await prisma.story.count();
    console.log(`Database connection successful. Found ${storyCount} stories.`);
    
    if (storyCount === 0) {
      console.error('ERROR: No stories found in database. Please import data first.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
  
  // 2. Sample a few stories for testing
  try {
    const sampleStories = await prisma.story.findMany({ take: 3 });
    console.log(`Sample stories for testing:`);
    sampleStories.forEach((story, index) => {
      console.log(`  ${index + 1}. ${story.title} (ID: ${story.id})`);
    });
    
    // Extract a search term from the first story title
    const searchTerm = sampleStories[0].title.split(' ')[0];
    console.log(`\nUsing search term: "${searchTerm}"`);
    
    // 3. Test the API endpoint with this search term
    console.log('\nTesting API endpoint...');
    const response = await fetch(`${API_BASE_URL}/stories?query=${searchTerm}&debug=true`);
    
    if (!response.ok) {
      throw new Error(`API response status: ${response.status}`);
    }
    
    const apiData = await response.json();
    
    // 4. Verify API is using real data
    console.log(`API returned ${apiData.stories?.length || 0} stories`);
    
    if (apiData.usedFallback) {
      console.error('ERROR: API used fallback mock data instead of real data!');
      console.error('Reason:', apiData.reason);
      process.exit(1);
    } else {
      console.log('SUCCESS: API is correctly using real data from the database');
      
      // 5. Print first result for verification
      if (apiData.stories?.length > 0) {
        console.log('\nSample result:');
        console.log(`  Title: ${apiData.stories[0].title}`);
        console.log(`  Publication: ${apiData.stories[0].publication}`);
        console.log(`  Date: ${apiData.stories[0].date}`);
        console.log(`  Snippet: ${apiData.stories[0].snippet.substring(0, 100)}...`);
      }
    }
    
  } catch (error) {
    console.error('API test failed:', error);
    process.exit(1);
  }
  
  await prisma.$disconnect();
  console.log('\nVerification completed successfully!');
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 