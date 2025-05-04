// Enhanced mock stories data with richer narrative potential
export const mockStories = [
  {
    id: "story1",
    title: "The Forgotten Oil Crisis of 1979",
    publication: "Washington Post",
    date: "1979-06-15",
    snippet: "An analysis of the second major oil crisis that shook America as OPEC imposed production cuts and prices soared worldwide. Local communities formed carpooling networks as gas stations imposed strict rationing.",
    relevanceScore: 0.92,
    storyType: "Crisis Narrative"
  },
  {
    id: "story2",
    title: "Behind the Scenes: The OPEC Decision",
    publication: "New York Times",
    date: "1979-07-02",
    snippet: "Exclusive reporting on the closed-door meetings that led to oil production cuts and spiraling global energy prices. Sources reveal personal conflicts between ministers that shaped policy decisions.",
    relevanceScore: 0.87,
    storyType: "Political Thriller"
  },
  {
    id: "story3",
    title: "Gas Lines and Public Fury",
    publication: "Chicago Tribune",
    date: "1979-06-28",
    snippet: "Americans waited for hours in gas lines as tensions rose at stations across the country. Reports of violence increased, with two shootings over alleged line-cutting in Detroit and Cleveland.",
    relevanceScore: 0.85,
    storyType: "Social Chronicle"
  },
  {
    id: "story4",
    title: "Carter's Energy Address to the Nation",
    publication: "CBS News",
    date: "1979-07-15",
    snippet: "President Carter addressed the nation on the energy crisis, calling it the 'moral equivalent of war' and proposing new measures. Behind the speech was a president struggling with plummeting approval ratings and staffing conflicts.",
    relevanceScore: 0.83,
    storyType: "Political Drama"
  },
  {
    id: "story5",
    title: "Economic Impact of Rising Oil Prices",
    publication: "Wall Street Journal",
    date: "1979-08-03",
    snippet: "Analysts predict severe economic consequences as oil prices continue to climb and impact multiple sectors of the economy. Small businesses across the Midwest reported imminent bankruptcies related to transportation costs.",
    relevanceScore: 0.81,
    storyType: "Economic Narrative"
  },
  {
    id: "story6",
    title: "Watergate Scandal Deepens",
    publication: "Washington Post",
    date: "1973-07-16",
    snippet: "New evidence emerges linking the Nixon administration directly to the Watergate break-in and subsequent cover-up attempts. Junior staffers found themselves making life-altering decisions about loyalty versus truth.",
    relevanceScore: 0.90,
    storyType: "Political Thriller"
  },
  {
    id: "story7",
    title: "Apollo 11 Mission Successfully Lands on Moon",
    publication: "New York Times",
    date: "1969-07-20",
    snippet: "Neil Armstrong becomes the first human to set foot on the lunar surface, calling it 'one small step for man, one giant leap for mankind.' Behind the scenes, mission control faced critical computer alarms that nearly aborted the landing.",
    relevanceScore: 0.95,
    storyType: "Technological Milestone"
  },
  {
    id: "story8",
    title: "The Vietnam War: Peace Talks Stall",
    publication: "Chicago Tribune",
    date: "1972-12-14",
    snippet: "Peace negotiations break down as both sides fail to reach agreement on key terms for ending the prolonged conflict in Southeast Asia. Families of POWs organized unprecedented pressure campaigns on Washington officials.",
    relevanceScore: 0.78,
    storyType: "War Narrative"
  },
  {
    id: "story9",
    title: "Small Town Coach Faces Ethics Investigation",
    publication: "Toledo Blade",
    date: "1977-09-08",
    snippet: "Beloved high school basketball coach Jim Harrick faces allegations of recruitment violations and improper benefits to players. The community is divided between those demanding accountability and others defending a local hero.",
    relevanceScore: 0.82,
    storyType: "Sports Scandal"
  },
  {
    id: "story10",
    title: "Women's Strike for Equality Gains Momentum",
    publication: "Washington Post",
    date: "1970-08-26",
    snippet: "Fifty years after women gained the right to vote, a nationwide strike draws attention to continued gender inequality in the workplace and society. Local organizers faced threats but refused to back down.",
    relevanceScore: 0.88,
    storyType: "Social Movement"
  }
];

// Enhanced mock arcs data with more narrative framing
export const mockArcs = [
  {
    id: "arc1",
    title: "American Anxiety: The Energy Crisis Reshapes Society",
    storyCount: 5,
    timespan: "1973-1979",
    summary: "A forgotten HBO miniseries waiting to happen — everyday Americans caught in geopolitical crossfire as OPEC decisions reshape daily life. Gas stations become theaters of conflict, politicians scramble for solutions, and communities invent new ways to survive.",
    themes: ["Resource Scarcity", "Global Politics", "Community Resilience", "Policy Failure"],
    storyType: "Resource Crisis with Human Fallout"
  },
  {
    id: "arc2",
    title: "The Machinery of Power: Watergate's Hidden Web",
    storyCount: 12,
    timespan: "1972-1974",
    summary: "Not just about Nixon, but a multi-perspective narrative of minor players making moral choices that collapsed an administration. The real drama wasn't in the Oval Office, but in the small moments when ordinary people chose truth over loyalty.",
    themes: ["Political Corruption", "Moral Choices", "Institutional Failure", "Media Power"],
    storyType: "Political Thriller with Cascading Consequences"
  },
  {
    id: "arc3",
    title: "Hidden Figures: The Unseen Heroes of Apollo",
    storyCount: 8,
    timespan: "1969-1972",
    summary: "Beyond the flag-planting heroism lies a more complex narrative about the invisible architecture of achievement. While astronauts became household names, hundreds of engineers, mathematicians and support staff — many from underrepresented groups — made the impossible possible.",
    themes: ["Space Exploration", "Unsung Heroes", "Technological Innovation", "Cold War Competition"],
    storyType: "Technological Triumph with Hidden Heroes"
  },
  {
    id: "arc4",
    title: "Small Town, Big Scandal: The Coach Harrick Story",
    storyCount: 6,
    timespan: "1977-1978",
    summary: "A 30-for-30 documentary waiting to be made about a charismatic high school basketball coach whose winning methods come under scrutiny. What begins as a local ethics investigation exposes deeper questions about sports, community values, and what we're willing to overlook for victory.",
    themes: ["Sports Ethics", "Community Division", "Hero Worship", "Accountability"],
    storyType: "Sports Narrative with Unexpected Complexity"
  },
  {
    id: "arc5",
    title: "The Second Wave: Women's Equality Movement Gains Ground",
    storyCount: 10,
    timespan: "1970-1973",
    summary: "A powerful narrative of women who transformed personal frustration into political action. Workplaces, universities and city halls became battlegrounds where organizers faced threats and ridicule while fighting for fundamental changes that would reshape American society.",
    themes: ["Gender Equality", "Grassroots Activism", "Institutional Resistance", "Social Change"],
    storyType: "Social Movement with Personal Stakes"
  }
];

// Enhanced suggested follow-ups with more narrative framing
export const mockFollowups = [
  "Explore the forgotten heroes of the oil crisis response",
  "Uncover the human stories behind the energy policy decisions",
  "Find the untold narrative threads connecting Watergate to modern scandals",
  "Trace the forgotten women who made the moon landing possible"
];

// Improved function to filter stories and create narrative-focused results
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
    story.snippet.toLowerCase().includes(lowercasePrompt) ||
    (story.storyType && story.storyType.toLowerCase().includes(lowercasePrompt))
  );
  
  // Determine which arcs to show based on the prompt
  let relevantArcs = [];
  
  if (lowercasePrompt.includes('oil') || lowercasePrompt.includes('energy') || lowercasePrompt.includes('crisis') || lowercasePrompt.includes('gas')) {
    relevantArcs.push(mockArcs[0]);
  }
  
  if (lowercasePrompt.includes('watergate') || lowercasePrompt.includes('nixon') || lowercasePrompt.includes('scandal') || lowercasePrompt.includes('politics') || lowercasePrompt.includes('corruption')) {
    relevantArcs.push(mockArcs[1]);
  }
  
  if (lowercasePrompt.includes('space') || lowercasePrompt.includes('moon') || lowercasePrompt.includes('apollo') || lowercasePrompt.includes('astronaut') || lowercasePrompt.includes('nasa')) {
    relevantArcs.push(mockArcs[2]);
  }
  
  if (lowercasePrompt.includes('sports') || lowercasePrompt.includes('coach') || lowercasePrompt.includes('basketball') || lowercasePrompt.includes('scandal') || lowercasePrompt.includes('ethics')) {
    relevantArcs.push(mockArcs[3]);
  }
  
  if (lowercasePrompt.includes('women') || lowercasePrompt.includes('equality') || lowercasePrompt.includes('gender') || lowercasePrompt.includes('rights') || lowercasePrompt.includes('movement')) {
    relevantArcs.push(mockArcs[4]);
  }
  
  // Create narrative-focused follow-ups
  let customFollowups: string[] = [];
  
  if (relevantArcs.length > 0) {
    // Create arc-specific follow-ups
    relevantArcs.forEach(arc => {
      if (arc.title.includes("Energy Crisis")) {
        customFollowups.push("Explore how everyday Americans adapted to fuel shortages");
        customFollowups.push("Uncover the political forces behind the energy policy failures");
      } else if (arc.title.includes("Watergate")) {
        customFollowups.push("Find the forgotten staffers who became reluctant whistleblowers");
        customFollowups.push("Trace the media investigation that unraveled the cover-up");
      } else if (arc.title.includes("Apollo")) {
        customFollowups.push("Discover the untold stories of mission control during the critical moments");
        customFollowups.push("Explore how the space race transformed American technology");
      } else if (arc.title.includes("Coach Harrick")) {
        customFollowups.push("Investigate how the community divided over allegations against a local hero");
        customFollowups.push("Trace the ripple effects of the scandal on high school athletics policies");
      } else if (arc.title.includes("Women's Equality")) {
        customFollowups.push("Find the personal stories behind the women who organized the movement");
        customFollowups.push("Uncover the corporate resistance to workplace equality measures");
      }
    });
  } else {
    // Generic narrative-focused follow-ups
    customFollowups = [
      `Explore forgotten human stories behind ${prompt}`,
      `Uncover the narrative potential in ${prompt}`,
      `Find the dramatic arcs connecting ${prompt} to larger historical threads`
    ];
  }
  
  return {
    stories: filteredStories.slice(0, 6),
    arcs: relevantArcs,
    suggestedFollowups: customFollowups.slice(0, 3) // Limit to 3 follow-ups
  };
} 