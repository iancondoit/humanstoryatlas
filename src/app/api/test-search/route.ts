import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const limit = Number(searchParams.get('limit') || '10');

  try {
    // First, get total count of stories
    const count = await prisma.story.count();
    
    if (count === 0) {
      return NextResponse.json({
        success: false,
        error: 'No stories in database',
        count: 0,
        stories: []
      });
    }

    // Simple query using raw SQL with LOWER() for case-insensitive search
    let stories;
    
    if (query) {
      // Using a simpler query structure to minimize potential errors
      const searchTerm = `%${query.toLowerCase()}%`;
      
      stories = await prisma.$queryRaw`
        SELECT id, title, sourceType, timestamp, processedText 
        FROM Story 
        WHERE LOWER(title) LIKE ${searchTerm} 
           OR LOWER(processedText) LIKE ${searchTerm}
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `;
    } else {
      // If no query, just get the first 10 stories
      stories = await prisma.story.findMany({
        take: limit,
        orderBy: {
          timestamp: 'desc'
        }
      });
    }
    
    // Format the response
    const formattedStories = stories.map((story: any) => ({
      id: story.id,
      title: story.title,
      publication: story.sourceType,
      date: typeof story.timestamp === 'string' 
        ? story.timestamp.split('T')[0] 
        : story.timestamp.toISOString().split('T')[0],
      snippet: story.processedText.substring(0, 100) + '...'
    }));
    
    return NextResponse.json({
      success: true,
      count: formattedStories.length,
      query: query,
      stories: formattedStories
    });
    
  } catch (error) {
    console.error('Error in test-search API:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      count: 0,
      stories: []
    });
  }
} 