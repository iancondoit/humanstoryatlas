import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/setup-test-data
 * Creates some test data with SanAntonioExpress as the sourceType
 */
export async function GET() {
  try {
    // Create test stories for SanAntonioExpress
    const testStories = await Promise.all([
      prisma.story.create({
        data: {
          title: "West Side Blaze Leaves 3 Dead",
          rawText: "A string of arson incidents escalates as investigators narrow suspects. The fire department responded to a blaze at 3 AM in the West Side neighborhood. Witnesses reported seeing a suspicious person in the area before the fire. This marks the third deadly fire in the area this month.",
          processedText: "A string of arson incidents escalates as investigators narrow suspects. The fire department responded to a blaze at 3 AM in the West Side neighborhood. Witnesses reported seeing a suspicious person in the area before the fire. This marks the third deadly fire in the area this month.",
          timestamp: new Date("1977-08-11"),
          sourceType: "SanAntonioExpress",
          location: "West Side",
        },
      }),
      prisma.story.create({
        data: {
          title: "Teachers Union Threatens Walkout",
          rawText: "Union demands include wage increases and classroom safety improvements. The teachers union has voted to authorize a strike if their demands are not met by the school board. Mayor McAllister has urged both sides to resume negotiations. Parents are concerned about the impact on students if a strike occurs.",
          processedText: "Union demands include wage increases and classroom safety improvements. The teachers union has voted to authorize a strike if their demands are not met by the school board. Mayor McAllister has urged both sides to resume negotiations. Parents are concerned about the impact on students if a strike occurs.",
          timestamp: new Date("1977-08-09"),
          sourceType: "SanAntonioExpress",
          location: "San Antonio",
        },
      }),
      prisma.story.create({
        data: {
          title: "City Council Debates New Budget",
          rawText: "Mr. Joe Luna presented the new city budget proposal at yesterday's meeting. The council members debated funding for the Police Department and road improvements. Bexar County Jail expansion funds were also discussed as a priority item. The council will vote next week.",
          processedText: "Mr. Joe Luna presented the new city budget proposal at yesterday's meeting. The council members debated funding for the Police Department and road improvements. Bexar County Jail expansion funds were also discussed as a priority item. The council will vote next week.",
          timestamp: new Date("1977-08-05"),
          sourceType: "SanAntonioExpress",
          location: "San Antonio",
        },
      }),
    ]);
    
    return NextResponse.json({ 
      success: true, 
      message: "Test data created successfully", 
      count: testStories.length 
    });
  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json(
      { error: 'Failed to create test data', details: error },
      { status: 500 }
    );
  }
} 