import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/publications-backup
 * Backup endpoint that returns a list of all distinct publication sources in the database
 * This is used as a fallback for the main publications endpoint
 */
export async function GET() {
  try {
    // Using a simpler approach to get unique sourceType values
    const publications = await prisma.story.groupBy({
      by: ['sourceType'],
      where: {
        sourceType: {
          not: '',
        },
      },
      orderBy: {
        sourceType: 'asc',
      },
    });

    // Extract just the sourceType strings
    const publicationNames = publications.map((pub: { sourceType: string }) => pub.sourceType);
    
    console.log('Successfully fetched publications from backup endpoint:', publicationNames);
    
    return NextResponse.json({ publications: publicationNames });
  } catch (error) {
    console.error('Error fetching publications from backup endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch publications' },
      { status: 500 }
    );
  }
} 