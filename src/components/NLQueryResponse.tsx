import React from 'react';

interface Story {
  id: string;
  title: string;
  publication: string;
  date: string;
  snippet: string;
  relevanceScore: number;
}

interface Arc {
  id: string;
  title: string;
  storyCount: number;
  timespan: string;
  summary: string;
  themes?: string[];
}

interface NLQueryResponseProps {
  query: string;
  stories: Story[];
  arcs: Arc[];
  isLoading: boolean;
}

const NLQueryResponse: React.FC<NLQueryResponseProps> = ({ query, stories, arcs, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-neutral-800/30 p-4 rounded-lg shadow-sm border border-neutral-700">
        <div className="h-4 w-40 bg-neutral-700 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-full bg-neutral-700 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-3/4 bg-neutral-700 rounded animate-pulse"></div>
      </div>
    );
  }
  
  if (!query || stories.length === 0) {
    return null;
  }
  
  // Generate a natural language response based on the query and results
  const generateResponse = () => {
    const storyCount = stories.length;
    let response = "";
    
    if (query.toLowerCase().includes('oil') || query.toLowerCase().includes('energy') || query.toLowerCase().includes('crisis')) {
      response = `I found ${storyCount} stories about the oil crisis. The energy crisis of the 1970s was a significant period of global economic and political tension, with OPEC's production cuts leading to worldwide price increases and shortages.`;
    } else if (query.toLowerCase().includes('watergate') || query.toLowerCase().includes('nixon') || query.toLowerCase().includes('scandal')) {
      response = `I found ${storyCount} stories about the Watergate scandal. The Watergate scandal was a major political scandal that began with the break-in at the Democratic National Committee headquarters and ultimately led to President Nixon's resignation in 1974.`;
    } else if (query.toLowerCase().includes('apollo') || query.toLowerCase().includes('moon') || query.toLowerCase().includes('space')) {
      response = `I found ${storyCount} stories about space exploration. The Apollo program was a defining achievement of the 1960s and early 1970s, culminating in the successful lunar landing missions and symbolizing America's technological prowess during the Cold War.`;
    } else {
      response = `I found ${storyCount} stories related to "${query}". `;
      
      if (arcs.length > 0) {
        response += `These stories are part of ${arcs.length} broader narrative arc${arcs.length > 1 ? 's' : ''}.`;
      }
    }
    
    return response;
  };
  
  return (
    <div className="bg-neutral-800/30 p-4 rounded-lg shadow-sm border border-neutral-700">
      <h2 className="text-sm font-medium text-blue-400 mb-2">Response</h2>
      <p className="text-white">{generateResponse()}</p>
    </div>
  );
};

export default NLQueryResponse; 