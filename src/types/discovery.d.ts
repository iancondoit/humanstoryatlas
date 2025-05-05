export interface DiscoverySummary {
  entity_summary: {
    people: { name: string, count: number }[],
    places: { name: string, count: number }[],
    organizations: { name: string, count: number }[],
  },
  top_keywords: { term: string, count: number }[],
  top_themes: string[],
  notable_stories: {
    id: string,
    title: string,
    summary: string,
    date: string,
  }[]
} 