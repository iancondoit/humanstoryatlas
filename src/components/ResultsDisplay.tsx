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
        <p className="text-neutral-400">No results found. Try a different search query.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stories Section */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-xl font-semibold text-white">Stories</h2>
        
        {stories.length > 0 ? (
          <div className="space-y-4">
            {stories.map(story => (
              <div 
                key={story.id} 
                className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors"
              >
                <h3 className="text-lg font-medium text-white mb-2">{story.title}</h3>
                <div className="flex items-center gap-3 text-sm text-neutral-400 mb-2">
                  <span>{story.publication}</span>
                  <span>•</span>
                  <span>{story.date}</span>
                  <span className="ml-auto px-2 py-0.5 bg-blue-900/40 text-blue-100 rounded text-xs">
                    {Math.round(story.relevanceScore * 100)}% relevance
                  </span>
                </div>
                <p className="text-sm text-neutral-300">{story.snippet}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-400">No stories found matching your criteria.</p>
        )}
      </div>
      
      {/* Arcs Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Narrative Arcs</h2>
        
        {arcs.length > 0 ? (
          <div className="space-y-4">
            {arcs.map(arc => (
              <div 
                key={arc.id} 
                className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors"
              >
                <h3 className="text-lg font-medium text-white mb-2">{arc.title}</h3>
                <div className="flex items-center gap-2 text-sm text-neutral-400 mb-2">
                  <span>{arc.timespan}</span>
                  <span>•</span>
                  <span>{arc.storyCount} stories</span>
                </div>
                <p className="text-sm text-neutral-300 mb-3">{arc.summary}</p>
                
                {arc.themes && (
                  <div className="flex flex-wrap gap-2">
                    {arc.themes.map(theme => (
                      <span 
                        key={theme} 
                        className="px-2 py-0.5 bg-neutral-700 text-neutral-300 rounded-full text-xs"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-400">No narrative arcs found for this search.</p>
        )}
        
        {/* Suggested Follow-ups */}
        {results.suggestedFollowups.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-neutral-400 mb-2">Explore Further:</h3>
            <ul className="space-y-2">
              {results.suggestedFollowups.map((followup, index) => (
                <li 
                  key={index}
                  className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
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