#!/bin/bash
echo "Starting StoryDredge import test"
STORIES=$(find /Users/ianhoppe/Documents/StoryDredge/output/hsa-ready -type f -name "*.json" | head -5)

echo "Found $(echo "$STORIES" | wc -l) stories to test"

for story in $STORIES; do
  echo "Processing $story"
  cat "$story" | jq . | head -10
  echo ""
done

echo "Import test complete" 