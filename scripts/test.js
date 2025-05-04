console.log('Test script');
const fs = require('fs');
const path = require('path');

const directory = '/Users/ianhoppe/Documents/StoryDredge/output/hsa-ready';
console.log(`Directory exists: ${fs.existsSync(directory)}`);

try {
  const items = fs.readdirSync(directory);
  console.log(`Found ${items.length} items in ${directory}`);
  console.log(`Items: ${items.join(', ')}`);
  
  // Check the first item if it's a directory
  if (items.length > 0) {
    const firstItem = items[0];
    const firstItemPath = path.join(directory, firstItem);
    const stats = fs.statSync(firstItemPath);
    console.log(`First item ${firstItem} is directory: ${stats.isDirectory()}`);
    
    if (stats.isDirectory()) {
      const subItems = fs.readdirSync(firstItemPath);
      console.log(`Found ${subItems.length} items in ${firstItemPath}`);
    }
  }
} catch (error) {
  console.error('Error accessing directory:', error);
} 