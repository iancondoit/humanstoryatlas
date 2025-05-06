import { Entity, EntityDetails, EntityType } from '@/types/entity';
import prisma from './db';

/**
 * Get detailed information about an entity including associated stories and co-occurring entities
 */
export async function getEntityDetails(
  name: string,
  type: EntityType,
  source: string,
  startDate: string,
  endDate: string
): Promise<EntityDetails | null> {
  try {
    // For MVP, we'll mock this data
    // In the future, this would query the database for real entity data
    
    // Mock stories this entity appears in
    const associatedStories = await getMockAssociatedStories(name, source, startDate, endDate);
    
    // Mock entities that co-occur with this one
    const coOccurringEntities = getMockCoOccurringEntities(name, type);
    
    // Mock keywords related to this entity
    const relatedKeywords = getMockRelatedKeywords(type);
    
    // Calculate first and last seen dates (using mock data for now)
    const { firstSeen, lastSeen } = getMockEntityDateRange(name, source);
    
    return {
      name,
      type,
      count: Math.floor(Math.random() * 10) + 5, // Mock count between 5-15
      firstSeen,
      lastSeen,
      associatedStories,
      coOccurringEntities,
      relatedKeywords
    };
    
  } catch (error) {
    console.error('Error fetching entity details:', error);
    return null;
  }
}

// Mock function to simulate fetching stories associated with an entity
async function getMockAssociatedStories(
  entityName: string,
  source: string,
  startDate: string,
  endDate: string
) {
  // For a real implementation, this would query the database
  // For now, return mock data
  
  // Try to fetch a few real stories from the database
  let realStories = [];
  try {
    realStories = await prisma.story.findMany({
      where: {
        sourceType: source,
        timestamp: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      select: {
        id: true,
        title: true,
        timestamp: true,
      },
      take: 3,
    });
  } catch (e) {
    console.log('Could not fetch real stories, using mocks', e);
  }
  
  // If we got real stories, format them
  if (realStories.length > 0) {
    return realStories.map((story: { id: string; title: string; timestamp: Date }) => ({
      id: story.id,
      title: story.title,
      date: story.timestamp.toISOString().split('T')[0]
    }));
  }
  
  // Otherwise use mock data
  return [
    { id: '1', title: `${entityName} featured in local event`, date: '1977-08-07' },
    { id: '2', title: `Community responds to ${entityName}`, date: '1977-08-09' },
  ];
}

// Mock function to simulate co-occurring entities
function getMockCoOccurringEntities(entityName: string, entityType: EntityType) {
  // Generate different co-occurring entities based on the type
  const mockEntities: Record<EntityType, Entity[]> = {
    'person': [
      { name: 'John Doe', type: 'person', count: 5 },
      { name: 'City Council', type: 'organization', count: 3 },
      { name: 'Smith Johnson', type: 'person', count: 2 }
    ],
    'place': [
      { name: 'City Hall', type: 'place', count: 4 },
      { name: 'Mayor Thompson', type: 'person', count: 3 },
      { name: 'Downtown District', type: 'place', count: 2 }
    ],
    'organization': [
      { name: 'CEO Jane Smith', type: 'person', count: 6 },
      { name: 'Local Government', type: 'organization', count: 4 },
      { name: 'Main Street', type: 'place', count: 2 }
    ]
  };
  
  return mockEntities[entityType];
}

// Mock function to simulate related keywords
function getMockRelatedKeywords(entityType: EntityType) {
  // Generate different keywords based on entity type
  const mockKeywords: Record<EntityType, { term: string, count: number }[]> = {
    'person': [
      { term: 'election', count: 7 },
      { term: 'community', count: 5 },
      { term: 'statement', count: 4 }
    ],
    'place': [
      { term: 'development', count: 8 },
      { term: 'meeting', count: 6 },
      { term: 'construction', count: 3 }
    ],
    'organization': [
      { term: 'funding', count: 7 },
      { term: 'lawsuit', count: 4 },
      { term: 'announcement', count: 3 }
    ]
  };
  
  return mockKeywords[entityType];
}

// Mock function for entity date range
function getMockEntityDateRange(entityName: string, source: string) {
  // In a real implementation, this would query the database
  // For now, create mock dates within a reasonable range
  
  // Create dates from a few months before current date
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  return {
    firstSeen: startDate.toISOString().split('T')[0],
    lastSeen: endDate.toISOString().split('T')[0]
  };
} 