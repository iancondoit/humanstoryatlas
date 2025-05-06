import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createSearchEmbedding, serializeData, truncateText } from '@/lib/utils';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fallback mock data for when database returns no results
const fallbackStories = [
  {
    id: "fallback1",
    title: "The Forgotten Case of the Boston Strangler",
    publication: "Boston Globe",
    date: "1964-01-15",
    snippet: "An in-depth analysis of one of America's most notorious serial killers and the investigation that captivated the nation. New evidence suggests accomplices may have been involved.",
    relevanceScore: 0.95,
    storyType: "True Crime"
  },
  {
    id: "fallback2",
    title: "Zodiac: The Cipher That Remains Unsolved",
    publication: "San Francisco Chronicle",
    date: "1969-08-02",
    snippet: "The Zodiac Killer's ciphers have puzzled cryptographers for decades. A team of amateur code-breakers believes they may have found a new approach to crack the infamous 340 cipher.",
    relevanceScore: 0.92,
    storyType: "Criminal Investigation"
  },
  {
    id: "fallback3",
    title: "Ted Bundy: The Psychology Behind the Mask",
    publication: "Psychology Today",
    date: "1980-03-12",
    snippet: "Examining the psychological profile of Ted Bundy and how he managed to maintain a charismatic facade while committing heinous crimes. Interviews with former friends reveal warning signs that went unnoticed.",
    relevanceScore: 0.89,
    storyType: "Psychological Profile"
  },
  {
    id: "fallback4",
    title: "Green River Killer: The Investigation That Changed Forensics",
    publication: "Seattle Times",
    date: "2001-11-30",
    snippet: "How the two-decade hunt for the Green River Killer revolutionized forensic science and DNA technology. The case pioneered techniques now standard in criminal investigations.",
    relevanceScore: 0.87,
    storyType: "Forensic Science"
  },
  {
    id: "fallback5",
    title: "BTK Killer's Letters: Communication as Control",
    publication: "Wichita Eagle",
    date: "2005-02-25",
    snippet: "Analysis of the correspondence between the BTK Killer and media outlets reveals patterns of control and manipulation. The psychological need for recognition ultimately led to his capture.",
    relevanceScore: 0.85,
    storyType: "Criminal Psychology"
  }
];

const fallbackArcs = [
  {
    id: "fallbackArc1",
    title: "The Serial Killer Next Door: America's Hidden Predators",
    storyCount: 8,
    timespan: "1960-2005",
    summary: "A chilling narrative thread connecting seemingly ordinary people who led double lives as notorious killers. This arc explores how these individuals evaded detection, often hiding in plain sight within their communities.",
    themes: ["Criminal Psychology", "Social Camouflage", "Investigation Failures", "Community Blindness"],
    storyType: "True Crime with Sociological Elements"
  },
  {
    id: "fallbackArc2",
    title: "Patterns of Predation: The Evolution of Serial Killer Investigations",
    storyCount: 6,
    timespan: "1950-2010",
    summary: "From primitive forensics to DNA databases and geographical profiling, this narrative arc traces how law enforcement adapted to catch increasingly sophisticated killers. Each case contributed techniques that became essential to modern criminal investigation.",
    themes: ["Forensic Evolution", "Investigative Breakthroughs", "Technological Advancement", "Procedural Innovation"],
    storyType: "Procedural with Historical Context"
  }
];

/**
 * Performs a standard text search for stories
 */
async function performTextSearch(searchTerm: string, filters: any, limit: number) {
  const formattedSearchTerm = `%${searchTerm.toLowerCase()}%`;
  
  // Use a simpler raw SQL query with tagged template literals
  const rawResults = await prisma.$queryRaw`
    SELECT * FROM Story 
    WHERE LOWER(title) LIKE ${formattedSearchTerm}
       OR LOWER(processedText) LIKE ${formattedSearchTerm}
  `;
  
  // Ensure we have an array
  let stories = Array.isArray(rawResults) ? rawResults : [];
  
  // Apply filters
  stories = applyFilters(stories, filters);
  
  // Sort and limit
  stories = stories
    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
    
  return stories;
}

/**
 * Performs a semantic vector search for stories
 */
async function performVectorSearch(query: string, filters: any, limit: number) {
  // Create embedding for search
  const embedding = await createSearchEmbedding(query);
  
  if (!embedding) {
    console.error('Failed to create embedding for vector search');
    return [];
  }
  
  // Use vector search via Prisma
  // This is a placeholder - would need to implement based on actual DB schema and capabilities
  // Actual implementation depends on the database being used (PostgreSQL with pgvector, etc.)
  
  return [];
}

/**
 * Applies publication and date filters to search results
 */
function applyFilters(stories: any[], filters: any) {
  let filteredStories = [...stories];
  
  if (filters.publication) {
    filteredStories = filteredStories.filter((story: any) => 
      story.sourceType.toLowerCase().includes(filters.publication.toLowerCase())
    );
  }
  
  if (filters.startDate) {
    const startDateObj = new Date(filters.startDate);
    filteredStories = filteredStories.filter((story: any) => 
      new Date(story.timestamp) >= startDateObj
    );
  }
  
  if (filters.endDate) {
    const endDateObj = new Date(filters.endDate);
    filteredStories = filteredStories.filter((story: any) => 
      new Date(story.timestamp) <= endDateObj
    );
  }
  
  return filteredStories;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const publication = searchParams.get('publication') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const limit = Number(searchParams.get('limit') || '10');
  const useVector = searchParams.get('vector') === 'true';
  const debug = searchParams.get('debug') === 'true';

  // Filters object for consistency
  const filters = {
    publication,
    startDate,
    endDate
  };

  try {
    // Count total stories to verify if we have any data
    const totalStories = await prisma.story.count();
    
    if (debug) {
      console.log(`Total stories in database: ${totalStories}`);
    }
    
    // Only use fallback if database is completely empty
    if (totalStories === 0) {
      if (debug) {
        console.log('No stories in database, using fallback data');
      }
      return NextResponse.json({
        stories: getRelevantFallbackStories(query),
        arcs: getRelevantFallbackArcs(query),
        suggestedFollowups: generateFollowupSuggestions(query, fallbackStories),
        usedFallback: true,
        reason: 'No stories in database'
      });
    }
    
    let stories = [];
    
    try {
      if (query) {
        // Decide between vector and text search
        if (useVector) {
          stories = await performVectorSearch(query, filters, limit);
        } else {
          stories = await performTextSearch(query, filters, limit);
        }
      } else {
        // If no search query, use standard Prisma query
        const where: any = {};
        
        // Add filters to the where clause
        if (publication) {
          where.sourceType = {
            contains: publication,
          };
        }
        
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
        
        stories = await prisma.story.findMany({
          where,
          take: limit,
          orderBy: {
            timestamp: 'desc',
          },
        });
      }
      
      // Serialize stories to handle BigInt values
      stories = serializeData(stories);
      
      if (debug) {
        console.log(`Query "${query}" returned ${stories.length} results`);
      }
    } catch (error) {
      console.error('Database query error:', error);
      // Only use fallback if database query fails
      return NextResponse.json({
        stories: getRelevantFallbackStories(query),
        arcs: getRelevantFallbackArcs(query),
        suggestedFollowups: generateFollowupSuggestions(query, fallbackStories),
        usedFallback: true,
        reason: 'Database query error',
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
    // Return empty result set instead of fallback if query returns no results
    // This makes it clear to the frontend that there are genuinely no matches
    if (stories.length === 0) {
      if (debug) {
        console.log(`No results found for query "${query}", returning empty set`);
      }
      return NextResponse.json({
        stories: [],
        arcs: [],
        suggestedFollowups: generateFollowupSuggestions(query, []),
        usedFallback: false,
        reason: 'No results found for query'
      });
    }
    
    // Transform stories to include relevance and formatting
    const formattedStories = stories.map((story: any) => ({
      id: story.id,
      title: story.title,
      publication: story.sourceType,
      date: story.timestamp.substring(0, 10),
      snippet: truncateText(story.processedText, 200),
      relevanceScore: 0.9, // Default score since we don't have real vector search yet
      storyType: determineStoryType(query),
    }));
    
    // Generate narrative arcs for the found stories
    const arcs = generateMockArcs(formattedStories, query);
    
    // Generate follow-up suggestions
    const followups = generateFollowupSuggestions(query, formattedStories);
    
    return NextResponse.json({
      stories: formattedStories,
      arcs,
      suggestedFollowups: followups,
      usedFallback: false
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      stories: getRelevantFallbackStories(query),
      arcs: getRelevantFallbackArcs(query),
      suggestedFollowups: generateFollowupSuggestions(query, fallbackStories),
      usedFallback: true,
      reason: 'API error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Helper function to get relevant fallback stories based on query
function getRelevantFallbackStories(query: string) {
  if (!query) return fallbackStories;
  
  const lowercaseQuery = query.toLowerCase();
  
  // Get stories that match the query
  const matchingStories = fallbackStories.filter(story => 
    story.title.toLowerCase().includes(lowercaseQuery) ||
    story.snippet.toLowerCase().includes(lowercaseQuery) ||
    story.storyType?.toLowerCase().includes(lowercaseQuery) ||
    story.publication.toLowerCase().includes(lowercaseQuery)
  );
  
  // Return matching stories or all fallback stories if none match
  return matchingStories.length > 0 ? matchingStories : fallbackStories;
}

// Helper function to get relevant fallback arcs based on query
function getRelevantFallbackArcs(query: string) {
  if (!query) return fallbackArcs;
  
  const lowercaseQuery = query.toLowerCase();
  
  // Get arcs that match the query
  const matchingArcs = fallbackArcs.filter(arc => 
    arc.title.toLowerCase().includes(lowercaseQuery) ||
    arc.summary.toLowerCase().includes(lowercaseQuery) ||
    arc.themes?.some(theme => theme.toLowerCase().includes(lowercaseQuery)) ||
    arc.storyType?.toLowerCase().includes(lowercaseQuery)
  );
  
  // Return matching arcs or all fallback arcs if none match
  return matchingArcs.length > 0 ? matchingArcs : fallbackArcs;
}

// Helper function to generate mock arcs based on stories
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
  
  if (lowerQuery.includes('crime') || lowerQuery.includes('murder') || lowerQuery.includes('killer')) {
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
  // If query is about serial killers, provide specific followups
  if (query.toLowerCase().includes('serial') && query.toLowerCase().includes('killer')) {
    return [
      `Explore the psychological profiles behind notorious serial killers`,
      `Find cases where serial killers evaded detection for decades`,
      `Discover unsolved serial killer cases that remain mysteries today`,
      `Uncover patterns connecting multiple serial killer investigations`,
      `Compare media coverage of different serial killer cases over time`
    ];
  }
  
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