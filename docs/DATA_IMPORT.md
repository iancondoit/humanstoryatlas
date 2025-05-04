# StoryDredge to Human Story Atlas Data Import

This document explains how data is imported from the StoryDredge project into the Human Story Atlas (HSA) application.

## Directory Structure

StoryDredge processes data and places output files in a specific directory structure at `/Users/ianhoppe/Documents/StoryDredge/output/hsa-ready`:

```
/Users/ianhoppe/Documents/StoryDredge/
  └── output/
      └── hsa-ready/
          └── YYYY/        # Year folders (e.g., 1974, 1975, 1977)
              └── MM/      # Month folders (e.g., 04)
                  └── DD/  # Day folders (e.g., 13)
                      └── *.json       # JSON story files
```

Each JSON file contains a processed story with metadata including headline, body text, publication source, timestamp, etc.

## Import Process

The HSA application imports stories from StoryDredge using the following scripts:

1. `scripts/import-stories.ts` - TypeScript implementation that uses Prisma
2. `scripts/bulk-import.js` - JavaScript implementation that directly accesses SQLite (recommended)
3. `scripts/import-from-dredge.js` - JavaScript implementation (alternative)
4. `src/scripts/import_from_dredge.ts` - Alternative implementation

To run the TypeScript import process:

```bash
npm run import:dredge
```

To run the direct SQLite bulk import process:

```bash
cd scripts && node bulk-import.js
```

The bulk-import.js script is recommended as it provides the most reliable import process.

## How the Import Works

1. The scripts look for JSON files in the StoryDredge output directory (`/Users/ianhoppe/Documents/StoryDredge/output/hsa-ready`)
2. For each JSON file:
   - Validates that it's a news story (section = 'news')
   - Checks if the story already exists in the database (to avoid duplicates)
   - Creates a metadata block with source information
   - Imports the story into the HSA database with proper formatting

## Testing the Import

You can test the import process by running:

```bash
./scripts/run-import.sh
```

This script finds a few JSON files from the StoryDredge output directory and displays their content without actually importing them.

## Testing and Verification Results

The import process has been successfully tested and verified. The system is now correctly importing stories from the StoryDredge directory at `/Users/ianhoppe/Documents/StoryDredge/output/hsa-ready`. 

Current status:
- The StoryDredge directory contains 259 valid JSON files with story data
- Using the bulk-import.js script, we successfully imported 244 stories (15 were skipped because they weren't in the news section)
- The stories span from 1970 to 1977 across multiple dates
- Distribution of imported stories:
  - 1970-01-01: 16 stories
  - 1974-04-13: 25 stories
  - 1974-04-14: 53 stories
  - 1974-04-27: 19 stories
  - 1975-01-01: 26 stories
  - 1977-08-14: 105 stories

To verify the connection is working correctly at any time, run:
```bash
npm run verify:dredge
```

Or to check the number of stories in the database:
```bash
cd scripts && node count-stories.js
```

## Troubleshooting

If the database is empty or missing expected stories, check the following:

1. Verify that the StoryDredge output directory exists at `/Users/ianhoppe/Documents/StoryDredge/output/hsa-ready`
2. Check that the directory contains JSON files with story data
3. Run the import script with proper error handling to see any issues
4. Check the database connection settings

## Maintenance Notes

- The scripts are currently configured to use the absolute path to the StoryDredge directory: `/Users/ianhoppe/Documents/StoryDredge/output/hsa-ready`
- If the StoryDredge project location changes, update the path in the following files:
  - `scripts/import-stories.ts` (HSA_READY_DIR constant)
  - `scripts/bulk-import.js` (HSA_READY_DIR constant)
  - `scripts/import-from-dredge.js` (HSA_READY_DIR constant)
  - `src/scripts/import_from_dredge.ts` (HSA_READY_DIR constant)
  - `scripts/run-import.sh` (STORIES variable) 