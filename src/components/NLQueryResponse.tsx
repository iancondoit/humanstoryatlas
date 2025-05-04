import React, { useState } from 'react';
import { MessageCircle, BookOpen, TrendingUp, FileText, User, ChevronUp, ChevronDown } from 'lucide-react';

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
  const [expanded, setExpanded] = useState(false);
  const noResults = stories.length === 0 && arcs.length === 0;
  
  // Generate alternative search suggestions
  const generateAlternativeQueries = (query: string) => {
    const baseQuery = query.toLowerCase();
    const suggestions = [];
    
    // Specific alternatives for common topics
    if (baseQuery.includes('serial killer') || baseQuery.includes('murder')) {
      suggestions.push(
        "notorious serial killers from the 1970s",
        "unsolved murder cases with strange clues",
        "serial crimes that shocked small towns"
      );
    } else if (baseQuery.includes('sport') || baseQuery.includes('game')) {
      suggestions.push(
        "forgotten sports scandals from the 1980s",
        "underdog sports stories with unexpected heroes",
        "controversial sports moments that changed rules"
      );
    } else if (baseQuery.includes('politic') || baseQuery.includes('government')) {
      suggestions.push(
        "political scandals that were quickly forgotten",
        "behind-the-scenes government conspiracies",
        "unlikely politicians who changed history"
      );
    } else if (baseQuery.includes('war') || baseQuery.includes('conflict')) {
      suggestions.push(
        "untold stories from the Cold War",
        "forgotten heroes from World War II",
        "small conflicts with big historical impact"
      );
    } else {
      // Generic alternatives for any query
      suggestions.push(
        "unexpected historical connections to " + query,
        "forgotten events related to " + query,
        "human stories behind " + query
      );
    }
    
    return suggestions;
  };
  
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-neutral-800/40 rounded-2xl border border-neutral-700 shadow-lg animate-pulse">
        <div className="h-4 bg-neutral-700 rounded mb-4 w-3/4"></div>
        <div className="h-4 bg-neutral-700 rounded mb-4 w-1/2"></div>
        <div className="h-4 bg-neutral-700 rounded mb-4 w-5/6"></div>
        <div className="h-4 bg-neutral-700 rounded w-2/3"></div>
      </div>
    );
  }

  // Early return if no query
  if (!query) return null;
  
  // Create alternative suggestions
  const alternativeSuggestions = generateAlternativeQueries(query);

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-neutral-800/40 rounded-2xl border border-neutral-700 shadow-lg">
      {noResults ? (
        // No results experience
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-blue-400">Refining Your Search</h3>
          <p className="text-neutral-300">
            I couldn't find specific narrative threads for "<span className="text-white font-medium">{query}</span>". 
            Try one of these alternatives:
          </p>
          
          <ul className="mt-4 space-y-2">
            {alternativeSuggestions.map((suggestion, i) => (
              <li key={i} className="bg-neutral-700/40 rounded-lg p-3 hover:bg-neutral-700/60 transition-colors">
                <button 
                  className="w-full text-left text-blue-300 hover:text-blue-200"
                  onClick={() => {
                    // Find the search input and update it
                    const searchInput = document.querySelector('input[placeholder*="Ask about forgotten stories"]') as HTMLInputElement;
                    if (searchInput) {
                      searchInput.value = suggestion;
                      searchInput.dispatchEvent(new Event('change', { bubbles: true }));
                      
                      // Find and click the search button
                      const searchButton = searchInput.parentElement?.querySelector('button') as HTMLButtonElement;
                      if (searchButton) {
                        searchButton.click();
                      }
                    }
                  }}
                >
                  "{suggestion}"
                </button>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 pt-4 border-t border-neutral-700">
            <h4 className="text-lg font-medium text-neutral-200 mb-2">Search Tips:</h4>
            <ul className="list-disc list-inside text-neutral-400 space-y-1">
              <li>Try using broader terms or historical periods</li>
              <li>Include specific locations or publications</li>
              <li>Mention narrative types (scandal, mystery, etc.)</li>
              <li>Search for themes rather than specific events</li>
            </ul>
          </div>
        </div>
      ) : (
        // Regular response for search with results
        <>
          <h3 className="text-xl font-semibold text-blue-400">Understanding Your Query</h3>
          <p className="text-neutral-300 mt-2">
            I analyzed your interest in <span className="text-white font-medium">"{query}"</span> and found {stories.length} stories and {arcs.length} narrative arcs that might contain compelling material.
          </p>
          
          {stories.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-medium text-neutral-200">Key Discoveries:</h4>
              <ul className="mt-2 space-y-2 text-neutral-400">
                <li>• Found stories spanning {getYearRange(stories)} with varying perspectives</li>
                {stories.length >= 3 && <li>• Multiple publication sources provide different narrative angles</li>}
                {getPublicationCount(stories) > 1 && <li>• {getPublicationCount(stories)} different publications covered this topic</li>}
                {arcs.length > 0 && <li>• Identified {arcs.length} potential narrative threads worthy of exploration</li>}
              </ul>
            </div>
          )}
          
          {arcs.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-medium text-neutral-200">Narrative Potential:</h4>
              <p className="text-neutral-400 mt-1">
                The strongest narrative arc spans {arcs[0].timespan} and contains elements of {formatThemes(arcs[0].themes)}.
              </p>
            </div>
          )}
          
          <div className="mt-6">
            <button 
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span>Show less</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Show more analysis</span>
                </>
              )}
            </button>
            
            {expanded && (
              <div className="mt-4 space-y-4 text-neutral-400 text-sm animate-fadeIn">
                <p>
                  Your query suggests an interest in narrative elements that could be developed into a compelling story structure. The results reveal patterns across {getYearRange(stories)}, showing how perspectives evolved over time.
                </p>
                
                <p>
                  The most intriguing aspect appears to be the {arcs.length > 0 ? `"${arcs[0].title}"` : "underlying connections between seemingly unrelated events"}, which contains rich character dynamics and conflict.
                </p>
                
                <p>
                  To further explore the narrative potential, I recommend focusing on the {stories.length > 0 ? `"${stories[0].title}"` : "most prominent story"} as it contains the strongest elements of {arcs.length > 0 ? formatThemes(arcs[0].themes) : "dramatic potential"}.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NLQueryResponse;

// Helper function to get the publication count
function getPublicationCount(stories: Story[]) {
  const uniquePublications = new Set(stories.map(story => story.publication));
  return uniquePublications.size;
}

// Helper function to get the year range
function getYearRange(stories: Story[]) {
  if (stories.length === 0) return "unknown years";
  
  const years = stories.map(story => new Date(story.date).getFullYear());
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  
  if (minYear === maxYear) {
    return minYear.toString();
  }
  
  return `${minYear} to ${maxYear}`;
}

// Helper function to format themes
function formatThemes(themes: string[] = []) {
  if (!themes || themes.length === 0) return "various themes";
  
  if (themes.length === 1) return themes[0];
  
  if (themes.length === 2) return `${themes[0]} and ${themes[1]}`;
  
  return `${themes[0]}, ${themes[1]}, and ${themes.length - 2} more`;
} 