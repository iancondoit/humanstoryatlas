import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Prisma client
const prisma = new PrismaClient();

// Constants
const HSA_READY_DIR = path.join(__dirname, '..', 'StoryDredge', 'output', 'hsa-ready');

// Stats to track
const stats = {
  dredgeFiles: 0,
  dredgeDirectories: 0,
  dbStories: 0,
  matchedStories: 0,
  missingStories: 0,
};

// Count JSON files in StoryDredge directory
function countJsonFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`Directory does not exist: ${dir}`);
    return;
  }

  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const fileStats = fs.statSync(itemPath);
    
    if (fileStats.isDirectory()) {
      stats.dredgeDirectories++;
      countJsonFiles(itemPath);
    } else if (fileStats.isFile() && path.extname(itemPath) === '.json') {
      stats.dredgeFiles++;
    }
  }
}

// Check database for stories
async function checkDatabase() {
  // Count total stories in database
  const storyCount = await prisma.story.count();
  stats.dbStories = storyCount;
  
  console.log(`Database contains ${storyCount} stories`);
  
  // Sample some stories to check
  const sampleStories = await prisma.story.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  console.log('\nMost recent stories in database:');
  sampleStories.forEach(story => {
    console.log(`- ${story.title} (${story.timestamp.toISOString().split('T')[0]})`);
  });
}

// Main verification function
async function verifyImport() {
  console.log('=== Human Story Atlas Import Verification ===\n');
  
  console.log(`StoryDredge directory: ${HSA_READY_DIR}`);
  
  if (!fs.existsSync(HSA_READY_DIR)) {
    console.error(`ERROR: StoryDredge directory not found at ${HSA_READY_DIR}`);
    console.error('The import cannot work without this directory.');
    return;
  }
  
  console.log('Counting StoryDredge files...');
  countJsonFiles(HSA_READY_DIR);
  
  console.log(`Found ${stats.dredgeFiles} JSON files in ${stats.dredgeDirectories} directories`);
  
  console.log('\nChecking database content...');
  await checkDatabase();
  
  console.log('\n=== Verification Summary ===');
  console.log(`StoryDredge files available: ${stats.dredgeFiles}`);
  console.log(`Stories in database: ${stats.dbStories}`);
  
  if (stats.dredgeFiles > 0 && stats.dbStories === 0) {
    console.log('\nDIAGNOSIS: Stories exist in StoryDredge but none are in the database.');
    console.log('RECOMMENDATION: Run the import script: npm run import:dredge');
  } else if (stats.dbStories > 0 && stats.dbStories < stats.dredgeFiles) {
    console.log('\nDIAGNOSIS: Some stories from StoryDredge are missing from the database.');
    console.log('RECOMMENDATION: Run the import script again: npm run import:dredge');
  } else if (stats.dbStories === 0 && stats.dredgeFiles === 0) {
    console.log('\nDIAGNOSIS: No stories in StoryDredge directory or database.');
    console.log('RECOMMENDATION: Check that StoryDredge is generating stories correctly.');
  } else {
    console.log('\nDIAGNOSIS: The database appears to be up to date with StoryDredge content.');
  }
  
  // Close the Prisma client
  await prisma.$disconnect();
}

// Run the verification
verifyImport()
  .then(() => {
    console.log('\nVerification complete.');
  })
  .catch((error) => {
    console.error('Verification failed:', error);
  }); 