import { PrismaClient } from '@prisma/client';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function diagnoseSearchIssue() {
  try {
    // 1. Get basic database stats
    const totalStories = await prisma.story.count();
    console.log(`Total stories in the database: ${totalStories}`);
    
    if (totalStories === 0) {
      console.error('No stories in database - this would trigger fallback mock data');
      return;
    }
    
    // 2. Get a sample of stories to work with
    const sampleStories = await prisma.story.findMany({
      take: 5,
    });
    
    console.log('\nSample story titles:');
    sampleStories.forEach((story, i) => {
      console.log(`${i+1}. ${story.title}`);
    });
    
    // 3. Check if any of the stories have search terms we can test
    const searchableWords = ["baseball", "texas", "chicago", "berlin", "wall", "frisky", "poodle"];
    console.log('\nTesting search terms:');
    
    for (const word of searchableWords) {
      const count = await prisma.story.count({
        where: {
          OR: [
            { title: { contains: word } },
            { processedText: { contains: word } }
          ]
        }
      });
      
      console.log(`"${word}": ${count} matches`);
    }
    
    // 4. Try the full API-style query and output the results to a file for testing
    const testQueries = ['baseball', 'Texas', 'Berlin Wall'];
    
    for (const query of testQueries) {
      console.log(`\nResults for query "${query}":`);
      
      const results = await prisma.story.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { processedText: { contains: query } }
          ]
        },
        take: 5,
        orderBy: {
          timestamp: 'desc'
        }
      });
      
      if (results.length === 0) {
        console.log(`  No results found!`);
        continue;
      }
      
      console.log(`  Found ${results.length} results.`);
      results.forEach((story, i) => {
        console.log(`  ${i+1}. ${story.title}`);
      });
      
      // Format results in API style and save to file for testing
      const formattedResults = {
        stories: results.map(story => ({
          id: story.id,
          title: story.title,
          publication: story.sourceType,
          date: story.timestamp.toISOString().split('T')[0],
          snippet: story.processedText.substring(0, 200) + '...',
          relevanceScore: 0.9
        })),
        arcs: [],
        suggestedFollowups: [
          `Learn more about ${query}`,
          `Explore related stories to ${query}`,
          `See historical context for ${query}`
        ]
      };
      
      const outputPath = join(process.cwd(), `test-query-${query.replace(/\s+/g, '-').toLowerCase()}.json`);
      writeFileSync(outputPath, JSON.stringify(formattedResults, null, 2));
      console.log(`  Results saved to ${outputPath}`);
    }
    
    // 5. Diagnose potential API issues
    console.log('\nDiagnosing API issues:');
    console.log('1. SQLite search is case-sensitive by default without COLLATE NOCASE');
    console.log('2. The search query in route.ts uses { contains: query } which is exact case matching');
    console.log('3. The mock data is returned when:');
    console.log('   - No stories exist in the database');
    console.log('   - The query returns zero matches');
    console.log('   - There is a database error');
    
    console.log('\nRecommended fixes:');
    console.log('1. Modify the API to use case-insensitive search:');
    console.log('   where: { OR: [');
    console.log('     { title: { contains: query, mode: "insensitive" } },');
    console.log('     { processedText: { contains: query, mode: "insensitive" } }');
    console.log('   ]}');
    console.log('2. For SQLite, use LOWER() function or COLLATE NOCASE in raw SQL if needed');
    console.log('3. Check API for any errors that might be triggering the fallback data');
    
  } catch (error) {
    console.error('Error diagnosing search issues:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseSearchIssue()
  .then(() => console.log('Diagnosis complete.'))
  .catch(e => console.error(e)); 