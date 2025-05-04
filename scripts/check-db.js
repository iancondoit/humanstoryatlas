// Script to check database content
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Check story count
    const storyCount = await prisma.story.count();
    console.log(`Total stories in database: ${storyCount}`);

    // Fetch the first 10 stories
    const stories = await prisma.story.findMany({
      take: 10,
      orderBy: {
        timestamp: 'desc'
      }
    });

    console.log('\nStories in database:');
    stories.forEach((story, index) => {
      console.log(`\n--- Story ${index + 1} ---`);
      console.log(`ID: ${story.id}`);
      console.log(`Title: ${story.title}`);
      console.log(`Source: ${story.sourceType}`);
      console.log(`Date: ${story.timestamp}`);
      console.log(`Text snippet: ${story.processedText.substring(0, 50)}...`);
    });

    // Check arc count
    const arcCount = await prisma.arc.count();
    console.log(`\nTotal arcs in database: ${arcCount}`);

    // Fetch arcs
    const arcs = await prisma.arc.findMany({
      take: 5
    });

    console.log('\nArcs in database:');
    arcs.forEach((arc, index) => {
      console.log(`\n--- Arc ${index + 1} ---`);
      console.log(`ID: ${arc.id}`);
      console.log(`Title: ${arc.title}`);
      console.log(`Timespan: ${arc.timespan}`);
      console.log(`Summary: ${arc.summary.substring(0, 50)}...`);
    });

    // Print database configuration info
    console.log('\nDatabase Configuration:');
    console.log(`Provider: ${prisma._engineConfig.activeProvider}`);
    console.log(`Database URL: ${process.env.DATABASE_URL ? 'Set (hidden for security)' : 'Not set'}`);

  } catch (error) {
    console.error('Error checking database:', error);
  }
}

main()
  .catch(e => {
    console.error('Script error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 