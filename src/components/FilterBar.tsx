"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, RefreshCw, ArrowRight } from 'lucide-react';

interface FilterBarProps {
  filters: {
    publication: string;
    startDate: string;
    endDate: string;
  };
  onFilterChange: (type: string, value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const [publications, setPublications] = useState<string[]>(['All']);
  const [isLoading, setIsLoading] = useState(false);
  const [isDateRangeLoading, setIsDateRangeLoading] = useState(false);
  const prevPublicationRef = useRef<string>('');
  
  // Fetch all available publications
  useEffect(() => {
    const fetchPublications = async () => {
      setIsLoading(true);
      try {
        // Try multiple endpoints in sequence until one works
        let response;
        let success = false;
        
        // Attempt 1: Try the primary API endpoint
        try {
          console.log('Trying primary publications endpoint...');
          response = await fetch('/api/publications');
          if (response.ok) {
            success = true;
            console.log('Primary publications endpoint succeeded');
          } else {
            console.log('Primary publications endpoint failed, status:', response.status);
          }
        } catch (e) {
          console.error('Error with primary publications endpoint:', e);
        }
        
        // Attempt 2: Try the backup API endpoint
        if (!success) {
          try {
            console.log('Trying backup publications endpoint...');
            response = await fetch('/api/publications-backup');
            if (response.ok) {
              success = true;
              console.log('Backup publications endpoint succeeded');
            } else {
              console.log('Backup publications endpoint failed, status:', response.status);
            }
          } catch (e) {
            console.error('Error with backup publications endpoint:', e);
          }
        }
        
        // Attempt 3: Try the pub-list API endpoint
        if (!success) {
          try {
            console.log('Trying pub-list endpoint...');
            response = await fetch('/api/pub-list');
            if (response.ok) {
              success = true;
              console.log('Pub-list endpoint succeeded');
            } else {
              console.log('Pub-list endpoint failed, status:', response.status);
            }
          } catch (e) {
            console.error('Error with pub-list endpoint:', e);
          }
        }
        
        // If no endpoints worked, throw an error
        if (!success || !response) {
          throw new Error('All publication endpoints failed');
        }
        
        const data = await response.json();
        if (data.publications && Array.isArray(data.publications)) {
          // Make sure 'All' is the first option
          setPublications(['All', ...data.publications]);
        } else {
          throw new Error('Invalid publications data format');
        }
      } catch (error) {
        console.error('Error fetching publications:', error);
        // Fallback to hardcoded values as a last resort
        setPublications(['All', 'San Antonio Express-News', 'SanAntonioExpress']);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPublications();
  }, []);
  
  // Fetch date range when publication changes
  useEffect(() => {
    // Skip if 'All' is selected or no publication is selected
    if (!filters.publication || filters.publication.toLowerCase() === 'all') {
      return;
    }
    
    // Skip if publication hasn't changed
    if (prevPublicationRef.current === filters.publication) {
      return;
    }
    
    // Update ref with current publication
    prevPublicationRef.current = filters.publication;
    
    const fetchDateRange = async () => {
      setIsDateRangeLoading(true);
      try {
        const response = await fetch(`/api/publication-timerange?source=${encodeURIComponent(filters.publication)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch date range');
        }
        
        const data = await response.json();
        
        // Only update if we got valid dates
        if (data.startDate && data.endDate) {
          onFilterChange('startDate', data.startDate);
          onFilterChange('endDate', data.endDate);
        }
      } catch (error) {
        console.error('Error fetching date range:', error);
      } finally {
        setIsDateRangeLoading(false);
      }
    };
    
    fetchDateRange();
  }, [filters.publication, onFilterChange]);
  
  // Handle publication change
  const handlePublicationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange('publication', value);
  };
  
  return (
    <div className="flex flex-wrap gap-4 items-center bg-neutral-800/30 p-4 rounded-lg shadow-sm">
      <div>
        <label htmlFor="publication" className="block text-sm font-medium mb-1 text-neutral-300">
          Publication
        </label>
        <select 
          id="publication" 
          className="bg-neutral-700 text-white rounded-md px-3 py-1.5 text-sm border border-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-40"
          value={filters.publication}
          onChange={handlePublicationChange}
          disabled={isLoading}
        >
          {isLoading ? (
            <option>Loading...</option>
          ) : (
            publications.map(pub => (
              <option key={pub} value={pub.toLowerCase() === 'all' ? '' : pub}>
                {pub}
              </option>
            ))
          )}
        </select>
      </div>
      
      <div className="flex items-center gap-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-1 text-neutral-300 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-blue-400" />
            From
          </label>
          <div className="relative">
            <input 
              type="date" 
              id="startDate"
              className={`bg-neutral-700 text-white rounded-md px-3 py-1.5 text-sm border border-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500 ${isDateRangeLoading ? 'opacity-50' : ''}`}
              value={filters.startDate}
              onChange={(e) => onFilterChange('startDate', e.target.value)}
              disabled={isDateRangeLoading}
            />
            {isDateRangeLoading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <RefreshCw className="h-3.5 w-3.5 text-blue-400 animate-spin" />
              </div>
            )}
          </div>
        </div>
        
        <ArrowRight className="h-3.5 w-3.5 text-neutral-500 mt-6" />
        
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-1 text-neutral-300 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-blue-400" />
            To
          </label>
          <div className="relative">
            <input 
              type="date" 
              id="endDate"
              className={`bg-neutral-700 text-white rounded-md px-3 py-1.5 text-sm border border-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500 ${isDateRangeLoading ? 'opacity-50' : ''}`}
              value={filters.endDate}
              onChange={(e) => onFilterChange('endDate', e.target.value)}
              disabled={isDateRangeLoading}
            />
            {isDateRangeLoading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <RefreshCw className="h-3.5 w-3.5 text-blue-400 animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar; 