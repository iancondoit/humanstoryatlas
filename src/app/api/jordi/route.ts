import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

/**
 * Jordi API Route
 * 
 * NOTE: This file contains MOCK DATA that should be replaced with real data in production.
 * All mock data is clearly marked with [MOCK] or [MOCK DATA] prefixes.
 * These mock examples should NOT be used in a real database - they are for development/testing only.
 */

// Initialize Prisma client for database access
const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define types for our context and messages
interface DatasetContext {
  count: number;
  dateRange: string;
  topPeople: string[];
  themes: string[];
}

// Example dataset context with proper typing - fallback if DB query fails
const fallbackDatasetContext: Record<string, DatasetContext> = {
  'San Antonio Express-News': {
    count: 218,
    dateRange: 'August 1, 1977 to August 14, 1977 [MOCK DATA]',
    topPeople: ['[MOCK] Maria Gonzalez', '[MOCK] Joe Luna', '[MOCK] Mayor McAllister'],
    themes: ['[MOCK] labor strikes', '[MOCK] police investigations', '[MOCK] education reform', '[MOCK] housing policy']
  },
  'Boston Globe': {
    count: 175,
    dateRange: 'January 10, 1974 to January 25, 1974 [MOCK DATA]',
    topPeople: ['[MOCK] Senator Kennedy', '[MOCK] Mayor White', '[MOCK] Governor Sargent'],
    themes: ['[MOCK] energy crisis', '[MOCK] political scandal', '[MOCK] economic recession', '[MOCK] crime wave']
  }
};

// Jordi's system prompt for documentary pitch generation
const generateSystemPrompt = (publication: string, dateRange: string, stories: any[]) => {
  return `
You are Jordi, an AI narrative research assistant for the Human Story Atlas platform.
Your purpose is to help media executives discover compelling documentary/series opportunities in historical news archives.

ROLE & VOICE:
- You are professional but conversational
- You focus on narrative potential, not just historical facts
- You understand what makes stories appealing to modern audiences
- You are enthusiastic about finding hidden gems in the archives

CURRENT DATASET:
- Publication: ${publication}
- Date Range: ${dateRange}
- Total Stories: ${stories.length}

YOUR TASK:
Based on the stories provided, identify 3-5 compelling narrative threads that could be developed into documentaries or series for streaming platforms like Netflix, HBO, etc.

IMPORTANT: Prioritize the most salacious, scandalous, controversial, and provocative stories first. Look for:
- Scandals, corruption, and cover-ups
- Shocking crimes and unsolved mysteries
- Stories with moral ambiguity or ethical dilemmas
- Contentious social issues that generated significant debate
- Sensational events that would captivate modern audiences

For each narrative thread:
1. Create a compelling title
2. Write a one-sentence tagline that hooks the audience
3. Identify 2-3 key stories that form part of this narrative
4. Suggest a format (feature doc, limited series, etc.)
5. Reference comparable successful titles ("In the spirit of...")

FORMAT YOUR RESPONSE AS JSON with this structure:
{
  "welcomeMessage": "A brief personalized greeting",
  "pitches": [
    {
      "title": "Compelling Title",
      "tagline": "One-line hook",
      "stories": [
        {
          "title": "Story Headline",
          "snippet": "Compelling angle on this story"
        }
      ],
      "potentialFormat": "Suggested format",
      "comparableTo": "Similar successful titles"
    }
  ]
}

IMPORTANT GUIDELINES:
- Focus on surprising connections and forgotten narratives
- Emphasize human drama, conflict, and emotion
- Highlight the most sensational and provocative aspects of each story
- Consider themes that resonate with contemporary viewers
- Suggest formats appropriate to the narrative scope
`;
};

// Helper function to fetch stories from the database
async function fetchStoriesFromDatabase(publication: string, startDate?: string, endDate?: string) {
  try {
    // Build a query with optional date filters
    const where: any = {};
    
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
    
    // Fetch stories from the database
    const stories = await prisma.story.findMany({
      where,
      take: 100, // Increased from 50 to 100 for better story selection
      orderBy: {
        timestamp: 'desc',
      },
      select: {
        id: true,
        title: true,
        rawText: true, 
        processedText: true,
        timestamp: true,
        sourceType: true,
        location: true
      }
    });
    
    return stories;
  } catch (error) {
    console.error('Error fetching stories from database:', error);
    return [];
  }
}

// Helper function to extract context from stories
function extractContextFromStories(stories: any[], publication: string): DatasetContext {
  // In a real implementation, we'd use NLP to extract entities and themes
  // For now, we'll return a simplified version based on the fallback
  
  // If we have a fallback for this publication, use it
  if (publication in fallbackDatasetContext) {
    return fallbackDatasetContext[publication];
  }
  
  // Otherwise create a basic context
  let startDate = new Date();
  let endDate = new Date(0); // Jan 1, 1970
  
  // Extract date range
  stories.forEach(story => {
    const storyDate = new Date(story.timestamp);
    if (storyDate < startDate) startDate = storyDate;
    if (storyDate > endDate) endDate = storyDate;
  });
  
  return {
    count: stories.length,
    dateRange: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
    topPeople: [],
    themes: []
  };
}

// Main API handler for Jordi
export async function POST(request: Request) {
  try {
    const { publication, startDate, endDate, messages } = await request.json() as { 
      publication: string; 
      startDate?: string; 
      endDate?: string; 
      messages?: Array<{ role: string; content: string }> 
    };
    
    // Fetch relevant stories from the database
    const stories = await fetchStoriesFromDatabase(publication, startDate, endDate);
    
    // If no stories found, use fallback data
    if (stories.length === 0) {
      console.log('No stories found, using fallback data');
      return NextResponse.json({
        message: {
          role: 'assistant',
          content: `I'm Jordi, your narrative research assistant. I'm showing you [MOCK DATA] for ${publication || 'news archives'} since no real stories were found. In production, you'll see actual content from your archives.`
        },
        context: publication && publication in fallbackDatasetContext 
          ? fallbackDatasetContext[publication] 
          : { count: 0, dateRange: '[MOCK DATA] No date range available', topPeople: [], themes: [] }
      });
    }
    
    // For existing conversations, use the full message history
    if (messages && messages.length > 0) {
      // Get the user's latest question
      const userMessage = messages.filter(m => m.role === 'user').pop();
      
      if (!userMessage) {
        throw new Error('No user message found');
      }
      
      // Create a system prompt for this query
      const dateRange = startDate && endDate 
        ? `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}` 
        : 'unknown date range';
      
      // Format messages for OpenAI API
      const apiMessages = [
        { 
          role: 'system', 
          content: generateSystemPrompt(publication, dateRange, stories)
        },
        ...messages.map(m => ({ 
          role: m.role === 'assistant' ? 'assistant' : 'user', 
          content: m.content 
        }))
      ];
      
      // Call OpenAI to generate a response
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: apiMessages as any,
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      });
      
      // Parse the response
      const responseContent = completion.choices[0].message.content;
      let formattedResponse;
      
      try {
        // Parse JSON response 
        formattedResponse = JSON.parse(responseContent || '{}');
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        formattedResponse = { 
          welcomeMessage: "I had trouble processing that request.",
          pitches: []
        };
      }
      
      // Extract context metadata
      const context = extractContextFromStories(stories, publication);
      
      // Return the response
      return NextResponse.json({
        message: {
          role: 'assistant',
          content: formattedResponse.welcomeMessage || "I've analyzed the archives and found some interesting narratives."
        },
        pitches: formattedResponse.pitches || [],
        context
      });
    } else {
      // First load - generate initial pitches
      const dateRange = startDate && endDate 
        ? `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}` 
        : 'unknown date range';
      
      // Call OpenAI to generate initial pitches
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: 'system', 
            content: generateSystemPrompt(publication, dateRange, stories)
          },
          { 
            role: 'user', 
            content: `I'm looking for the most shocking and provocative documentary ideas from the ${publication} archive. Focus on scandals, controversies, and sensational stories that would captivate modern audiences. What are the most compelling and salacious narrative threads you can find?` 
          }
        ],
        temperature: 0.9,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      });
      
      // Parse the response
      const responseContent = completion.choices[0].message.content;
      let formattedResponse;
      
      try {
        // Parse JSON response 
        formattedResponse = JSON.parse(responseContent || '{}');
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        formattedResponse = { 
          welcomeMessage: "I've analyzed the archives but encountered an issue processing the results.",
          pitches: []
        };
      }
      
      // Extract context metadata
      const context = extractContextFromStories(stories, publication);
      
      // Return the response
      return NextResponse.json({
        message: {
          role: 'assistant',
          content: formattedResponse.welcomeMessage || `I've analyzed the ${publication} archive and found some compelling narratives.`
        },
        pitches: formattedResponse.pitches || [],
        context
      });
    }
  } catch (error) {
    console.error('Error in Jordi API:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      message: {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.'
      },
      pitches: []
    }, { status: 500 });
  }
} 