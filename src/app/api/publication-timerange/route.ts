import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/publication-timerange?source=San%20Antonio%20Express-News
 * Returns the earliest and latest dates available for a specific publication source
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source');

  if (!source) {
    return NextResponse.json(
      { error: 'Missing source parameter' },
      { status: 400 }
    );
  }

  try {
    // Find the earliest date
    const earliest = await prisma.story.findFirst({
      where: {
        sourceType: source,
      },
      orderBy: {
        timestamp: 'asc',
      },
      select: {
        timestamp: true,
      },
    });

    // Find the latest date
    const latest = await prisma.story.findFirst({
      where: {
        sourceType: source,
      },
      orderBy: {
        timestamp: 'desc',
      },
      select: {
        timestamp: true,
      },
    });

    // If no data found
    if (!earliest || !latest) {
      return NextResponse.json(
        { 
          startDate: null, 
          endDate: null,
          message: 'No data available for this publication'
        }
      );
    }

    // Format dates as YYYY-MM-DD strings for input fields
    const startDate = earliest.timestamp.toISOString().split('T')[0];
    const endDate = latest.timestamp.toISOString().split('T')[0];

    return NextResponse.json({ startDate, endDate });
  } catch (error) {
    console.error('Error fetching publication timerange:', error);
    return NextResponse.json(
      { error: 'Failed to fetch date range' },
      { status: 500 }
    );
  }
} 