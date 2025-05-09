"use client";

// This is mostly a copy of the original page.tsx but with updated navigation
import React, { useState } from 'react';
import { Search, Globe } from 'lucide-react';
import FilterBar from '@/components/FilterBar';
import GenomeStats from '@/components/GenomeStats';
import { ThemeToggle } from '@/components/ThemeToggle';
import UnderConstruction from '@/components/UnderConstruction';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header with logo and title */}
      <header className="border-b border-neutral-800 p-4 flex justify-between items-center bg-[#0d1117]/90 backdrop-blur supports-[backdrop-filter]:bg-[#0d1117]/60 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-white">Human Story Atlas 🧬</h1>
          <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded-full ml-2">v2.2.0</span>
        </div>
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="hidden md:flex bg-neutral-800 rounded-lg p-0.5">
            <a 
              href="/explore"
              className="px-3 py-1.5 text-sm rounded-md transition-colors text-neutral-400 hover:text-white"
            >
              Explore
            </a>
            <a 
              href="/search"
              className="px-3 py-1.5 text-sm rounded-md transition-colors bg-blue-600 text-white"
            >
              Search
            </a>
            <a 
              href="/jordi"
              className="px-3 py-1.5 text-sm rounded-md transition-colors text-neutral-400 hover:text-white"
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
      
      <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Mobile View Toggle */}
        <div className="md:hidden flex bg-neutral-800 rounded-lg p-0.5 mx-auto w-fit">
          <a 
            href="/explore"
            className="px-4 py-2 text-sm rounded-md transition-colors text-neutral-400 hover:text-white"
          >
            Explore
          </a>
          <a 
            href="/search"
            className="px-4 py-2 text-sm rounded-md transition-colors bg-blue-600 text-white"
          >
            Search
          </a>
          <a 
            href="/jordi"
            className="px-4 py-2 text-sm rounded-md transition-colors text-neutral-400 hover:text-white"
          >
            Jordi
          </a>
        </div>
        
        {/* Under Construction */}
        <UnderConstruction 
          title="Advanced Search Coming Soon"
          message="We're working on bringing powerful search capabilities to Human Story Atlas. For now, check out Jordi for narrative discovery."
        />
        
        {/* Mobile GenomeStats */}
        <div className="mt-6 lg:hidden">
          <GenomeStats />
        </div>
      </main>
    </div>
  );
} 