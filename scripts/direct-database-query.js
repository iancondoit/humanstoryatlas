import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';

const prisma = new PrismaClient();

async function directDatabaseSearch() {
  try {
    // Get total count of stories
    const count = await prisma.story.count();
    console.log(`Database contains ${count} stories.`);

    // Define search terms to test
    const searchTerms = ['baseball', 'texas', 'TEXAS', 'berlin wall', 'Berlin Wall'];
    
    console.log('\nTesting search terms with Prisma query builder:');
    
    for (const term of searchTerms) {
      const results = await prisma.story.findMany({
        where: {
          OR: [
            { title: { contains: term } },
            { processedText: { contains: term } }
          ]
        },
        select: {
          id: true,
          title: true
        },
        take: 5
      });
      
      console.log(`\nSearch for "${term}" found ${results.length} results:`);
      results.forEach((story, i) => console.log(`  ${i+1}. ${story.title}`));
    }
    
    console.log('\nTesting search terms with raw SQL (case-insensitive):');
    
    for (const term of searchTerms) {
      const searchTerm = `%${term.toLowerCase()}%`;
      
      const results = await prisma.$queryRaw`
        SELECT id, title
        FROM Story
        WHERE LOWER(title) LIKE ${searchTerm}
           OR LOWER(processedText) LIKE ${searchTerm}
        LIMIT 5
      `;
      
      console.log(`\nSearch for "${term}" found ${results.length} results:`);
      results.forEach((story, i) => console.log(`  ${i+1}. ${story.title}`));
      
      // Save the first result to JSON for verification
      if (results.length > 0) {
        const filename = `search-result-${term.replace(/\s+/g, '-').toLowerCase()}.json`;
        writeFileSync(filename, JSON.stringify(results, null, 2));
        console.log(`  Results saved to ${filename}`);
      }
    }
    
    // Test a very simple raw query to verify database connection
    console.log('\nTesting a very simple raw query:');
    const sampleStory = await prisma.$queryRaw`SELECT id, title FROM Story LIMIT 1`;
    console.log('Result:', sampleStory);
    
  } catch (error) {
    console.error('Database query error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

directDatabaseSearch()
  .then(() => console.log('\nDirect database query test completed.'))
  .catch(e => console.error(e)); 