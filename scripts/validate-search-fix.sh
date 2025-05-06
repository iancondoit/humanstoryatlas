#!/bin/bash

echo "===== Human Story Atlas Search Validation ====="
echo "Running tests to validate the search functionality fix..."

# Check if database has stories
echo -e "\n\033[1m1. Checking database contents\033[0m"
node scripts/count-stories.js

# Test basic database search functionality
echo -e "\n\033[1m2. Testing database search\033[0m"
node scripts/test-database-search.js

# Test case sensitivity issues
echo -e "\n\033[1m3. Testing case sensitivity\033[0m"
node scripts/prisma-case-test.js

# Test raw SQL queries
echo -e "\n\033[1m4. Testing direct database queries\033[0m"
node scripts/direct-database-query.js

# Run the new test for the API fix
echo -e "\n\033[1m5. Testing API fix\033[0m"
node scripts/test-api-fix.js

echo -e "\n\033[1m===== Validation Complete =====\033[0m"
echo "If all tests passed, the search functionality should be working correctly."
echo "Make sure your Next.js server is running to test the actual API endpoint."
echo "You can test the search in the UI by navigating to your app and using the search bar." 