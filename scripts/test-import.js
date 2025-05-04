const fs = require('fs');
const path = require('path');

// Constants
const HSA_READY_DIR = '/Users/ianhoppe/Documents/StoryDredge/output/hsa-ready';

console.log("Starting import test...");
console.log("Directory exists:", fs.existsSync(HSA_READY_DIR));

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

// Find all JSON files
const jsonFiles = findJsonFiles(HSA_READY_DIR);
console.log(`Found ${jsonFiles.length} JSON files`);

// Look at the first few files
if (jsonFiles.length > 0) {
  console.log("First 5 files:");
  jsonFiles.slice(0, 5).forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
    
    // Parse the JSON file to validate
    try {
      const content = fs.readFileSync(file, 'utf8');
      const data = JSON.parse(content);
      console.log(`   Title: ${data.headline}`);
      console.log(`   Publication: ${data.publication}`);
      console.log(`   Date: ${data.timestamp}`);
      console.log(`   Section: ${data.section}`);
      console.log("   Valid JSON ✓");
    } catch (error) {
      console.error(`   Error reading/parsing: ${error.message}`);
    }
  });
}

console.log("Import test completed."); 