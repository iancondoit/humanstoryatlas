"use client";

import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import FilterBar from '@/components/FilterBar';
import GenomeStats from '@/components/GenomeStats';
import { ThemeToggle } from '@/components/ThemeToggle';
import JordiChat from '@/components/JordiChat';
import { type JordiMessage } from '@/lib/jordi';

export default function JordiPage() {
  const [filters, setFilters] = useState({
    publication: '',
    startDate: '',
    endDate: ''
  });
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasFilterApplied, setHasFilterApplied] = useState(false);
  
  const handleFilterChange = (type: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
    
    // If publication is changed, mark filters as applied
    if (type === 'publication' && value) {
      setHasFilterApplied(true);
    }
  };
  
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // The actual message sending is now handled in the JordiChat component
    // This function is just a hook for parent-level actions if needed
    
    // Clear input
    setUserInput('');
  };
  
  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header with logo and title */}
      <header className="border-b border-neutral-800 p-4 flex justify-between items-center bg-[#0d1117]/90 backdrop-blur supports-[backdrop-filter]:bg-[#0d1117]/60 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-blue-500 animate-pulse-glow" />
          <h1 className="text-2xl font-bold text-white">Human Story Atlas 🧬</h1>
          <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded-full ml-2">v2.2.0</span>
        </div>
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="hidden md:flex bg-neutral-800 rounded-lg p-0.5 shadow-md">
            <a 
              href="/explore"
              className="px-3 py-1.5 text-sm rounded-md transition-colors text-neutral-400 hover:text-white"
            >
              Explore
            </a>
            <a 
              href="/search"
              className="px-3 py-1.5 text-sm rounded-md transition-colors text-neutral-400 hover:text-white"
            >
              Search
            </a>
            <a 
              href="/jordi"
              className="px-3 py-1.5 text-sm rounded-md transition-colors bg-blue-600 text-white shadow"
            >
              Jordi
            </a>
          </div>
          
          {/* Compact GenomeStats in header */}
          <div className="hidden lg:block">
            <GenomeStats compact={true} />
          </div>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-1 p-4 md:p-6 space-y-4 max-w-7xl mx-auto animate-fade-in">
        {/* Filter Bar */}
        <div className="bg-neutral-800/40 p-4 rounded-xl border border-neutral-700 shadow-md">
          <FilterBar 
            filters={filters} 
            onFilterChange={handleFilterChange} 
          />
        </div>
        
        {/* Jordi Chat Interface */}
        <JordiChat 
          filters={filters}
          hasFilterApplied={hasFilterApplied}
          userInput={userInput}
          setUserInput={setUserInput}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
        
        {/* Mobile View Toggle */}
        <div className="md:hidden flex bg-neutral-800 rounded-lg p-0.5 mx-auto w-fit shadow-md">
          <a 
            href="/explore"
            className="px-4 py-2 text-sm rounded-md transition-colors text-neutral-400 hover:text-white"
          >
            Explore
          </a>
          <a 
            href="/search"
            className="px-4 py-2 text-sm rounded-md transition-colors text-neutral-400 hover:text-white"
          >
            Search
          </a>
          <a 
            href="/jordi"
            className="px-4 py-2 text-sm rounded-md transition-colors bg-blue-600 text-white"
          >
            Jordi
          </a>
        </div>
        
        {/* Mobile GenomeStats */}
        <div className="mt-6 lg:hidden">
          <GenomeStats />
        </div>
      </main>
    </div>
  );
} 