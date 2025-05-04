import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const HSA_READY_DIR = '/Users/ianhoppe/Documents/StoryDredge/output/hsa-ready';
const VALID_SECTION = 'news';
const FORCE_REIMPORT = true; // Set to true to force reimport even if stories exist
const CLEAR_DB_FIRST = true; // Set to true to clear the database before importing
const BATCH_SIZE = 10; // Number of stories to process before committing to database
const prisma = new PrismaClient();

// Track import statistics
const importStats = {
  found: 0,
  imported: 0,
  skipped: 0,
  failed: 0,
};

interface DredgeStory {
  headline: string;
  body: string;
  tags: string[];
  section: string;
  timestamp: string;
  publication: string;
  source_issue: string;
  source_url: string;
  byline?: string;
  dateline?: string;
}

// Function to process a single JSON file
async function processFile(filePath: string): Promise<void> {
  try {
    console.log(`Processing file: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const storyData: DredgeStory = JSON.parse(fileContent);
    
    // Validate that this is a news story
    if (storyData.section !== VALID_SECTION) {
      console.log(`Skipping non-news story: ${filePath}, section: ${storyData.section}`);
      importStats.skipped++;
      return;
    }
    
    // Check if story already exists (skip this check if FORCE_REIMPORT is true)
    if (!FORCE_REIMPORT) {
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
    } else {
      // If force reimport is enabled, delete existing stories with the same source_url
      try {
        const existingStories = await prisma.story.findMany({
          where: {
            rawText: {
              contains: storyData.source_url
            }
          }
        });
        
        if (existingStories.length > 0) {
          console.log(`Deleting ${existingStories.length} existing version(s) of: ${storyData.headline}`);
          for (const story of existingStories) {
            await prisma.story.delete({
              where: { id: story.id }
            });
          }
        }
      } catch (error) {
        console.error(`Error deleting existing story: ${error}`);
      }
    }
    
    // Append metadata to the raw text to preserve StoryDredge information
    const metadataBlock = `
---
Source: ${storyData.publication}
URL: ${storyData.source_url}
Issue: ${storyData.source_issue}
Tags: ${storyData.tags?.join(', ') || ''}
Imported from: StoryDredge
${storyData.byline ? `Byline: ${storyData.byline}` : ''}
${storyData.dateline ? `Dateline: ${storyData.dateline}` : ''}
---

`;
    
    // Combine metadata and body
    const enhancedText = metadataBlock + (storyData.body || '');
    
    try {
      // Create a new story
      await prisma.story.create({
        data: {
          title: storyData.headline,
          rawText: enhancedText,
          processedText: storyData.body || '',
          timestamp: storyData.timestamp ? new Date(storyData.timestamp) : new Date(),
          sourceType: storyData.publication || 'Unknown',
          location: storyData.dateline || '',
        }
      });
      
      console.log(`Imported story: ${storyData.headline}`);
      importStats.imported++;
    } catch (dbError) {
      console.error(`Error importing story ${storyData.headline}: ${dbError}`);
      importStats.failed++;
    }
    
  } catch (error) {
    console.error(`Error processing file ${filePath}: ${error}`);
    importStats.failed++;
  }
}

// Function to walk the directory structure
async function walkDirectory(directory: string): Promise<void> {
  try {
    console.log(`Scanning directory: ${directory}`);
    const items = fs.readdirSync(directory);
    console.log(`Found ${items.length} items in ${directory}`);
    
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
async function importFromDredge(): Promise<void> {
  const startTime = Date.now();
  
  console.log(`Starting import from: ${HSA_READY_DIR}`);
  
  if (!fs.existsSync(HSA_READY_DIR)) {
    console.error(`StoryDredge directory not found at ${HSA_READY_DIR}. Please ensure the directory exists.`);
    return;
  }
  
  console.log('Directory exists!');
  
  // Make sure the database is connected
  try {
    await prisma.$connect();
    console.log("Database connection established.");
  } catch (dbError) {
    console.error("Error connecting to database:", dbError);
    return;
  }
  
  try {
    // Optionally clear database first
    if (CLEAR_DB_FIRST) {
      console.log("Clearing database before import...");
      await clearDatabase();
    }
    
    // Count existing stories
    const existingStoriesCount = await prisma.story.count();
    console.log(`Current story count in database: ${existingStoriesCount}`);
    
    // Find all json files from the external StoryDredge directory
    console.log(`Searching for JSON files in ${HSA_READY_DIR}`);
    const jsonFiles = findJsonFiles(HSA_READY_DIR);
    importStats.found = jsonFiles.length;
    console.log(`Found ${jsonFiles.length} JSON files to process`);
    
    // Process each file
    console.log('Starting file processing...');
    for (const filePath of jsonFiles) {
      await processFile(filePath);
      
      // Log progress periodically
      if ((importStats.imported + importStats.skipped + importStats.failed) % 10 === 0) {
        const progress = (importStats.imported + importStats.skipped + importStats.failed) / importStats.found * 100;
        console.log(`Progress: ${progress.toFixed(1)}% (${importStats.imported + importStats.skipped + importStats.failed}/${importStats.found})`);
      }
    }
    
    // Count stories after import
    const finalStoriesCount = await prisma.story.count();
    console.log(`Final story count in database: ${finalStoriesCount}`);
    console.log(`Net change: ${finalStoriesCount - existingStoriesCount} stories`);
    
  } catch (error) {
    console.error("Error during import process:", error);
  } finally {
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
    
    // Close the Prisma client when done
    await prisma.$disconnect();
  }
}

// Helper function to find all JSON files in a directory
function findJsonFiles(dir: string): string[] {
  let results: string[] = [];
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
  
  return results;
}

// Function to clear all stories from the database
async function clearDatabase(): Promise<void> {
  try {
    const deleteCount = await prisma.story.deleteMany({});
    console.log(`Deleted ${deleteCount.count} stories from database.`);
  } catch (error) {
    console.error("Error clearing database:", error);
  }
}

// Run the import
importFromDredge()
  .then(() => {
    console.log('Import process finished.');
  })
  .catch((error) => {
    console.error('Import process failed:', error);
  }); 