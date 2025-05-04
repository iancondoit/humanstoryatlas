import React from 'react';
import { MessageCircle } from 'lucide-react';

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
      <div className="bg-neutral-800/30 p-5 rounded-lg shadow-sm border border-neutral-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-blue-400" />
          </div>
          <div className="h-4 w-32 bg-neutral-700 rounded animate-pulse"></div>
        </div>
        <div className="pl-11">
          <div className="h-4 w-full bg-neutral-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-3/4 bg-neutral-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  if (!query || stories.length === 0) {
    return null;
  }
  
  // Generate a Jordi-styled narrative response based on the query and results
  const generateJordiResponse = () => {
    const lowercaseQuery = query.toLowerCase();
    let response = "";
    let sideNote = "";
    
    // Oil crisis / Energy narratives
    if (lowercaseQuery.includes('oil') || lowercaseQuery.includes('energy') || lowercaseQuery.includes('crisis')) {
      response = "I've uncovered what feels like an HBO miniseries about American anxiety during the oil crisis. There's a powerful narrative arc forming around everyday people caught in geopolitical crossfire — gas lines, public anger, and politicians scrambling for solutions.";
      sideNote = "The gap in coverage between the initial OPEC announcement and the public response suggests a slow-building tension that would make for compelling dramatic structure.";
    } 
    // Watergate / Political scandal narratives
    else if (lowercaseQuery.includes('watergate') || lowercaseQuery.includes('nixon') || lowercaseQuery.includes('scandal')) {
      response = "There's a 'bureaucratic thriller' thread emerging here — not just about Nixon, but the web of characters caught in the machinery of power. This reads like a multi-perspective narrative where even minor players had crucial roles in the collapse of an administration.";
      sideNote = "Notice how the local reporting angles differ from the national coverage? The regional papers found human stories that the Washington coverage missed entirely.";
    } 
    // Space / Apollo narratives
    else if (lowercaseQuery.includes('apollo') || lowercaseQuery.includes('moon') || lowercaseQuery.includes('space')) {
      response = "Beyond the flag-planting heroism, I'm seeing a 'hidden figures' narrative about the ground teams and technical staff. There's a powerful story about the invisible architecture of achievement woven throughout these fragments.";
      sideNote = "The technical documentation preserved alongside the news coverage creates a fascinating dialogue between public perception and engineering reality.";
    }
    // Sports narratives 
    else if (lowercaseQuery.includes('sports') || lowercaseQuery.includes('athlete') || lowercaseQuery.includes('olympic')) {
      response = "I'm detecting an underdog arc with echoes of mainstream sports films, but with a complicated twist — there are ethical gray areas and institutional pressures that would make this more than a simple triumph narrative.";
      sideNote = "The local coverage gives much more texture to the community impact than national reporting, which focused mostly on statistics and outcomes.";
    }
    // Default response with creative narrative framing
    else {
      response = `I've found something intriguing about ${query}. There's a narrative pattern emerging that feels part investigative journey, part human drama. The story fragments suggest unexpected connections across time periods and personalities.`;
      sideNote = "Some of these threads were nearly lost to history — they appear briefly and then vanish from the archives, suggesting stories that never fully developed in public consciousness.";
    }
    
    return { response, sideNote };
  };
  
  const { response, sideNote } = generateJordiResponse();
  
  // Generate a story arc label based on the query and results
  const generateArcLabel = () => {
    const lowercaseQuery = query.toLowerCase();
    
    if (lowercaseQuery.includes('oil') || lowercaseQuery.includes('energy')) {
      return "Resource Crisis with Human Fallout";
    } else if (lowercaseQuery.includes('watergate') || lowercaseQuery.includes('nixon')) {
      return "Political Thriller with Cascading Consequences";
    } else if (lowercaseQuery.includes('apollo') || lowercaseQuery.includes('moon')) {
      return "Technological Triumph with Hidden Heroes";
    } else if (lowercaseQuery.includes('sports') || lowercaseQuery.includes('athlete')) {
      return "Sports Narrative with Unexpected Complexity";
    } else {
      return "Emerging Historical Arc";
    }
  };
  
  return (
    <div className="bg-neutral-800/30 p-5 rounded-lg shadow-sm border border-neutral-700">
      {/* Jordi Persona Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
          <MessageCircle className="h-4 w-4 text-blue-400" />
        </div>
        <div className="text-blue-400 font-medium">Jordi</div>
        <div className="text-xs px-2 py-0.5 bg-neutral-700/50 rounded text-neutral-400">
          {generateArcLabel()}
        </div>
      </div>
      
      {/* Main Response */}
      <div className="pl-11">
        <p className="text-white mb-4">{response}</p>
        
        {/* Jordi's Side Note */}
        {sideNote && (
          <div className="bg-neutral-800/70 border-l-2 border-blue-500/40 pl-3 py-2 text-sm text-neutral-300 italic mb-3">
            {sideNote}
          </div>
        )}
        
        {/* Arc Summary */}
        {arcs.length > 0 && (
          <div className="mt-4 space-y-1">
            <div className="text-xs uppercase text-neutral-500 tracking-wider mb-2">Narrative Threads</div>
            {arcs.map((arc, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                <div>
                  <span className="text-blue-300">{arc.title}</span>
                  <span className="text-neutral-400 text-sm"> — {arc.summary.split('.')[0]}.</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NLQueryResponse; 