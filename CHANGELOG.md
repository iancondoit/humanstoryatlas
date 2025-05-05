# Changelog

All notable changes to this project will be documented in this file.

## [1.7.0] - 2024-11-15

### Added
- New discovery summary API endpoint for contextual overviews of stories
- DiscoveryPanel component to visualize entity data, themes, and notable stories
- Publications API endpoint to fetch available publication sources

### Changed
- Updated UI to feature Explore mode as the default view
- Removed example prompts section from Explore tab for cleaner interface
- Improved filtering capabilities with dynamic publication dropdown

### Fixed
- Fixed publication dropdown to correctly show "San Antonio Express-News"
- Enhanced error handling in discovery and publications APIs

## [1.6.0] - 2024-11-08

### Added
- Improved error handling in API routes
- Better database integration with real StoryDredge data

### Changed
- Updated version number for new release
- Merged all changes from main branch

### Fixed
- Fixed stories API to properly use real database data instead of fallback mock data
- Improved API response formatting for consistent frontend display

## [1.5.0] - 2024-05-04

### Added
- Full StoryDredge data integration with successful import of 244 stories from 1970-1977
- Improved bulk-import.js script for direct SQLite database access
- Added story count distribution by date in DATA_IMPORT.md
- Added count-stories.js script to check database status

### Fixed
- Fixed PostCSS configuration file by converting to .cjs extension
- Fixed fs.existsSync issue in bulk-import.js script

## [1.4.0] - Previous version

- Initial version with basic functionality 