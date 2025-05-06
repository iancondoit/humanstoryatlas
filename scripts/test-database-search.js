import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabaseSearch() {
  try {
    // 1. Count total stories in the database
    const totalStories = await prisma.story.count();
    console.log(`Total stories in database: ${totalStories}`);
    
    if (totalStories === 0) {
      console.log('No stories found in the database. Search will return mock data.');
      await prisma.$disconnect();
      return;
    }
    
    // 2. Get a sample of stories (first 5)
    const sampleStories = await prisma.story.findMany({
      take: 5,
      orderBy: {
        timestamp: 'desc'
      }
    });
    
    console.log('\nSample stories:');
    sampleStories.forEach((story, index) => {
      console.log(`\n[${index + 1}] ${story.title}`);
      console.log(`   Source: ${story.sourceType}`);
      console.log(`   Date: ${story.timestamp}`);
      // Show first 100 chars of processed text
      console.log(`   Preview: ${story.processedText.substring(0, 100)}...`);
    });
    
    // 3. Test basic word search in the first story
    if (sampleStories.length > 0) {
      // Extract some distinctive words from the first story
      const firstStory = sampleStories[0];
      const words = firstStory.processedText
        .split(' ')
        .filter(word => word.length > 5)  // Longer words are more distinctive
        .slice(0, 3);  // Take just a few words
      
      console.log('\nTesting search with words from first story:');
      
      for (const word of words) {
        console.log(`\nSearching for word: "${word}"`);
        
        // Query using the same logic as the API endpoint
        const searchResults = await prisma.story.findMany({
          where: {
            OR: [
              { title: { contains: word } },
              { processedText: { contains: word } }
            ]
          },
          take: 3
        });
        
        console.log(`Found ${searchResults.length} stories containing "${word}"`);
        
        if (searchResults.length > 0) {
          const containsOriginalStory = searchResults.some(
            story => story.id === firstStory.id
          );
          console.log(`Original story found in results: ${containsOriginalStory}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error testing database search:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseSearch()
  .then(() => console.log('Database search test completed.'))
  .catch(e => console.error(e)); 