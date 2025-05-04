// Mock stories data
export const mockStories = [
  {
    id: "story1",
    title: "The Forgotten Oil Crisis of 1979",
    publication: "Washington Post",
    date: "1979-06-15",
    snippet: "An analysis of the second major oil crisis that shook America as OPEC imposed production cuts and prices soared worldwide.",
    relevanceScore: 0.92
  },
  {
    id: "story2",
    title: "Behind the Scenes: The OPEC Decision",
    publication: "New York Times",
    date: "1979-07-02",
    snippet: "Exclusive reporting on the closed-door meetings that led to oil production cuts and spiraling global energy prices.",
    relevanceScore: 0.87
  },
  {
    id: "story3",
    title: "Gas Lines and Public Fury",
    publication: "Chicago Tribune",
    date: "1979-06-28",
    snippet: "Americans waited for hours in gas lines as tensions rose at stations across the country. Reports of violence increased.",
    relevanceScore: 0.85
  },
  {
    id: "story4",
    title: "Carter's Energy Address to the Nation",
    publication: "CBS News",
    date: "1979-07-15",
    snippet: "President Carter addressed the nation on the energy crisis, calling it the 'moral equivalent of war' and proposing new measures.",
    relevanceScore: 0.83
  },
  {
    id: "story5",
    title: "Economic Impact of Rising Oil Prices",
    publication: "Wall Street Journal",
    date: "1979-08-03",
    snippet: "Analysts predict severe economic consequences as oil prices continue to climb and impact multiple sectors of the economy.",
    relevanceScore: 0.81
  },
  {
    id: "story6",
    title: "Watergate Scandal Deepens",
    publication: "Washington Post",
    date: "1973-07-16",
    snippet: "New evidence emerges linking the Nixon administration directly to the Watergate break-in and subsequent cover-up attempts.",
    relevanceScore: 0.90
  },
  {
    id: "story7",
    title: "Apollo 11 Mission Successfully Lands on Moon",
    publication: "New York Times",
    date: "1969-07-20",
    snippet: "Neil Armstrong becomes the first human to set foot on the lunar surface, calling it 'one small step for man, one giant leap for mankind.'",
    relevanceScore: 0.95
  },
  {
    id: "story8",
    title: "The Vietnam War: Peace Talks Stall",
    publication: "Chicago Tribune",
    date: "1972-12-14",
    snippet: "Peace negotiations break down as both sides fail to reach agreement on key terms for ending the prolonged conflict in Southeast Asia.",
    relevanceScore: 0.78
  }
];

// Mock arcs data
export const mockArcs = [
  {
    id: "arc1",
    title: "Energy Crisis of the 1970s",
    storyCount: 5,
    timespan: "1973-1979",
    summary: "A series of events surrounding global oil shortages, price increases, and political tensions in the Middle East that shaped energy policy for decades.",
    themes: ["Energy Policy", "Global Politics", "Economics"]
  },
  {
    id: "arc2",
    title: "Watergate Scandal and Aftermath",
    storyCount: 12,
    timespan: "1972-1974",
    summary: "The political scandal that began with the break-in at the Democratic National Committee headquarters and ultimately led to President Nixon's resignation.",
    themes: ["Political Scandal", "Presidential Power", "Journalism"]
  },
  {
    id: "arc3",
    title: "Space Race Achievements",
    storyCount: 8,
    timespan: "1969-1972",
    summary: "The culmination of the Space Race between the United States and Soviet Union, highlighting America's lunar landing missions.",
    themes: ["Space Exploration", "Cold War", "Technology"]
  }
];

// Suggested follow-ups
export const mockFollowups = [
  "How did the oil crisis affect everyday Americans?",
  "Find connections between oil crisis and modern energy policies",
  "Explore political scandals of the 1970s",
  "What happened after the moon landing?"
];

// Function to filter stories based on prompt
export function filterStories(prompt: string) {
  if (!prompt || prompt.trim() === '') {
    return {
      stories: mockStories.slice(0, 4),
      arcs: [],
      suggestedFollowups: mockFollowups
    };
  }
  
  const lowercasePrompt = prompt.toLowerCase();
  
  // Filter stories that match the prompt
  const filteredStories = mockStories.filter(story => 
    story.title.toLowerCase().includes(lowercasePrompt) ||
    story.snippet.toLowerCase().includes(lowercasePrompt)
  );
  
  // Determine which arcs to show based on the prompt
  let relevantArcs = [];
  if (lowercasePrompt.includes('oil') || lowercasePrompt.includes('energy') || lowercasePrompt.includes('crisis')) {
    relevantArcs.push(mockArcs[0]);
  }
  if (lowercasePrompt.includes('watergate') || lowercasePrompt.includes('nixon') || lowercasePrompt.includes('scandal')) {
    relevantArcs.push(mockArcs[1]);
  }
  if (lowercasePrompt.includes('space') || lowercasePrompt.includes('moon') || lowercasePrompt.includes('apollo')) {
    relevantArcs.push(mockArcs[2]);
  }
  
  // Generate custom follow-ups based on the prompt
  const customFollowups = [
    `More about ${prompt}`,
    `Find historical context for ${prompt}`,
    `Explore related events to ${prompt}`
  ];
  
  return {
    stories: filteredStories.slice(0, 6),
    arcs: relevantArcs,
    suggestedFollowups: customFollowups
  };
} 