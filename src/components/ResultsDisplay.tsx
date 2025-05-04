import React from 'react';
import { BookOpen, TrendingUp, MessageSquare } from 'lucide-react';

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

interface ResultsDisplayProps {
  results: {
    stories: Story[];
    arcs: Arc[];
    suggestedFollowups: string[];
  } | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  if (!results) return null;
  
  const { stories, arcs } = results;
  
  if (stories.length === 0 && arcs.length === 0) {
    return (
      <div className="p-8 text-center bg-neutral-800/30 rounded-lg">
        <p className="text-neutral-400">No narrative threads discovered. Try a different query approach.</p>
      </div>
    );
  }
  
  // Generate a story type label for each story
  const getStoryType = (story: Story): string => {
    const title = story.title.toLowerCase();
    const snippet = story.snippet.toLowerCase();
    
    if (title.includes('crisis') || snippet.includes('crisis')) {
      return "Crisis Narrative";
    } else if (title.includes('scandal') || snippet.includes('scandal')) {
      return "Political Intrigue";
    } else if (title.includes('moon') || snippet.includes('moon') || title.includes('apollo') || snippet.includes('apollo')) {
      return "Technological Milestone";
    } else if (title.includes('war') || snippet.includes('war') || title.includes('conflict') || snippet.includes('conflict')) {
      return "Conflict Chronicle";
    } else {
      return "Human Interest";
    }
  };
  
  // Group stories by their narrative type
  const groupStoriesByType = (stories: Story[]) => {
    const groups: {[key: string]: Story[]} = {};
    
    stories.forEach(story => {
      const type = getStoryType(story);
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(story);
    });
    
    return groups;
  };
  
  const storyGroups = groupStoriesByType(stories);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Narrative Arcs Section - Now given more prominence */}
      <div className="lg:col-span-2 space-y-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Narrative Arcs</h2>
        </div>
        
        {arcs.length > 0 ? (
          <div className="space-y-6">
            {arcs.map(arc => (
              <div 
                key={arc.id} 
                className="p-5 bg-neutral-800/50 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors"
              >
                <h3 className="text-xl font-medium text-white mb-3">{arc.title}</h3>
                <div className="flex items-center gap-2 text-sm text-neutral-400 mb-3">
                  <span>{arc.timespan}</span>
                  <span>•</span>
                  <span>{arc.storyCount} interconnected stories</span>
                </div>
                <p className="text-neutral-300 mb-4">{arc.summary}</p>
                
                {arc.themes && (
                  <div className="flex flex-wrap gap-2">
                    {arc.themes.map(theme => (
                      <span 
                        key={theme} 
                        className="px-2.5 py-1 bg-blue-900/30 text-blue-100 rounded-full text-xs"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-neutral-700">
                  <h4 className="text-sm font-medium text-neutral-300 mb-2">Potential Narrative Directions:</h4>
                  <ul className="space-y-1 text-sm text-neutral-400">
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-400 mt-2"></div>
                      <span>Examine the human impact behind institutional decisions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-400 mt-2"></div>
                      <span>Explore forgotten perspectives from non-central figures</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-400 mt-2"></div>
                      <span>Follow the timeline of public understanding vs. insider knowledge</span>
                    </li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-400">No defined narrative arcs discovered yet, but narrative potential exists in the story fragments.</p>
        )}
      </div>
      
      {/* Story Fragments Section - Renamed and redesigned */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Story Fragments</h2>
        </div>
        
        {Object.keys(storyGroups).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(storyGroups).map(([type, groupStories]) => (
              <div key={type} className="space-y-3">
                <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">{type}</h3>
                
                {groupStories.map(story => (
                  <div 
                    key={story.id} 
                    className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors"
                  >
                    <h4 className="text-base font-medium text-white mb-2">{story.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
                      <span>{story.publication}</span>
                      <span>•</span>
                      <span>{story.date}</span>
                    </div>
                    <p className="text-sm text-neutral-300 mb-1">{story.snippet}</p>
                    <div className="text-xs text-blue-400 mt-2">Narrative relevance: {Math.round(story.relevanceScore * 100)}%</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-400">No story fragments found matching your criteria.</p>
        )}
        
        {/* Suggested Follow-ups - Restyled */}
        {results.suggestedFollowups.length > 0 && (
          <div className="mt-6 p-4 bg-neutral-800/30 rounded-lg border border-neutral-700">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-medium text-neutral-300">Jordi Suggests Exploring:</h3>
            </div>
            <ul className="space-y-2 pl-6">
              {results.suggestedFollowups.map((followup, index) => (
                <li 
                  key={index}
                  className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer list-disc"
                >
                  {followup}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay; 