import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCaseInsensitiveSearch() {
  try {
    // Get total story count
    const totalStories = await prisma.story.count();
    console.log(`Total stories in database: ${totalStories}`);
    
    // Get sample stories
    const sampleStories = await prisma.story.findMany({
      take: 3
    });
    
    if (sampleStories.length === 0) {
      console.log('No stories found in database');
      return;
    }
    
    // Pick the first story to use in searches
    const testStory = sampleStories[0];
    console.log('\nTest story:');
    console.log(`ID: ${testStory.id}`);
    console.log(`Title: ${testStory.title}`);
    console.log(`Text: ${testStory.processedText.substring(0, 100)}...`);
    
    // Extract a word from the title to use for case testing
    let testWord = '';
    if (testStory.title.includes(' ')) {
      testWord = testStory.title.split(' ')[0];
    } else {
      testWord = testStory.title.substring(0, 5);
    }
    
    console.log(`\nTesting search with word: "${testWord}"`);
    
    // Test with original case
    const originalCase = await prisma.story.count({
      where: {
        title: {
          contains: testWord
        }
      }
    });
    console.log(`Results with original case "${testWord}": ${originalCase}`);
    
    // Test with lowercase
    const lowerCase = await prisma.story.count({
      where: {
        title: {
          contains: testWord.toLowerCase()
        }
      }
    });
    console.log(`Results with lowercase "${testWord.toLowerCase()}": ${lowerCase}`);
    
    // Test with uppercase
    const upperCase = await prisma.story.count({
      where: {
        title: {
          contains: testWord.toUpperCase()
        }
      }
    });
    console.log(`Results with uppercase "${testWord.toUpperCase()}": ${upperCase}`);
    
    // Test with mode: 'insensitive' in SQLite
    // Note: SQLite doesn't natively support the 'insensitive' mode in Prisma, but we'll test anyway
    const insensitiveMode = await prisma.story.count({
      where: {
        title: {
          contains: testWord,
          mode: 'insensitive'
        }
      }
    });
    console.log(`Results with insensitive mode "${testWord}": ${insensitiveMode}`);
    
    // This will illustrate the problem with case sensitivity and the API
    console.log('\nCase sensitivity tests complete.');
    
    console.log('\nRecommended solutions for SQLite case-insensitive search:');
    console.log('1. Modify the search to use the LIKE operator with LOWER():');
    console.log('   - Use Prisma\'s $queryRaw to execute custom SQL');
    console.log('   Example:');
    console.log('   ```');
    console.log(`   const results = await prisma.$queryRaw\`
     SELECT * FROM Story 
     WHERE LOWER(title) LIKE LOWER('%${testWord}%') 
     OR LOWER(processedText) LIKE LOWER('%${testWord}%')
   \`;`);
    console.log('   ```');
    console.log('\n2. Update the frontend to handle case-sensitivity:');
    console.log('   - Convert search terms to lowercase before sending to API');
    console.log('   - Ensure database content is normalized to consistent case');
  } catch (error) {
    console.error('Error testing case sensitivity:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCaseInsensitiveSearch()
  .then(() => console.log('\nTest complete'))
  .catch(e => console.error(e)); 