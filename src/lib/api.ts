// API client functions for fetching data from the backend

/**
 * Fetch stories from the API
 */
export async function fetchStories(params: {
  query?: string;
  publication?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  const { query, publication, startDate, endDate, limit } = params;
  
  // Build the query string
  const queryParams = new URLSearchParams();
  if (query) queryParams.append('query', query);
  if (publication) queryParams.append('publication', publication);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (limit) queryParams.append('limit', limit.toString());
  
  try {
    const response = await fetch(`/api/stories?${queryParams.toString()}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch stories');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching stories:', error);
    throw error;
  }
}

// Types
export interface Story {
  id: string;
  title: string;
  publication: string;
  date: string;
  snippet: string;
  relevanceScore: number;
  storyType?: string;
}

export interface Arc {
  id: string;
  title: string;
  storyCount: number;
  timespan: string;
  summary: string;
  themes?: string[];
  storyType?: string;
}

export interface SearchResults {
  stories: Story[];
  arcs: Arc[];
  suggestedFollowups: string[];
} 