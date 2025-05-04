import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

// Constants
const HSA_READY_DIR = '/Users/ianhoppe/Documents/StoryDredge/output/hsa-ready';
const VALID_SECTION = 'news';
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
  
  // Find all json files
  const jsonFiles = findJsonFiles(HSA_READY_DIR);
  console.log(`Found ${jsonFiles.length} JSON files`);
  
  // Just print the first 5 file paths
  jsonFiles.slice(0, 5).forEach(file => {
    console.log(`Found file: ${file}`);
  });
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log(`
Import complete.
Found: ${jsonFiles.length} stories
Duration: ${duration.toFixed(2)} seconds
  `);
  
  // Close the Prisma client when done
  await prisma.$disconnect();
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

// Run the import
importFromDredge()
  .then(() => {
    console.log('Import process finished.');
  })
  .catch((error) => {
    console.error('Import process failed:', error);
  }); 