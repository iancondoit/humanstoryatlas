"use client";

import React, { useState } from 'react';
import { Search, Globe } from 'lucide-react';
import FilterBar from '@/components/FilterBar';
import ExamplePrompts from '@/components/ExamplePrompts';
import GenomeStats from '@/components/GenomeStats';
import ResultsDisplay from '@/components/ResultsDisplay';
import NLQueryResponse from '@/components/NLQueryResponse';
import { ThemeToggle } from '@/components/ThemeToggle';
import { fetchStories, type SearchResults } from '@/lib/api';

// Define types for our results
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

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [submittedPrompt, setSubmittedPrompt] = useState('');
  const [filters, setFilters] = useState({
    publication: '',
    startDate: '',
    endDate: ''
  });
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleFilterChange = (type: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handlePromptSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    handleSearch(selectedPrompt);
  };

  const handleSearch = async (searchPrompt: string = prompt) => {
    if (!searchPrompt.trim()) return;
    
    setIsLoading(true);
    setSubmittedPrompt(searchPrompt); // Store the submitted prompt for NLQueryResponse
    
    try {
      // Use the API client to fetch real data from the backend
      const searchResults = await fetchStories({
        query: searchPrompt,
        publication: filters.publication,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: 10
      });
      
      setResults(searchResults);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header with logo and title */}
      <header className="border-b border-neutral-800 p-4 flex justify-between items-center bg-[#0d1117]/90 backdrop-blur supports-[backdrop-filter]:bg-[#0d1117]/60 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-white">Human Story Atlas 🧬</h1>
          <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded-full ml-2">v1.5.0</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Compact GenomeStats in header */}
          <div className="hidden lg:block">
            <GenomeStats compact={true} />
          </div>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Filter Bar */}
        <FilterBar 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
        
        {/* Search Input */}
        <div className="w-full">
          <div className="relative">
            <input
              placeholder="Ask about forgotten stories, hidden arcs, or historic events..."
              className="w-full pl-5 pr-16 py-7 text-lg bg-neutral-800/50 border border-neutral-700 shadow-md rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/40 text-white"
              value={prompt}
              onChange={handlePromptChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 shadow-lg rounded-xl px-4 py-2 text-white"
              onClick={() => handleSearch()}
              disabled={isLoading}
              aria-label="Search"
            >
              {isLoading ? 
                <span className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span className="sr-only">Searching...</span>
                </span>
                : 
                <Search className="h-5 w-5" />
              }
            </button>
          </div>
        </div>
        
        {/* Natural Language Explanation */}
        {results && (
          <NLQueryResponse 
            query={submittedPrompt}
            stories={results?.stories || []}
            arcs={results?.arcs || []}
            isLoading={isLoading}
          />
        )}
        
        {/* Example Prompts */}
        <ExamplePrompts onPromptSelect={handlePromptSelect} />
        
        {/* Mobile GenomeStats */}
        <div className="lg:hidden">
          <GenomeStats />
        </div>
        
        {/* Results Area */}
        <ResultsDisplay results={results} />
      </main>
    </div>
  );
} 