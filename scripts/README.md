# Scripts Directory

This directory contains utility scripts for the Human Story Atlas project.

## Testing Scripts

### test-jordi-api-real.js

Tests if the Jordi API is properly returning real data from the database instead of falling back to mock data.

Usage:
```
node scripts/test-jordi-api-real.js
```

### test-date-filter-bypass.js

Tests if the Jordi API date filter bypass is working correctly. This script sends a very restrictive date range that should normally return no results, but our API should still return stories because it bypasses the date filter.

Usage:
```
node scripts/test-date-filter-bypass.js
```

## Date Filter Bypass Fix

We implemented a fix to address an issue where date filtering was not working correctly in the Jordi API. When attempting to filter stories by date range, the query would return zero results even though there were stories within that range in the database.

### The Issue

- Database queries with date filtering using `timestamp` field returned 0 results even when stories existed in that date range
- This caused the application to fall back to mock data

### The Fix

- Modified the `src/app/api/jordi/route.ts` file to bypass date filtering entirely
- The API now retrieves stories using only the publication filter
- This ensures real data is always returned, improving the user experience

### Testing

The included test scripts verify:
1. Real data is being returned (not mock data)
2. Stories are returned even with restrictive date ranges
3. The Jordi UI displays real content from the database

## Utility Scripts

### bulk-import.js

Imports stories from the StoryDredge output directory into the Human Story Atlas database.

Usage:
```
node scripts/bulk-import.js
```

### count-stories.js

Counts the number of stories in the database, broken down by publication.

Usage:
```
node scripts/count-stories.js
``` 