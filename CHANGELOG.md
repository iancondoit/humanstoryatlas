# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2024-11-17

### Added
- New Query Pane feature that slides in when users click on entities, keywords, or themes
- Contextual search interface that allows users to refine and combine filters
- FilterChip component for displaying filter elements with appropriate icons
- Query building utilities for constructing search parameters
- Timeline preview placeholder in Query Pane
- Interactive elements in Discovery Panel to open Query Pane with pre-filled filters
- Animated transitions for smooth user experience

## [1.7.2] - 2024-11-15

### Fixed
- Added catch-all route handler to properly manage 404 pages
- Created fallback mechanism for API endpoints with multiple layers of redundancy
- Added Vercel configuration file for improved routing and fallback behavior 
- Enhanced error handling in FilterBar component

## [1.7.1] - 2024-11-15

### Fixed
- Fixed API routes issue causing "Failed to fetch publications" error
- Added fallback mechanism for publications endpoint
- Improved error handling for API failure scenarios

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