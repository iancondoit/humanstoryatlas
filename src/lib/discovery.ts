import prisma from './db';
import { DiscoverySummary } from '@/types/discovery';

/**
 * Get discovery summary for a specific source and time range
 */
export async function getDiscoverySummary(
  source: string, 
  from: string, 
  to: string
): Promise<DiscoverySummary> {
  // Fetch stories based on source and date range
  const stories = await prisma.story.findMany({
    where: {
      sourceType: source,
      timestamp: {
        gte: new Date(from),
        lte: new Date(to),
      },
    },
    select: {
      id: true,
      title: true,
      processedText: true,
      rawText: true,
      timestamp: true,
      location: true,
    },
  });

  // Extract entities from stories text (people, places, organizations)
  const entitySummary = extractTopEntities(stories);
  
  // Extract top keywords from stories content
  const topKeywords = extractTopKeywords(stories);
  
  // Extract themes (placeholder for now)
  const topThemes = extractTopThemes(stories);
  
  // Select notable stories
  const notableStories = findNotableStories(stories);

  return {
    entity_summary: entitySummary,
    top_keywords: topKeywords,
    top_themes: topThemes,
    notable_stories: notableStories,
  };
}

/**
 * Extract and count named entities from stories
 * Uses a simple approach for now, could be enhanced with NLP libraries later
 */
function extractTopEntities(stories: any[]): {
  people: { name: string; count: number }[];
  places: { name: string; count: number }[];
  organizations: { name: string; count: number }[];
} {
  // Initialize counters for each entity type
  const counters = {
    people: {} as Record<string, number>,
    places: {} as Record<string, number>,
    organizations: {} as Record<string, number>,
  };
  
  // For now, use a very simple approach with known patterns
  // This should be replaced with proper NER in production
  for (const story of stories) {
    const text = story.processedText || story.rawText || '';
    
    // Extract potential people (Mr./Mrs./Dr. followed by capitalized words)
    const peopleMatches = text.match(/\b(Mr\.|Mrs\.|Dr\.|Ms\.|Prof\.) [A-Z][a-z]+ ([A-Z][a-z]+)?/g) || [];
    for (const person of peopleMatches) {
      counters.people[person] = (counters.people[person] || 0) + 1;
    }
    
    // Use location field if available, otherwise try to extract from text
    if (story.location) {
      counters.places[story.location] = (counters.places[story.location] || 0) + 1;
    }
    
    // Extract potential organizations (sequence of capitalized words)
    const orgMatches = text.match(/\b([A-Z][a-z]+ ){1,4}(Association|Company|Corporation|Department|Agency|Committee|Council|Board|Commission)/g) || [];
    for (const org of orgMatches) {
      counters.organizations[org] = (counters.organizations[org] || 0) + 1;
    }
  }

  // Convert to required format and take top 10 of each
  return {
    people: topN(counters.people, 10).map(([name, count]) => ({ name, count })),
    places: topN(counters.places, 10).map(([name, count]) => ({ name, count })),
    organizations: topN(counters.organizations, 10).map(([name, count]) => ({ name, count })),
  };
}

/**
 * Extract and count keywords from stories
 */
function extractTopKeywords(stories: any[]): { term: string; count: number }[] {
  const frequency: Record<string, number> = {};
  const stopwords = new Set([
    'the', 'and', 'a', 'an', 'in', 'on', 'at', 'from', 'to', 'of', 'for',
    'with', 'by', 'about', 'as', 'that', 'this', 'was', 'were', 'is', 'are',
    'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'but',
    'or', 'if', 'then', 'else', 'when', 'where', 'why', 'how', 'all', 'any',
    'both', 'each', 'few', 'more', 'most', 'some', 'other', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can',
    'will', 'just', 'should', 'now', 'also'
  ]);

  for (const story of stories) {
    const text = story.processedText || story.rawText || '';
    
    // Split into words, convert to lowercase, and filter short words and stopwords
    const words = text.toLowerCase().split(/\W+/).filter((word: string) => 
      word.length > 3 && !stopwords.has(word) && !(/^\d+$/.test(word))
    );
    
    // Count word frequencies
    for (const word of words) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  }

  // Convert to required format and return top 10
  return topN(frequency, 10).map(([term, count]) => ({ term, count }));
}

/**
 * Extract themes from stories (placeholder implementation)
 */
function extractTopThemes(stories: any[]): string[] {
  // This would ideally use topic modeling or clustering
  // For now, return a simple placeholder based on frequent terms
  const keywords = extractTopKeywords(stories);
  
  // Group similar keywords into themes (very simplified approach)
  const themes = new Set<string>();
  
  // Map common keywords to themes
  const keywordToThemeMap: Record<string, string> = {
    'police': 'Crime and Public Safety',
    'crime': 'Crime and Public Safety',
    'criminal': 'Crime and Public Safety',
    'fire': 'Emergencies and Disasters',
    'disaster': 'Emergencies and Disasters',
    'election': 'Politics and Elections',
    'vote': 'Politics and Elections',
    'political': 'Politics and Elections',
    'government': 'Politics and Elections',
    'school': 'Education',
    'student': 'Education',
    'teacher': 'Education',
    'business': 'Business and Economy',
    'economic': 'Business and Economy',
    'economy': 'Business and Economy',
    'sport': 'Sports and Recreation',
    'team': 'Sports and Recreation',
    'game': 'Sports and Recreation',
    'health': 'Health and Medicine',
    'medical': 'Health and Medicine',
    'hospital': 'Health and Medicine',
  };
  
  // Check if any of our top keywords match known themes
  for (const { term } of keywords) {
    if (keywordToThemeMap[term]) {
      themes.add(keywordToThemeMap[term]);
    }
  }
  
  // Return themes, or default categories if none detected
  return themes.size > 0 
    ? Array.from(themes) 
    : ['Local News', 'Community Events'];
}

/**
 * Select notable stories from the dataset
 */
function findNotableStories(stories: any[]): {
  id: string;
  title: string;
  summary: string;
  date: string;
}[] {
  // Sort stories by length (longer stories may be more significant)
  const sortedStories = [...stories].sort((a, b) => {
    const aLength = (a.processedText || a.rawText || '').length;
    const bLength = (b.processedText || b.rawText || '').length;
    return bLength - aLength;
  });
  
  // Take top 3-5 stories
  const selectedStories = sortedStories.slice(0, Math.min(5, sortedStories.length));
  
  // Format them for the response
  return selectedStories.map(story => ({
    id: story.id,
    title: story.title,
    // Create a summary from the first 2-3 sentences
    summary: createSummary(story.processedText || story.rawText || ''),
    date: story.timestamp.toISOString().split('T')[0], // Format as YYYY-MM-DD
  }));
}

/**
 * Create a short summary from the text
 */
function createSummary(text: string): string {
  // Split by sentence endings and take first 2-3 sentences
  const sentences = text.split(/(?<=[.!?])\s+/);
  const summary = sentences.slice(0, 2).join(' ');
  
  // Truncate if still too long
  return summary.length > 150 ? summary.substring(0, 147) + '...' : summary;
}

/**
 * Helper function to get top N items from a frequency map
 */
function topN<T extends string>(
  obj: Record<T, number>,
  n = 10
): Array<[T, number]> {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n) as Array<[T, number]>;
} 