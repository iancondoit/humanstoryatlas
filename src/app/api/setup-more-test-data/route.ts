import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/setup-more-test-data
 * Creates more test data with the correct "San Antonio Express-News" name
 */
export async function GET() {
  try {
    // Create test stories for San Antonio Express-News
    const testStories = await Promise.all([
      prisma.story.create({
        data: {
          title: "West Side Blaze Leaves 3 Dead",
          rawText: "A string of arson incidents escalates as investigators narrow suspects. The fire department responded to a blaze at 3 AM in the West Side neighborhood. Witnesses reported seeing a suspicious person in the area before the fire. This marks the third deadly fire in the area this month.",
          processedText: "A string of arson incidents escalates as investigators narrow suspects. The fire department responded to a blaze at 3 AM in the West Side neighborhood. Witnesses reported seeing a suspicious person in the area before the fire. This marks the third deadly fire in the area this month.",
          timestamp: new Date("1977-08-11"),
          sourceType: "San Antonio Express-News",
          location: "West Side",
        },
      }),
      prisma.story.create({
        data: {
          title: "Teachers Union Threatens Walkout",
          rawText: "Union demands include wage increases and classroom safety improvements. The teachers union has voted to authorize a strike if their demands are not met by the school board. Mayor McAllister has urged both sides to resume negotiations. Parents are concerned about the impact on students if a strike occurs.",
          processedText: "Union demands include wage increases and classroom safety improvements. The teachers union has voted to authorize a strike if their demands are not met by the school board. Mayor McAllister has urged both sides to resume negotiations. Parents are concerned about the impact on students if a strike occurs.",
          timestamp: new Date("1977-08-09"),
          sourceType: "San Antonio Express-News",
          location: "San Antonio",
        },
      }),
      prisma.story.create({
        data: {
          title: "City Council Debates New Budget",
          rawText: "Mr. Joe Luna presented the new city budget proposal at yesterday's meeting. The council members debated funding for the Police Department and road improvements. Bexar County Jail expansion funds were also discussed as a priority item. The council will vote next week.",
          processedText: "Mr. Joe Luna presented the new city budget proposal at yesterday's meeting. The council members debated funding for the Police Department and road improvements. Bexar County Jail expansion funds were also discussed as a priority item. The council will vote next week.",
          timestamp: new Date("1977-08-05"),
          sourceType: "San Antonio Express-News",
          location: "San Antonio",
        },
      }),
      // Adding more test stories to have a richer dataset
      prisma.story.create({
        data: {
          title: "Local Business Association Forms Downtown",
          rawText: "The Downtown Business Association held its first meeting yesterday with 20 local business owners in attendance. Mrs. Patricia Rodriguez was elected as the first president of the organization. The association plans to advocate for more parking and improved streetlights along Commerce Street.",
          processedText: "The Downtown Business Association held its first meeting yesterday with 20 local business owners in attendance. Mrs. Patricia Rodriguez was elected as the first president of the organization. The association plans to advocate for more parking and improved streetlights along Commerce Street.",
          timestamp: new Date("1977-08-07"),
          sourceType: "San Antonio Express-News",
          location: "Downtown",
        },
      }),
      prisma.story.create({
        data: {
          title: "Police Department Announces New Crime Prevention Program",
          rawText: "Chief of Police Thomas Wilson announced a new community policing initiative at a press conference yesterday. The program will place officers on foot patrol in high-crime neighborhoods. 'We believe having officers walking the beat will build trust with community members,' said Dr. Maria Gonzalez, a consultant on the project.",
          processedText: "Chief of Police Thomas Wilson announced a new community policing initiative at a press conference yesterday. The program will place officers on foot patrol in high-crime neighborhoods. 'We believe having officers walking the beat will build trust with community members,' said Dr. Maria Gonzalez, a consultant on the project.",
          timestamp: new Date("1977-08-10"),
          sourceType: "San Antonio Express-News",
          location: "San Antonio",
        },
      }),
      prisma.story.create({
        data: {
          title: "School Board Votes on Classroom Size Limits",
          rawText: "The San Antonio School Board voted 6-1 last night to limit classroom sizes to 25 students. Board President James Martinez cited research showing improved outcomes with smaller class sizes. The Teachers Association of San Antonio praised the decision as 'a step in the right direction for educational quality.'",
          processedText: "The San Antonio School Board voted 6-1 last night to limit classroom sizes to 25 students. Board President James Martinez cited research showing improved outcomes with smaller class sizes. The Teachers Association of San Antonio praised the decision as 'a step in the right direction for educational quality.'",
          timestamp: new Date("1977-08-08"),
          sourceType: "San Antonio Express-News",
          location: "San Antonio",
        },
      }),
      prisma.story.create({
        data: {
          title: "Bexar County Hospital Breaks Ground on New Wing",
          rawText: "Construction began yesterday on the new east wing of Bexar County Hospital. The $3.5 million expansion will add 50 beds and a dedicated pediatric unit. Hospital Director Dr. Sarah Johnson called it 'the largest healthcare investment in our county in a decade.'",
          processedText: "Construction began yesterday on the new east wing of Bexar County Hospital. The $3.5 million expansion will add 50 beds and a dedicated pediatric unit. Hospital Director Dr. Sarah Johnson called it 'the largest healthcare investment in our county in a decade.'",
          timestamp: new Date("1977-08-12"),
          sourceType: "San Antonio Express-News",
          location: "Bexar County",
        },
      }),
    ]);
    
    return NextResponse.json({ 
      success: true, 
      message: "Additional test data created successfully", 
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