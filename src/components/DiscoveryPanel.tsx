"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Map, Users, Building, BookOpen, Tag, Info, ArrowRight, ChevronRight } from 'lucide-react';
import { DiscoverySummary } from '@/types/discovery';

interface DiscoveryPanelProps {
  source: string;
  startDate: string;
  endDate: string;
}

export default function DiscoveryPanel({ source, startDate, endDate }: DiscoveryPanelProps) {
  const [summaryData, setSummaryData] = useState<DiscoverySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if we don't have all the required params
    if (!source || !startDate || !endDate) return;

    const fetchDiscoverySummary = async () => {
      setIsLoading(true);
      setError(null);
      setSummaryData(null);
      
      try {
        const response = await fetch(
          `/api/discovery_summary?source=${encodeURIComponent(source)}&from=${startDate}&to=${endDate}`
        );
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setSummaryData(data);
      } catch (err) {
        console.error('Failed to fetch discovery summary:', err);
        setError('Failed to load discovery insights. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscoverySummary();
  }, [source, startDate, endDate]);

  // Helper to check if we have empty data results
  const isEmptyResults = () => {
    if (!summaryData) return false;
    
    return (
      summaryData.entity_summary.people.length === 0 &&
      summaryData.entity_summary.places.length === 0 &&
      summaryData.entity_summary.organizations.length === 0 &&
      summaryData.top_keywords.length === 0 &&
      summaryData.notable_stories.length === 0
    );
  };

  if (isLoading) {
    return (
      <div className="bg-neutral-800/40 p-6 rounded-2xl space-y-4 border border-neutral-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-blue-400">
            <BookOpen className="h-5 w-5" />
          </span>
          Exploring the Archives...
        </h2>
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-800/40 p-6 rounded-2xl space-y-4 border border-neutral-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-blue-400">
            <BookOpen className="h-5 w-5" />
          </span>
          Hmm, I Hit a Snag
        </h2>
        <p className="text-neutral-400">{error}</p>
      </div>
    );
  }

  if (!summaryData || !source || !startDate || !endDate) {
    return (
      <div className="bg-neutral-800/40 p-6 rounded-2xl space-y-4 border border-neutral-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-blue-400">
            <BookOpen className="h-5 w-5" />
          </span>
          Let's Explore the Archives Together
        </h2>
        <p className="text-neutral-400">
          Select a publication and date range, and I'll help you discover forgotten stories and hidden connections.
        </p>
      </div>
    );
  }

  if (isEmptyResults()) {
    return (
      <div className="bg-neutral-800/40 p-6 rounded-2xl space-y-4 border border-neutral-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-blue-400">
            <BookOpen className="h-5 w-5" />
          </span>
          No Stories Found... Yet!
        </h2>
        
        {/* Source and Date Range */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="bg-neutral-700/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span className="text-neutral-300">{new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</span>
          </div>
          <div className="bg-neutral-700/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Building className="h-4 w-4 text-blue-400" />
            <span className="text-neutral-300">{source}</span>
          </div>
        </div>
        
        <div className="bg-blue-900/20 border border-blue-900/30 p-4 rounded-lg flex gap-3">
          <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-neutral-300 text-sm">
              I couldn't find any stories for this time period and publication. Let's try something else!
            </p>
            <p className="text-blue-400 text-sm mt-2">
              Try "San Antonio Express-News" from August 1-14, 1977 — I know there are some fascinating stories there.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Format dates for display
  const formattedStartDate = new Date(startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedEndDate = new Date(endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-gradient-to-b from-blue-900/30 to-neutral-900/50 p-8 rounded-2xl border border-blue-800/30 shadow-xl">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Time Portal: <span className="text-blue-400">{source}</span>
          </h2>
          <p className="text-lg text-neutral-300">
            I've analyzed {summaryData.notable_stories.length} stories from {formattedStartDate} to {formattedEndDate}. 
            Here's what I discovered about this moment in history...
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Entities */}
          <div className="lg:col-span-4 space-y-6">
            {/* Themes Section */}
            {summaryData.top_themes.length > 0 && (
              <div className="bg-neutral-800/50 rounded-xl p-5 border border-neutral-700/50">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                  <Tag className="h-5 w-5 text-blue-400" />
                  Major Themes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {summaryData.top_themes.map((theme, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-900/40 text-blue-300 px-3 py-1.5 text-sm rounded-full"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Entity Sections */}
            <div className="bg-neutral-800/50 rounded-xl p-5 border border-neutral-700/50 space-y-6">
              {/* People */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  Key People
                </h3>
                {summaryData.entity_summary.people.length > 0 ? (
                  <ul className="space-y-2.5">
                    {summaryData.entity_summary.people.slice(0, 5).map((person, idx) => (
                      <li key={idx} className="flex justify-between items-center p-2 hover:bg-neutral-700/20 rounded-lg transition-colors">
                        <span className="text-neutral-200 font-medium">{person.name}</span>
                        <span className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded-full">{person.count} mentions</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-400 text-sm">No significant people identified in these stories.</p>
                )}
              </div>

              {/* Places */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Map className="h-5 w-5 text-blue-400" />
                  Locations
                </h3>
                {summaryData.entity_summary.places.length > 0 ? (
                  <ul className="space-y-2.5">
                    {summaryData.entity_summary.places.slice(0, 5).map((place, idx) => (
                      <li key={idx} className="flex justify-between items-center p-2 hover:bg-neutral-700/20 rounded-lg transition-colors">
                        <span className="text-neutral-200 font-medium">{place.name}</span>
                        <span className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded-full">{place.count} mentions</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-400 text-sm">No significant locations identified in these stories.</p>
                )}
              </div>

              {/* Organizations */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-400" />
                  Organizations
                </h3>
                {summaryData.entity_summary.organizations.length > 0 ? (
                  <ul className="space-y-2.5">
                    {summaryData.entity_summary.organizations.slice(0, 5).map((org, idx) => (
                      <li key={idx} className="flex justify-between items-center p-2 hover:bg-neutral-700/20 rounded-lg transition-colors">
                        <span className="text-neutral-200 font-medium">{org.name}</span>
                        <span className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded-full">{org.count} mentions</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-400 text-sm">No significant organizations identified in these stories.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stories and Keywords */}
          <div className="lg:col-span-8 space-y-6">
            {/* Keyword Cloud */}
            {summaryData.top_keywords.length > 0 && (
              <div className="bg-neutral-800/50 rounded-xl p-5 border border-neutral-700/50">
                <h3 className="text-lg font-semibold text-white mb-3">Trending Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {summaryData.top_keywords.map((keyword, index) => (
                    <span 
                      key={index} 
                      className="bg-neutral-700/50 hover:bg-neutral-700 text-white px-3 py-1.5 text-sm rounded-full transition-colors cursor-pointer"
                    >
                      {keyword.term} <span className="text-neutral-400">{keyword.count}×</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notable Stories */}
            <div className="bg-neutral-800/50 rounded-xl p-5 border border-neutral-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Fascinating Stories I Found</h3>
              <div className="space-y-4">
                {summaryData.notable_stories.map((story, idx) => (
                  <div 
                    key={story.id} 
                    className="border border-neutral-700 rounded-xl p-5 space-y-3 hover:bg-neutral-700/20 transition-colors cursor-pointer relative group"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-white font-medium text-lg group-hover:text-blue-300 transition-colors">{story.title}</h4>
                      <span className="text-neutral-400 text-sm bg-neutral-800/70 px-2 py-0.5 rounded-full">
                        {new Date(story.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-neutral-300 text-base">{story.summary}</p>
                    <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                      <span className="text-sm font-medium">Read this story</span>
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
              
              {summaryData.notable_stories.length === 0 && (
                <p className="text-neutral-400 text-center py-6">No notable stories found for this time period.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 