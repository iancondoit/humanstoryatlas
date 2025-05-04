import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to create a vector embedding for search
async function createSearchEmbedding(query: string) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: query,
      encoding_format: 'float',
    });

    if (response?.data?.[0]?.embedding) {
      return response.data[0].embedding;
    }
    return null;
  } catch (error) {
    console.error('Error creating search embedding:', error);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const publication = searchParams.get('publication') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const limit = Number(searchParams.get('limit') || '10');

  try {
    // Build the filter conditions
    const where: any = {};
    
    // Add publication filter if provided
    if (publication) {
      where.sourceType = {
        contains: publication,
      };
    }
    
    // Add date range filters if provided
    if (startDate) {
      where.timestamp = {
        ...where.timestamp,
        gte: new Date(startDate),
      };
    }
    
    if (endDate) {
      where.timestamp = {
        ...where.timestamp,
        lte: new Date(endDate),
      };
    }
    
    // Search by text query
    if (query) {
      where.OR = [
        { title: { contains: query } },
        { processedText: { contains: query } },
      ];
    }
    
    // Fetch stories from the database
    const stories = await prisma.story.findMany({
      where,
      take: limit,
      orderBy: {
        timestamp: 'desc',
      },
    });
    
    // Map the stories to a more API-friendly format
    const formattedStories = stories.map(story => ({
      id: story.id,
      title: story.title,
      publication: story.sourceType,
      date: story.timestamp.toISOString().split('T')[0],
      snippet: story.processedText.substring(0, 200) + '...',
      relevanceScore: 0.9, // Placeholder until we implement vector search
    }));
    
    // Simulate narrative arcs based on stories for now
    // This would be replaced with actual arc generation using OpenAI
    const arcs = generateMockArcs(formattedStories, query);
    
    // Generate follow-up suggestions based on the query
    const suggestedFollowups = generateFollowupSuggestions(query, formattedStories);
    
    return NextResponse.json({
      stories: formattedStories,
      arcs,
      suggestedFollowups,
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

// Helper function to generate mock arcs based on stories
// In the future, this would use OpenAI to create meaningful arcs
function generateMockArcs(stories: any[], query: string) {
  if (stories.length === 0) return [];
  
  // Group stories by publication
  const publicationGroups: Record<string, any[]> = {};
  stories.forEach(story => {
    if (!publicationGroups[story.publication]) {
      publicationGroups[story.publication] = [];
    }
    publicationGroups[story.publication].push(story);
  });
  
  // Create arcs based on publication groups
  const arcs = Object.entries(publicationGroups).map(([publication, stories], index) => {
    const startDate = stories.reduce((min, story) => {
      const storyDate = new Date(story.date);
      return storyDate < min ? storyDate : min;
    }, new Date(stories[0].date));
    
    const endDate = stories.reduce((max, story) => {
      const storyDate = new Date(story.date);
      return storyDate > max ? storyDate : max;
    }, new Date(stories[0].date));
    
    return {
      id: `arc-${index}`,
      title: `${publication} Coverage: ${query}`,
      storyCount: stories.length,
      timespan: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      summary: `A collection of stories from ${publication} covering various aspects of ${query}. These stories reveal interesting patterns and connections that could form the basis of a compelling narrative.`,
      themes: ['Historical Events', 'Local Impact', 'Public Response'],
      storyType: determineStoryType(query),
    };
  });
  
  return arcs;
}

// Helper function to determine story type based on query
function determineStoryType(query: string) {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('crime') || lowerQuery.includes('murder')) {
    return 'True Crime Potential';
  } else if (lowerQuery.includes('politics') || lowerQuery.includes('government')) {
    return 'Political Thriller with Hidden Consequences';
  } else if (lowerQuery.includes('sports') || lowerQuery.includes('game')) {
    return 'Sports Narrative with Unexpected Complexity';
  } else if (lowerQuery.includes('war') || lowerQuery.includes('conflict')) {
    return 'Conflict Chronicle with Human Impact';
  } else {
    return 'Historical Arc with Forgotten Details';
  }
}

// Helper function to generate follow-up suggestions
function generateFollowupSuggestions(query: string, stories: any[]) {
  const baseFollowups = [
    `Explore forgotten human stories behind ${query}`,
    `Uncover the narrative potential in ${query}`,
    `Find the dramatic arcs connecting ${query} to larger events`,
  ];
  
  // Add story-specific followups if we have stories
  if (stories.length > 0) {
    const publications = [...new Set(stories.map(story => story.publication))];
    if (publications.length > 1) {
      baseFollowups.push(`Compare how different publications covered ${query}`);
    }
    
    // Add date-based followup if stories span multiple time periods
    const dates = stories.map(story => story.date.substring(0, 4)); // Get years
    const uniqueYears = [...new Set(dates)];
    if (uniqueYears.length > 1) {
      baseFollowups.push(`See how coverage of ${query} evolved over time`);
    }
  }
  
  return baseFollowups;
} 