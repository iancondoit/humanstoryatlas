import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { OpenAI } from 'openai';

// Initialize OpenAI client with fallback for missing API key
let openai: OpenAI | null = null;

try {
  // Only initialize if API key is available
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } else {
    console.warn('OPENAI_API_KEY environment variable not found. Vector search will be unavailable.');
  }
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
}

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates a vector embedding for search using OpenAI API
 */
export async function createSearchEmbedding(query: string) {
  try {
    // Skip if OpenAI client is not available
    if (!openai) {
      console.warn('OpenAI client not initialized. Vector embeddings unavailable.');
      return null;
    }
    
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

/**
 * Serializes data to handle BigInt values
 */
export function serializeData(data: any): any {
  return JSON.parse(
    JSON.stringify(data, (_, value) => 
      typeof value === 'bigint' ? Number(value) : value
    )
  );
}

/**
 * Truncates text to a specified max length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Formats a date for display
 */
export function formatDate(dateString: string | null) {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a timestamp for display
 */
export function formatTimestamp(timestamp: string | null) {
  if (!timestamp) return 'Never';
  
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats a date range
 */
export function formatDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate || !endDate) return 'No data available';
  
  const startYear = new Date(startDate).getFullYear();
  const endYear = new Date(endDate).getFullYear();
  
  return `${startYear} – ${endYear}`;
} 