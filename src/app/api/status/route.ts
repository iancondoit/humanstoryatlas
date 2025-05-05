import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Custom BigInt serializer
function serializeData(data: any): any {
  return JSON.parse(
    JSON.stringify(data, (_, value) => 
      typeof value === 'bigint' ? Number(value) : value
    )
  );
}

export async function GET() {
  try {
    // Get basic counts without complex queries
    const storiesCount = Number(await prisma.story.count());
    const arcsCount = Number(await prisma.arc.count());
    
    // Get unique sources count
    let sourcesCount = 0;
    try {
      const sources = await prisma.story.findMany({
        select: { sourceType: true },
        distinct: ['sourceType'],
      });
      sourcesCount = sources.length;
    } catch (e) {
      console.error('Error counting sources:', e);
    }
    
    // Get date range information
    let dateRange = { startDate: null, endDate: null };
    try {
      // Find oldest and newest story dates
      const oldestStory = await prisma.story.findFirst({
        select: { timestamp: true },
        orderBy: { timestamp: 'asc' },
      });
      
      const newestStory = await prisma.story.findFirst({
        select: { timestamp: true },
        orderBy: { timestamp: 'desc' },
      });
      
      if (oldestStory && newestStory) {
        dateRange = {
          startDate: oldestStory.timestamp.toISOString().split('T')[0],
          endDate: newestStory.timestamp.toISOString().split('T')[0],
        };
      }
    } catch (e) {
      console.error('Error determining date range:', e);
    }
    
    // Count named entities (people, places, orgs)
    // For now this is a placeholder - in a future update we'll extract actual entities
    const entitiesCount = Math.floor(storiesCount * 2.5); // Estimate: each story has ~2-3 entities
    
    // Get unique years without using raw SQL
    let timePeriodsCount = 0;
    try {
      const stories = await prisma.story.findMany({
        select: { timestamp: true },
      });
      
      // Extract unique years from timestamps
      const uniqueYears = new Set(
        stories.map((story: { timestamp: Date | string }) => {
          const date = new Date(story.timestamp);
          return date.getFullYear();
        })
      );
      timePeriodsCount = uniqueYears.size;
    } catch (e) {
      console.error('Error counting time periods:', e);
    }
    
    // Get last ingest timestamp (using newest story for now)
    let lastIngestTimestamp = null;
    try {
      const newestRecord = await prisma.story.findFirst({
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      
      if (newestRecord) {
        lastIngestTimestamp = newestRecord.createdAt.toISOString();
      }
    } catch (e) {
      console.error('Error determining last ingest timestamp:', e);
    }
    
    // Check if using real data or fallback
    const usingRealData = storiesCount > 0;
    
    // Create the response object
    const responseData = {
      status: 'connected',
      usingRealData,
      stats: {
        stories: storiesCount,
        arcs: arcsCount,
        sources: sourcesCount,
        timePeriods: timePeriodsCount,
        entities: entitiesCount,
        dateRange: dateRange,
        lastIngestTimestamp: lastIngestTimestamp,
        lastUpdated: new Date().toISOString(),
      }
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Database status check failed:', error);
    
    // Create the error response object
    const errorResponse = {
      status: 'error',
      usingRealData: false,
      error: 'Failed to connect to database',
      stats: {
        stories: 0,
        arcs: 0,
        sources: 0,
        timePeriods: 0,
        entities: 0,
        dateRange: { startDate: null, endDate: null },
        lastIngestTimestamp: null,
        lastUpdated: null,
      }
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
} 