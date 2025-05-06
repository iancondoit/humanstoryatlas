# Human Story Atlas Data Flow

This document outlines the data flow from the StoryDredge pipeline to the Human Story Atlas database and UI.

## Overview

```
StoryDredge Pipeline → HSA Database → Human Story Atlas UI
```

## Data Flow Steps

### 1. StoryDredge Pipeline

The StoryDredge pipeline processes news articles and stories, extracting the following information:
- Story content and metadata
- Publication information
- Timestamps and dates
- Entity extraction
- Vector embeddings for semantic search

The pipeline outputs processed data to the `hsa-ready` directory with a structured format ready for import.

### 2. Database Import

The import process (`src/scripts/import_from_dredge.ts`) handles:
- Reading story data from the StoryDredge output directory
- Validating and transforming data as needed
- Inserting records into the HSA database
- Updating status metrics (story count, date ranges, etc.)
- Logging import timestamp and status

### 3. Human Story Atlas Database

The database stores:
- Stories with full text and metadata
- Entities extracted from stories
- Arcs (connections between stories)
- Vector embeddings for semantic search
- Status information and metrics

### 4. API Layer

The API layer (`src/app/api/*`) provides endpoints for:
- Story retrieval and search (`/api/stories`)
- Database status information (`/api/status`)
- Natural language queries and analysis

### 5. UI Components

The UI layer renders:
- Search interface and results
- Database stats and metrics (`GenomeStats` component)
- Story visualization and exploration
- Jordi AI assistant for interactive exploration

## Key Components

### StoryDredge Output Format

Stories are output as structured JSON with:
- Story ID and title
- Publication source and date
- Full text content
- Processed text for search
- Vector embeddings
- Entity references

### Database Schema

The Prisma schema includes:
- Story model with metadata and content
- Entity model for people, places, and organizations
- Arc model for connecting related stories
- Status tracking for system health

### API Contract

The `/api/status` endpoint returns:
- Story counts
- Entity counts
- Arc counts
- Date range information
- Last update timestamp

The `/api/stories` endpoint accepts:
- Text search queries
- Publication filters
- Date range filters
- Semantic search parameters

## Debugging and Monitoring

- Monitor the import logs for any import failures
- Check the `/api/status` endpoint for system health
- The `GenomeStats` component displays real-time database status 