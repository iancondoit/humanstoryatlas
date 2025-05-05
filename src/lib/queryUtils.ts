import { FilterChipType } from '@/components/FilterChip';
import { EntityType } from '@/types/entity';

export interface QueryFilter {
  type: FilterChipType;
  value: string;
  label?: string;
  entityType?: EntityType;
}

/**
 * Builds a query string from a set of filters
 */
export function buildQueryString(filters: QueryFilter[]): string {
  if (filters.length === 0) {
    return '';
  }

  // Start with a basic query
  let query = 'Find stories';
  
  // Process entity filters
  const entityFilters = filters.filter(f => f.type === 'entity');
  if (entityFilters.length > 0) {
    query += ' about';
    entityFilters.forEach((filter, index) => {
      if (index > 0) {
        query += index === entityFilters.length - 1 ? ' and' : ',';
      }
      query += ` ${filter.value}`;
    });
  }
  
  // Process keyword filters
  const keywordFilters = filters.filter(f => f.type === 'keyword');
  if (keywordFilters.length > 0) {
    query += ' containing';
    keywordFilters.forEach((filter, index) => {
      if (index > 0) {
        query += index === keywordFilters.length - 1 ? ' and' : ',';
      }
      query += ` "${filter.value}"`;
    });
  }
  
  // Process theme filters
  const themeFilters = filters.filter(f => f.type === 'theme');
  if (themeFilters.length > 0) {
    query += ' related to';
    themeFilters.forEach((filter, index) => {
      if (index > 0) {
        query += index === themeFilters.length - 1 ? ' and' : ',';
      }
      query += ` ${filter.value}`;
    });
  }
  
  // Process date filters
  const dateFilters = filters.filter(f => f.type === 'date');
  if (dateFilters.length > 0) {
    const dateFilter = dateFilters[0]; // Usually we'd only have one date range
    query += ` from ${dateFilter.value}`;
  }
  
  return query;
}

/**
 * Converts filters to API parameters
 */
export function filtersToApiParams(filters: QueryFilter[]): Record<string, string> {
  const params: Record<string, string> = {};
  
  // Extract entity, keyword and theme values for query
  const entities = filters
    .filter(f => f.type === 'entity')
    .map(f => f.value);
  
  const keywords = filters
    .filter(f => f.type === 'keyword')
    .map(f => f.value);
  
  const themes = filters
    .filter(f => f.type === 'theme')
    .map(f => f.value);
  
  // Combine them into a query parameter
  const queryTerms = [...entities, ...keywords, ...themes];
  if (queryTerms.length > 0) {
    params.query = queryTerms.join(' ');
  }
  
  // Handle date ranges
  const dateFilter = filters.find(f => f.type === 'date');
  if (dateFilter && dateFilter.value) {
    const [startDate, endDate] = dateFilter.value.split(' to ');
    if (startDate) {
      params.startDate = startDate;
    }
    if (endDate) {
      params.endDate = endDate;
    }
  }
  
  return params;
}

/**
 * Generate suggested follow-up queries based on initial results
 */
export function generateSuggestedQueries(
  filters: QueryFilter[],
  recentResults?: any[]
): string[] {
  // For now, return static suggestions based on filter types
  const hasPerson = filters.some(f => f.type === 'entity' && f.entityType === 'person');
  const hasPlace = filters.some(f => f.type === 'entity' && f.entityType === 'place');
  const hasOrg = filters.some(f => f.type === 'entity' && f.entityType === 'organization');
  const hasKeywords = filters.some(f => f.type === 'keyword');
  
  const suggestions: string[] = [];
  
  if (hasPerson) {
    suggestions.push('Show other people mentioned with this person');
    suggestions.push('Find stories where this person is the main subject');
  }
  
  if (hasPlace) {
    suggestions.push('Show other major events at this location');
    suggestions.push('Find related locations mentioned in these stories');
  }
  
  if (hasOrg) {
    suggestions.push('Show key figures in this organization');
    suggestions.push('Find related organizations mentioned in these stories');
  }
  
  if (hasKeywords) {
    suggestions.push('Find more stories with similar themes');
    suggestions.push('Show entities most associated with these keywords');
  }
  
  // Add generic queries if we don't have enough
  while (suggestions.length < 3) {
    suggestions.push(
      'Find the most relevant stories',
      'Show stories in chronological order',
      'Identify major narrative shifts'
    );
  }
  
  // Return just the top few suggestions
  return suggestions.slice(0, 3);
} 