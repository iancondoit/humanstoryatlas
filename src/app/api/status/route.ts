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
    
    // Get unique years without using raw SQL
    let timePeriodsCount = 0;
    try {
      const stories = await prisma.story.findMany({
        select: { timestamp: true },
      });
      
      // Extract unique years from timestamps
      const uniqueYears = new Set(
        stories.map((story: { timestamp: Date }) => new Date(story.timestamp).getFullYear())
      );
      timePeriodsCount = uniqueYears.size;
    } catch (e) {
      console.error('Error counting time periods:', e);
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
        lastUpdated: new Date().toISOString(),
      }
    };
    
    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
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
        lastUpdated: null,
      }
    };
    
    return new NextResponse(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 