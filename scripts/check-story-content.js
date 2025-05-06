import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStoryContent() {
  try {
    // Get the first story
    const story = await prisma.story.findFirst({
      orderBy: {
        timestamp: 'desc'
      }
    });
    
    if (!story) {
      console.log('No stories found in the database.');
      return;
    }
    
    console.log('Story ID:', story.id);
    console.log('Title:', story.title);
    console.log('Source:', story.sourceType);
    console.log('Date:', story.timestamp);
    console.log('\nProcessed Text:');
    console.log(story.processedText);
    
    console.log('\nRaw Text:');
    console.log(story.rawText);
    
    // Let's try some very specific searches using exact strings from the story
    const testExactMatch = async (fieldName, searchTerm) => {
      console.log(`\nSearching for exact match of "${searchTerm}" in ${fieldName}`);
      
      // First check if the term exists in the story
      const fieldValue = story[fieldName];
      const containsTerm = fieldValue.includes(searchTerm);
      console.log(`Term exists in the story's ${fieldName}: ${containsTerm}`);
      
      if (!containsTerm) {
        return;
      }
      
      // Now try to find it with a database query
      const where = {};
      where[fieldName] = { contains: searchTerm };
      
      const result = await prisma.story.findMany({
        where,
        select: { id: true }
      });
      
      console.log(`Database query found ${result.length} matches`);
      const foundOriginal = result.some(r => r.id === story.id);
      console.log(`Original story found in results: ${foundOriginal}`);
    };
    
    // 1. Try exact title match
    await testExactMatch('title', story.title);
    
    // 2. Try a unique substring from the processed text
    if (story.processedText.length > 20) {
      const uniqueSubstring = story.processedText.substring(10, 30);
      await testExactMatch('processedText', uniqueSubstring);
    }
    
    // 3. Try a unique substring from the raw text
    if (story.rawText.length > 20) {
      const uniqueSubstring = story.rawText.substring(10, 30);
      await testExactMatch('rawText', uniqueSubstring);
    }
    
    // 4. Check API-like query
    console.log('\nTesting API-style query:');
    const searchTerm = story.title.split(' ')[0]; // Use first word of title
    console.log(`Search term: "${searchTerm}"`);
    
    const apiResults = await prisma.story.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm } },
          { processedText: { contains: searchTerm } }
        ]
      },
      select: { id: true, title: true }
    });
    
    console.log(`Found ${apiResults.length} results`);
    console.log('Result titles:');
    apiResults.forEach(r => console.log(`- ${r.title}`));
    
    const foundOriginalInApi = apiResults.some(r => r.id === story.id);
    console.log(`Original story found in API-style results: ${foundOriginalInApi}`);
    
  } catch (error) {
    console.error('Error checking story content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStoryContent()
  .then(() => console.log('Story content check completed.'))
  .catch(e => console.error(e)); 