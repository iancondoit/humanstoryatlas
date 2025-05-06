export type EntityType = 'person' | 'place' | 'organization';

export interface Entity {
  id?: string;
  name: string;
  type: EntityType;
  count: number;
  firstSeen?: string; // Date string
  lastSeen?: string;  // Date string
}

export interface EntityDetails extends Entity {
  associatedStories: {
    id: string;
    title: string;
    date: string;
    summary?: string;
  }[];
  coOccurringEntities: Entity[];
  relatedKeywords: { term: string; count: number }[];
} 