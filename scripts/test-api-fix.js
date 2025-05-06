import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

async function testApiEndpoint() {
  console.log('=== Testing API Endpoint Fix ===');
  
  // First confirm we have stories in the database
  const totalStories = await prisma.story.count();
  console.log(`Total stories in database: ${totalStories}`);
  
  if (totalStories === 0) {
    console.log('No stories in database! Please run seed scripts first.');
    return;
  }
  
  // Get a random word from a story to use as search term
  const randomStory = await prisma.story.findFirst({
    select: {
      title: true,
      processedText: true
    }
  });
  
  if (!randomStory) {
    console.log('Failed to fetch a sample story!');
    return;
  }
  
  // Extract a random word from the title or text
  const content = randomStory.title + ' ' + randomStory.processedText;
  const words = content.split(/\s+/).filter(word => word.length > 4);
  const randomWord = words[Math.floor(Math.random() * words.length)];
  console.log(`Using random search term: "${randomWord}"`);
  
  // Test direct database query first to verify results exist
  console.log('\nTesting direct database query:');
  const searchTerm = `%${randomWord.toLowerCase()}%`;
  
  const dbResults = await prisma.$queryRaw`
    SELECT id, title FROM Story 
    WHERE LOWER(title) LIKE ${searchTerm}
       OR LOWER(processedText) LIKE ${searchTerm}
    LIMIT 5
  `;
  
  console.log(`Found ${dbResults.length} results in direct database query`);
  
  if (dbResults.length > 0) {
    console.log('Sample results:');
    dbResults.forEach((story, i) => {
      console.log(`  ${i+1}. ${story.title}`);
    });
  }
  
  // Now test the API endpoint using local server
  console.log('\nNOTE: You must have your Next.js server running on http://localhost:3000 to test the API endpoint.');
  console.log('Testing API endpoint (this may fail if server is not running):');
  
  try {
    const response = await fetch(`http://localhost:3000/api/stories?query=${encodeURIComponent(randomWord)}&debug=true`);
    const data = await response.json();
    
    console.log(`API Response Status: ${response.status}`);
    console.log(`Used Fallback Data: ${data.usedFallback || false}`);
    
    if (data.usedFallback) {
      console.log(`Reason: ${data.reason || 'Unknown'}`);
      if (data.error) {
        console.log(`Error: ${data.error}`);
      }
    } else {
      console.log(`Stories returned: ${data.stories?.length || 0}`);
      
      if (data.stories?.length > 0) {
        console.log('Sample stories:');
        data.stories.slice(0, 3).forEach((story, i) => {
          console.log(`  ${i+1}. ${story.title}`);
        });
      }
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
  
  await prisma.$disconnect();
}

testApiEndpoint()
  .then(() => console.log('\nTest completed!'))
  .catch(error => console.error('Test error:', error)); 