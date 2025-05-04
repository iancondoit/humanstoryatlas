// Seed script to add sample data to the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Check if database already has data
  const storiesCount = await prisma.story.count();
  if (storiesCount > 0) {
    console.log(`Database already has ${storiesCount} stories. Skipping seed.`);
    return;
  }

  // Sample stories
  const sampleStories = [
    {
      title: 'The Forgotten Challenger Disaster Investigation',
      rawText: 'Newly released documents show that NASA engineers warned about O-ring failures months before the tragic explosion.',
      processedText: 'Newly released documents show that NASA engineers warned about O-ring failures months before the tragic explosion. Multiple memos from engineering teams highlighted concerns about cold weather launches.',
      timestamp: new Date('1986-04-15'),
      sourceType: 'The Washington Post',
      location: 'Cape Canaveral, FL',
    },
    {
      title: 'Hidden History: The Women Who Built Silicon Valley',
      rawText: 'Long before the modern tech boom, women pioneers laid the groundwork for computing advances we take for granted today.',
      processedText: 'Long before the modern tech boom, women pioneers laid the groundwork for computing advances we take for granted today. From programming ENIAC to developing critical software for NASA, these forgotten innovators shaped our digital world.',
      timestamp: new Date('1995-07-22'),
      sourceType: 'Technology Review',
      location: 'Palo Alto, CA',
    },
    {
      title: 'The Oil Crisis That Changed America Forever',
      rawText: 'How the 1973 oil embargo transformed US energy policy and relationships in the Middle East.',
      processedText: 'How the 1973 oil embargo transformed US energy policy and relationships in the Middle East. The crisis led to significant policy shifts including the creation of the Strategic Petroleum Reserve and fuel efficiency standards.',
      timestamp: new Date('1983-10-10'),
      sourceType: 'The New York Times',
      location: 'Washington, DC',
    },
    {
      title: 'Unsolved: The Mystery of Flight 19',
      rawText: 'New evidence emerges about the disappeared Navy aircraft that vanished in the Bermuda Triangle in 1945.',
      processedText: 'New evidence emerges about the disappeared Navy aircraft that vanished in the Bermuda Triangle in 1945. Recently declassified documents suggest navigation errors and fuel exhaustion rather than supernatural forces may explain the tragedy.',
      timestamp: new Date('2005-12-05'),
      sourceType: 'Naval History Magazine',
      location: 'Fort Lauderdale, FL',
    },
    {
      title: 'The Forgotten Olympic Heroes of 1980',
      rawText: 'Athletes who qualified for the Moscow Olympics but never competed due to the US boycott share their stories.',
      processedText: 'Athletes who qualified for the Moscow Olympics but never competed due to the US boycott share their stories. Many would never again reach Olympic qualification, their athletic prime coinciding with this moment of geopolitical tension.',
      timestamp: new Date('2000-07-19'),
      sourceType: 'Sports Illustrated',
      location: 'Colorado Springs, CO',
    }
  ];
  
  // Sample arcs
  const sampleArcs = [
    {
      title: 'The Cost of Cold War Politics',
      summary: 'How geopolitical tensions affected ordinary lives during the Cold War era.',
      timespan: '1973-2000',
      storyCount: 2,
      themes: 'Politics,Sports,International Relations', 
      storyType: 'Historical Analysis'
    },
    {
      title: 'Forgotten Innovations',
      summary: 'The overlooked technological advances that shaped modern society.',
      timespan: '1945-1995',
      storyCount: 2,
      themes: 'Technology,Innovation,Space',
      storyType: 'Technical History'
    },
    {
      title: 'Mysteries That Changed History',
      summary: 'Unexplained events that led to significant policy or cultural changes.',
      timespan: '1945-2005',
      storyCount: 2,
      themes: 'Mystery,Investigation,Aviation',
      storyType: 'Investigative History'
    }
  ];

  // Create stories
  const stories = await Promise.all(
    sampleStories.map(story => 
      prisma.story.create({
        data: story
      })
    )
  );

  console.log(`Created ${stories.length} sample stories`);

  // Create arcs
  const arcs = await Promise.all(
    sampleArcs.map(arc => 
      prisma.arc.create({
        data: arc
      })
    )
  );

  console.log(`Created ${arcs.length} sample arcs`);
  console.log('Database seeded successfully!');
}

main()
  .catch(e => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 