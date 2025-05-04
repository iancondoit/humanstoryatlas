const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { OpenAI } = require('openai');
require('dotenv').config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Constants
const HSA_READY_DIR = '/Users/ianhoppe/Documents/StoryDredge/output/hsa-ready';
const VALID_SECTION = 'news';
const BATCH_SIZE = 5; // Process files in small batches to avoid rate limits

// Track import statistics
const importStats = {
  found: 0,
  imported: 0,
  skipped: 0,
  failed: 0,
  embeddingFailed: 0,
  startTime: Date.now(),
};

// Function to create embeddings for a story
async function createEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: text.substring(0, 8191), // Limit to first 8k tokens
      encoding_format: 'float',
    });

    if (response && response.data && response.data[0] && response.data[0].embedding) {
      // Convert the embedding array to a Buffer for storage
      const embeddingBuffer = Buffer.from(
        new Float32Array(response.data[0].embedding).buffer
      );
      return embeddingBuffer;
    }
    throw new Error('Invalid embedding response from OpenAI');
  } catch (error) {
    console.error('Error creating embedding:', error);
    return null;
  }
}

// Function to process a single JSON file
async function processFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const storyData = JSON.parse(fileContent);
    
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
Tags: ${storyData.tags ? storyData.tags.join(', ') : ''}
Imported from: StoryDredge
${storyData.byline ? `Byline: ${storyData.byline}` : ''}
${storyData.dateline ? `Dateline: ${storyData.dateline}` : ''}
---

`;
    
    // Combine metadata and body
    const enhancedText = metadataBlock + storyData.body;
    
    // Generate embedding for the story
    console.log(`Generating embedding for: ${storyData.headline}`);
    const embedding = await createEmbedding(storyData.body);
    
    if (!embedding) {
      console.error(`Failed to generate embedding for: ${storyData.headline}`);
      importStats.embeddingFailed++;
    }
    
    // Map StoryDredge data to HSA model
    const story = await prisma.story.create({
      data: {
        title: storyData.headline,
        rawText: enhancedText,
        processedText: storyData.body, // Only the actual content for processing
        timestamp: new Date(storyData.timestamp),
        sourceType: storyData.publication,
        location: storyData.dateline || '',
        embedding: embedding,
      }
    });
    
    console.log(`Imported story: ${storyData.headline}`);
    importStats.imported++;
    
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    importStats.failed++;
  }
}

// Helper function to find all JSON files in a directory
function findJsonFiles(dir) {
  let results = [];
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

// Process files in batches to avoid rate limits
async function processBatch(files, startIndex) {
  const endIndex = Math.min(startIndex + BATCH_SIZE, files.length);
  const batchFiles = files.slice(startIndex, endIndex);
  
  for (const filePath of batchFiles) {
    await processFile(filePath);
  }
  
  // Log progress
  const progress = endIndex / files.length * 100;
  console.log(`Progress: ${progress.toFixed(1)}% (${endIndex}/${files.length})`);
  
  // Process next batch if there are more files
  if (endIndex < files.length) {
    return processBatch(files, endIndex);
  }
}

// Main function to start the import process
async function importFromDredge() {
  console.log(`Starting import from: ${HSA_READY_DIR}`);
  
  if (!fs.existsSync(HSA_READY_DIR)) {
    console.error(`StoryDredge directory not found at ${HSA_READY_DIR}. Please ensure the directory exists.`);
    return;
  }
  
  // Find all JSON files
  const jsonFiles = findJsonFiles(HSA_READY_DIR);
  importStats.found = jsonFiles.length;
  console.log(`Found ${jsonFiles.length} JSON files to process`);
  
  // Process files in batches
  await processBatch(jsonFiles, 0);
  
  const endTime = Date.now();
  const duration = (endTime - importStats.startTime) / 1000;
  
  console.log(`
Import complete.
Found: ${importStats.found} stories
Imported: ${importStats.imported}
Skipped: ${importStats.skipped}
Failed: ${importStats.failed}
Embedding Failed: ${importStats.embeddingFailed}
Duration: ${duration.toFixed(2)} seconds
  `);
  
  // Close the Prisma client when done
  await prisma.$disconnect();
}

// Run the import
importFromDredge()
  .then(() => {
    console.log('Import process finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import process failed:', error);
    process.exit(1);
  }); 