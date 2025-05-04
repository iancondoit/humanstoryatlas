const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient();

// Constants
const HSA_READY_DIR = '/Users/ianhoppe/Documents/StoryDredge/output/hsa-ready';
const VALID_SECTION = 'news';

// Track import statistics
const importStats = {
  found: 0,
  imported: 0,
  skipped: 0,
  failed: 0,
  startTime: Date.now(),
};

console.log('Starting import from StoryDredge...');
console.log('Checking directory:', HSA_READY_DIR);

if (!fs.existsSync(HSA_READY_DIR)) {
  console.error(`ERROR: Directory doesn't exist: ${HSA_READY_DIR}`);
  process.exit(1);
}

console.log('Directory exists:', fs.existsSync(HSA_READY_DIR));

// Find all JSON files
function findJsonFiles(dir) {
  let results = [];
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Recursively search subdirectories
        results = results.concat(findJsonFiles(filePath));
      } else if (path.extname(file) === '.json') {
        // Add JSON files to the results
        results.push(filePath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
  
  return results;
}

// Process a single story
async function processStory(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const storyData = JSON.parse(fileContent);
    
    // Validate that this is a news story
    if (storyData.section !== VALID_SECTION) {
      console.log(`Skipping non-news story: ${path.basename(filePath)}, section: ${storyData.section}`);
      importStats.skipped++;
      return;
    }
    
    // Check if story already exists
    const existingStory = await prisma.story.findFirst({
      where: {
        rawText: {
          contains: storyData.source_url
        }
      }
    });
    
    if (existingStory) {
      console.log(`Story already exists: ${storyData.headline}`);
      importStats.skipped++;
      return;
    }
    
    // Append metadata to the raw text to preserve StoryDredge information
    const metadataBlock = `
---
Source: ${storyData.publication}
URL: ${storyData.source_url}
Issue: ${storyData.source_issue}
Tags: ${storyData.tags.join(', ')}
Imported from: StoryDredge
${storyData.byline ? `Byline: ${storyData.byline}` : ''}
${storyData.dateline ? `Dateline: ${storyData.dateline}` : ''}
---

`;
    
    // Combine metadata and body
    const enhancedText = metadataBlock + storyData.body;
    
    // Map StoryDredge data to HSA model
    const story = await prisma.story.create({
      data: {
        title: storyData.headline,
        rawText: enhancedText,
        processedText: storyData.body, // Only the actual content for processing
        timestamp: new Date(storyData.timestamp),
        sourceType: storyData.publication,
        location: storyData.dateline || undefined,
      }
    });
    
    console.log(`Imported story: ${storyData.headline}`);
    importStats.imported++;
    
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    importStats.failed++;
  }
}

// Main import function
async function runImport() {
  const jsonFiles = findJsonFiles(HSA_READY_DIR);
  importStats.found = jsonFiles.length;
  console.log(`Found ${jsonFiles.length} JSON files to process`);
  
  // Just process a few files first as a test
  const testFiles = jsonFiles.slice(0, 5);
  console.log(`Testing with first 5 files`);
  
  for (const filePath of testFiles) {
    await processStory(filePath);
  }
  
  const endTime = Date.now();
  const duration = (endTime - importStats.startTime) / 1000;
  
  console.log(`
Import test complete.
Found: ${importStats.found} stories
Processed: ${testFiles.length} files
Imported: ${importStats.imported}
Skipped: ${importStats.skipped}
Failed: ${importStats.failed}
Duration: ${duration.toFixed(2)} seconds
  `);
  
  // Close the database connection
  await prisma.$disconnect();
}

// Run the import
runImport()
  .then(() => {
    console.log('Import completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Import failed:', error);
    process.exit(1);
  }); 