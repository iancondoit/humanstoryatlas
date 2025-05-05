import { NextResponse } from 'next/server';
import { getDiscoverySummary } from '@/lib/discovery';

/**
 * GET /api/discovery_summary
 * 
 * Query parameters:
 * - source: Identifier for the newspaper/archive (string)
 * - from: Start of the time window (date)
 * - to: End of the time window (date)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  // Validate required parameters
  if (!source || !from || !to) {
    return NextResponse.json(
      { 
        error: 'Missing required parameters',
        details: 'Please provide source, from, and to parameters'
      },
      { status: 400 }
    );
  }

  // Validate date formats
  try {
    new Date(from);
    new Date(to);
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Invalid date format',
        details: 'Please provide dates in YYYY-MM-DD format'
      },
      { status: 400 }
    );
  }

  try {
    const summary = await getDiscoverySummary(source, from, to);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating discovery summary:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: 'Failed to generate discovery summary'
      },
      { status: 500 }
    );
  }
} 