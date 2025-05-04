const fs = require('fs');
const path = require('path');

// Constants
const HSA_READY_DIR = '/Users/ianhoppe/Documents/StoryDredge/output/hsa-ready';
const VALID_SECTION = 'news';

// Track import statistics
const importStats = {
  found: 0,
  imported: 0,
  skipped: 0,
  failed: 0,
  lastImportDate: null
};

// Function to process a single JSON file
async function processFile(filePath) {
  try {
    console.log(`Processing file: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const storyData = JSON.parse(fileContent);
    
    // Validate that this is a news story
    if (storyData.section !== VALID_SECTION) {
      console.log(`Skipping non-news story: ${filePath}`);
      importStats.skipped++;
      return;
    }
    
    // Since we're not actually importing to the database, simulate success
    console.log(`Successfully "imported" story: ${storyData.headline}`);
    importStats.imported++;
    
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    importStats.failed++;
  }
}

// Function to walk the directory structure
async function walkDirectory(directory) {
  try {
    const items = fs.readdirSync(directory);
    
    for (const item of items) {
      const itemPath = path.join(directory, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        // Recursively process subdirectories
        await walkDirectory(itemPath);
      } else if (stats.isFile() && path.extname(itemPath) === '.json') {
        // Process JSON files
        importStats.found++;
        await processFile(itemPath);
      }
    }
  } catch (error) {
    console.error(`Error walking directory ${directory}:`, error);
  }
}

// Main function to start the import process
async function importFromDredge() {
  const startTime = Date.now();
  
  console.log(`Starting import from: ${HSA_READY_DIR}`);
  
  if (!fs.existsSync(HSA_READY_DIR)) {
    console.error(`StoryDredge directory not found at ${HSA_READY_DIR}. Please ensure the directory exists.`);
    return;
  }
  
  // Walk the directory structure
  await walkDirectory(HSA_READY_DIR);
  
  importStats.lastImportDate = new Date();
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log(`
Import complete.
Found: ${importStats.found} stories
Imported: ${importStats.imported}
Skipped: ${importStats.skipped}
Failed: ${importStats.failed}
Duration: ${duration.toFixed(2)} seconds
  `);
}

// Run the import
importFromDredge()
  .then(() => {
    console.log('Import process finished.');
  })
  .catch((error) => {
 