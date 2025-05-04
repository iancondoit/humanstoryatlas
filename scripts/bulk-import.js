#!/usr/bin/env node
import { promises as fsPromises } from 'fs';
import * as fs from 'fs'; // Import regular fs for existsSync
import * as path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const HSA_READY_DIR = '/Users/ianhoppe/Documents/StoryDredge/output/hsa-ready';
const DB_PATH = path.join(__dirname, '..', 'prisma', 'hsa.db');
const VALID_SECTION = 'news';
const CLEAR_DB_FIRST = true; // Set to true to clear the database before importing

// Stats
const stats = {
  found: 0,
  imported: 0,
  skipped: 0,
  failed: 0
};

async function main() {
  console.log(`Starting bulk import from ${HSA_READY_DIR}`);
  
  if (!fs.existsSync(HSA_READY_DIR)) {
    console.error(`Directory not found: ${HSA_READY_DIR}`);
    return;
  }
  
  // Open database connection
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
  
  try {
    // Optionally clear database first
    if (CLEAR_DB_FIRST) {
      console.log("Clearing database before import...");
      await db.run("DELETE FROM Story");
      console.log("Database cleared");
    }
    
    // Count existing stories
    const { count: existingStoriesCount } = await db.get("SELECT COUNT(*) as count FROM Story");
    console.log(`Current story count in database: ${existingStoriesCount}`);
    
    // Find all JSON files
    const jsonFiles = await findJsonFiles(HSA_READY_DIR);
    stats.found = jsonFiles.length;
    console.log(`Found ${jsonFiles.length} JSON files to process`);
    
    // Start a transaction for better performance
    await db.run("BEGIN TRANSACTION");
    
    // Process files
    for (const [index, filePath] of jsonFiles.entries()) {
      await processFile(db, filePath);
      
      // Log progress every 10 files
      if ((index + 1) % 10 === 0 || index === jsonFiles.length - 1) {
        const progress = ((index + 1) / jsonFiles.length * 100).toFixed(1);
        console.log(`Progress: ${progress}% (${index + 1}/${jsonFiles.length})`);
      }
    }
    
    // Commit the transaction
    await db.run("COMMIT");
    
    // Get final count
    const { count: finalCount } = await db.get("SELECT COUNT(*) as count FROM Story");
    console.log(`Final story count in database: ${finalCount}`);
    console.log(`Net change: ${finalCount - existingStoriesCount} stories`);
    
  } catch (error) {
    console.error("Error during import:", error);
    // Rollback transaction on error
    await db.run("ROLLBACK");
  } finally {
    await db.close();
    
    console.log(`
Import complete.
Found: ${stats.found} stories
Imported: ${stats.imported}
Skipped: ${stats.skipped}
Failed: ${stats.failed}
    `);
  }
}

async function findJsonFiles(dir) {
  const results = [];
  
  async function scanDir(currentDir) {
    const entries = await fsPromises.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        await scanDir(fullPath);
      } else if (entry.isFile() && path.extname(entry.name) === '.json') {
        results.push(fullPath);
      }
    }
  }
  
  await scanDir(dir);
  return results;
}

async function processFile(db, filePath) {
  try {
    const fileContent = await fsPromises.readFile(filePath, 'utf8');
    const storyData = JSON.parse(fileContent);
    
    // Validate section
    if (storyData.section !== VALID_SECTION) {
      console.log(`Skipping non-news story: ${filePath}, section: ${storyData.section}`);
      stats.skipped++;
      return;
    }
    
    // Append metadata to the raw text to preserve StoryDredge information
    const metadataBlock = `
---
Source: ${storyData.publication || 'Unknown'}
URL: ${storyData.source_url || ''}
Issue: ${storyData.source_issue || ''}
Tags: ${storyData.tags ? storyData.tags.join(', ') : ''}
Imported from: StoryDredge
${storyData.byline ? `Byline: ${storyData.byline}` : ''}
${storyData.dateline ? `Dateline: ${storyData.dateline}` : ''}
---

`;
    
    // Combine metadata and body
    const enhancedText = metadataBlock + (storyData.body || '');
    
    // Convert timestamp
    const timestamp = storyData.timestamp 
      ? new Date(storyData.timestamp).toISOString() 
      : new Date().toISOString();
    
    // Generate a UUID
    const id = uuidv4();
    const now = new Date().toISOString();
    
    // Insert story
    await db.run(
      `INSERT INTO Story (id, title, rawText, processedText, timestamp, sourceType, location, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        storyData.headline || 'Unknown Title',
        enhancedText,
        storyData.body || '',
        timestamp,
        storyData.publication || 'Unknown',
        storyData.dateline || '',
        now,
        now
      ]
    );
    
    console.log(`Imported story: ${storyData.headline}`);
    stats.imported++;
    
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    stats.failed++;
  }
}

// Run the main function
main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
}); 