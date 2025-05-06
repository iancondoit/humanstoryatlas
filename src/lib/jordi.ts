/**
 * Utility functions for interacting with Jordi, the narrative research assistant
 */

// Types for Jordi's responses
export interface JordiMessage {
  role: 'system' | 'assistant' | 'user';
  content: string;
}

export interface JordiContext {
  count: number;
  dateRange: string;
  topPeople: string[];
  themes: string[];
}

export interface StoryPitch {
  id?: string;
  title: string;
  tagline: string;
  stories: Array<{
    title: string;
    snippet: string;
  }>;
  potentialFormat: string;
  comparableTo?: string;
}

export interface JordiResponse {
  message: JordiMessage;
  context: JordiContext;
  pitches?: StoryPitch[];
  error?: string;
}

/**
 * Send a message to Jordi and get a response
 */
export async function sendMessageToJordi(
  publication: string,
  startDate: string,
  endDate: string,
  messages: JordiMessage[]
): Promise<JordiResponse> {
  try {
    // Call the Jordi API
    const response = await fetch('/api/jordi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publication,
        startDate,
        endDate,
        messages,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending message to Jordi:', error);
    return {
      message: {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
      },
      context: {
        count: 0,
        dateRange: '',
        topPeople: [],
        themes: [],
      },
      pitches: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
} 