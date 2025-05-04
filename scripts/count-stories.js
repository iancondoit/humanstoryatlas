import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function countStories() {
  try {
    const count = await prisma.story.count();
    console.log(`Total stories in database: ${count}`);
    
    // Get a sample of stories by date
    const storiesByDate = await prisma.story.groupBy({
      by: ['timestamp'],
      _count: {
        id: true
      },
      orderBy: {
        timestamp: 'asc'
      }
    });
    
    console.log("\nStories by date:");
    storiesByDate.forEach(group => {
      console.log(`${group.timestamp.toISOString().split('T')[0]}: ${group._count.id} stories`);
    });

  } catch (error) {
    console.error("Error counting stories:", error);
  } finally {
    await prisma.$disconnect();
  }
}

countStories(); 