import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const HSA_READY_DIR = path.join(__dirname, '..', 'StoryDredge', 'output', 'hsa-ready');

// Sample stories for testing
const sampleStories = [
  {
    headline: "Test Story 1: Local Crime Wave Shocks Community",
    body: "In a surprising turn of events, local authorities reported a 15% increase in petty theft across downtown areas. Police Chief Johnson attributed the rise to economic pressures and has promised increased patrols. Community leaders are organizing neighborhood watch programs in response.",
    tags: ["crime", "local news", "police"],
    section: "news",
    timestamp: "2023-06-15T12:30:00Z",
    publication: "Daily Chronicle",
    source_issue: "Vol 34, No 12",
    source_url: "https://example.com/stories/crime-wave-2023",
    byline: "Sarah Williams",
    dateline: "Chicago, IL"
  },
  {
    headline: "Test Story 2: New Research Shows Promise for Renewable Energy",
    body: "Scientists at State University have developed a new solar panel technology that improves efficiency by 40% while reducing production costs. The breakthrough could accelerate adoption of renewable energy solutions worldwide. Industry experts predict commercial availability within 2 years.",
    tags: ["science", "technology", "energy", "environment"],
    section: "news",
    timestamp: "2023-05-22T09:15:00Z",
    publication: "Science Today",
    source_issue: "May 2023",
    source_url: "https://example.com/stories/renewable-energy-breakthrough",
    byline: "Dr. James Chen",
    dateline: "Boston, MA"
  },
  {
    headline: "Test Story 3: Historic Political Victory Reshapes Local Government",
    body: "In an unexpected outcome, reform candidate Maria Rodriguez won the mayoral election with 58% of the vote. Rodriguez, who ran on a platform of government transparency and infrastructure improvement, defeated three-term incumbent Robert Wilson. The election saw record turnout with 68% of eligible voters participating.",
    tags: ["politics", "election", "local government"],
    section: "news",
    timestamp: "2023-04-10T22:45:00Z",
    publication: "Metro News",
    source_issue: "April 11 Edition",
    source_url: "https://example.com/stories/rodriguez-election-victory",
    byline: "Thomas Lee",
    dateline: "San Diego, CA"
  }
];

// Function to create directory structure
function createDirectories() {
  // Create main directories
  const yearDir = path.join(HSA_READY_DIR, '2023');
  const monthDirs = [
    path.join(yearDir, '04'),
    path.join(yearDir, '05'),
    path.join(yearDir, '06')
  ];
  const dayDirs = [
    path.join(monthDirs[0], '10'),
    path.join(monthDirs[1], '22'),
    path.join(monthDirs[2], '15')
  ];
  
  // Create the directory structure
  [HSA_READY_DIR, yearDir, ...monthDirs, ...dayDirs].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
  
  return dayDirs;
}

// Function to create sample stories
function createSampleStories(dayDirs) {
  sampleStories.forEach((story, index) => {
    const storyDir = dayDirs[index % dayDirs.length];
    const storyFileName = `story-${index + 1}.json`;
    const storyPath = path.join(storyDir, storyFileName);
    
    fs.writeFileSync(storyPath, JSON.stringify(story, null, 2));
    console.log(`Created test story: ${storyPath}`);
  });
}

// Main function
function createTestData() {
  console.log('Creating test stories for Human Story Atlas...');
  
  if (!fs.existsSync(HSA_READY_DIR)) {
    fs.mkdirSync(HSA_READY_DIR, { recursive: true });
    console.log(`Created base directory: ${HSA_READY_DIR}`);
  }
  
  const dayDirs = createDirectories();
  createSampleStories(dayDirs);
  
  console.log(`\nCreated ${sampleStories.length} test stories in StoryDredge format.`);
  console.log('Run "npm run import:dredge" to import these stories into the HSA database.');
}

// Run the script
createTestData(); 