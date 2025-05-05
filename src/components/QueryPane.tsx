"use client";

import React, { useEffect, useRef, useState } from 'react';
import { X, Search, Plus, Calendar, Clock, Tag, User, MapPin, Building } from 'lucide-react';
import { Entity, EntityType } from '@/types/entity';

interface FilterItem {
  type: 'entity' | 'keyword' | 'theme' | 'date';
  value: string;
  label?: string;
  entityType?: EntityType;
}

interface QueryPaneProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilter?: FilterItem;
  onRunQuery: (filters: FilterItem[]) => void;
}

export default function QueryPane({ 
  isOpen, 
  onClose, 
  initialFilter,
  onRunQuery
}: QueryPaneProps) {
  const paneRef = useRef<HTMLDivElement>(null);
  const [queryString, setQueryString] = useState('');
  const [filters, setFilters] = useState<FilterItem[]>([]);
  const [isAddingFilter, setIsAddingFilter] = useState(false);
  const [newFilterType, setNewFilterType] = useState<FilterItem['type']>('keyword');
  const [newFilterValue, setNewFilterValue] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [animationState, setAnimationState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  
  // Control animation states based on isOpen prop
  useEffect(() => {
    if (isOpen && animationState === 'closed') {
      setAnimationState('opening');
      setTimeout(() => setAnimationState('open'), 50); // Trigger animation
    } else if (!isOpen && (animationState === 'open' || animationState === 'opening')) {
      setAnimationState('closing');
      setTimeout(() => setAnimationState('closed'), 300); // Match transition duration
    }
  }, [isOpen, animationState]);
  
  // Initialize with the initial filter if provided
  useEffect(() => {
    if (initialFilter && isOpen) {
      setFilters([initialFilter]);
      
      // Generate initial query string based on filter type
      let initialQuery = '';
      switch (initialFilter.type) {
        case 'entity':
          initialQuery = `Stories about ${initialFilter.value}`;
          break;
        case 'keyword':
          initialQuery = `Stories containing "${initialFilter.value}"`;
          break;
        case 'theme':
          initialQuery = `Stories related to ${initialFilter.value}`;
          break;
        case 'date':
          initialQuery = `Stories from ${initialFilter.value}`;
          break;
      }
      setQueryString(initialQuery);
    }
  }, [initialFilter, isOpen]);
  
  // Close on escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (paneRef.current && !paneRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handlers
  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleAddFilter = () => {
    if (newFilterType === 'date') {
      if (dateRange.start && dateRange.end) {
        setFilters([...filters, {
          type: 'date',
          value: `${dateRange.start} to ${dateRange.end}`,
          label: `${formatDate(dateRange.start)} to ${formatDate(dateRange.end)}`
        }]);
        setDateRange({ start: '', end: '' });
      }
    } else if (newFilterValue) {
      setFilters([...filters, {
        type: newFilterType,
        value: newFilterValue,
      }]);
      setNewFilterValue('');
    }
    setIsAddingFilter(false);
  };

  const handleRunQuery = () => {
    onRunQuery(filters);
    // Don't close the pane after running the query, let the user refine if needed
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get icon for filter type
  const getFilterIcon = (type: FilterItem['type'], entityType?: EntityType) => {
    switch (type) {
      case 'entity':
        switch (entityType) {
          case 'person':
            return <User className="h-4 w-4 text-blue-400" />;
          case 'place':
            return <MapPin className="h-4 w-4 text-blue-400" />;
          case 'organization':
            return <Building className="h-4 w-4 text-blue-400" />;
          default:
            return <Tag className="h-4 w-4 text-blue-400" />;
        }
      case 'keyword':
        return <Tag className="h-4 w-4 text-blue-400" />;
      case 'theme':
        return <Tag className="h-4 w-4 text-blue-400" />;
      case 'date':
        return <Calendar className="h-4 w-4 text-blue-400" />;
      default:
        return null;
    }
  };

  // Don't render anything when closed
  if (animationState === 'closed') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with opacity animation */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          animationState === 'opening' || animationState === 'open' ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      ></div>
      
      {/* Query Pane */}
      <div 
        ref={paneRef}
        className={`absolute top-0 right-0 h-full w-full md:w-[450px] bg-neutral-900 border-l border-neutral-800 shadow-xl transform transition-transform duration-300 ease-out ${
          animationState === 'opening' || animationState === 'open' ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Pane Header */}
        <div className="flex justify-between items-center p-4 border-b border-neutral-800">
          <h2 className="text-2xl font-bold text-white">QUERY PANE</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 transition-colors"
            aria-label="Close pane"
          >
            <X className="h-6 w-6 text-neutral-400" />
          </button>
        </div>

        {/* Pane Content */}
        <div className="p-6 overflow-y-auto h-[calc(100%-64px)]">
          {/* Query Input */}
          <section className="mb-6 pb-6 border-b border-neutral-800">
            <h3 className="text-xl font-semibold text-white mb-4">Query Input</h3>
            <div className="relative">
              <input
                type="text"
                value={queryString}
                onChange={(e) => setQueryString(e.target.value)}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your query..."
              />
            </div>
          </section>

          {/* Applied Filters */}
          <section className="mb-6 pb-6 border-b border-neutral-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Applied Filters</h3>
              <button 
                onClick={() => setIsAddingFilter(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Filter
              </button>
            </div>
            
            {filters.length === 0 ? (
              <p className="text-neutral-400 text-sm">No filters applied. Add a filter to refine your query.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filters.map((filter, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-1 px-3 py-1.5 bg-neutral-800 rounded-full text-white text-sm"
                  >
                    {getFilterIcon(filter.type, filter.entityType)}
                    <span>{filter.label || filter.value}</span>
                    <button 
                      onClick={() => handleRemoveFilter(index)}
                      className="ml-1.5 rounded-full hover:bg-neutral-700 p-0.5"
                      aria-label="Remove filter"
                    >
                      <X className="h-3.5 w-3.5 text-neutral-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Filter Form */}
            {isAddingFilter && (
              <div className="mt-4 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                <div className="flex gap-2 mb-3">
                  <select 
                    value={newFilterType}
                    onChange={(e) => setNewFilterType(e.target.value as FilterItem['type'])}
                    className="bg-neutral-700 text-white rounded-md px-3 py-1.5 text-sm border border-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="keyword">Keyword</option>
                    <option value="entity">Entity</option>
                    <option value="theme">Theme</option>
                    <option value="date">Date Range</option>
                  </select>
                </div>

                {newFilterType === 'date' ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-300 text-sm">From:</span>
                      <input 
                        type="date" 
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        className="bg-neutral-700 text-white rounded-md px-3 py-1.5 text-sm border border-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-300 text-sm">To:</span>
                      <input 
                        type="date" 
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        className="bg-neutral-700 text-white rounded-md px-3 py-1.5 text-sm border border-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={newFilterValue}
                    onChange={(e) => setNewFilterValue(e.target.value)}
                    className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder={`Enter ${newFilterType}...`}
                  />
                )}

                <div className="flex justify-end gap-2 mt-3">
                  <button 
                    onClick={() => setIsAddingFilter(false)}
                    className="px-3 py-1.5 text-sm bg-neutral-700 hover:bg-neutral-600 rounded-md text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddFilter}
                    className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
                    disabled={newFilterType === 'date' ? !dateRange.start || !dateRange.end : !newFilterValue}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Timeline Preview (Optional) */}
          <section className="mb-6 pb-6 border-b border-neutral-800">
            <h3 className="text-xl font-semibold text-white mb-4">Timeline Preview</h3>
            <div className="h-12 bg-neutral-800/50 rounded-lg flex items-center justify-center">
              <span className="text-neutral-400 text-sm">Timeline preview will appear here</span>
            </div>
          </section>

          {/* Suggested Queries (Optional) */}
          <section className="mb-6 pb-6 border-b border-neutral-800">
            <h3 className="text-xl font-semibold text-white mb-4">Suggested Queries</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 text-sm bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white transition-colors">
                Find related entities
              </button>
              <button className="w-full text-left px-4 py-2 text-sm bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white transition-colors">
                Show most relevant stories
              </button>
              <button className="w-full text-left px-4 py-2 text-sm bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white transition-colors">
                Trace narrative over time
              </button>
            </div>
          </section>

          {/* Run Query Button */}
          <section>
            <button 
              onClick={handleRunQuery}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              disabled={filters.length === 0}
            >
              <Search className="h-5 w-5" />
              Run Query
            </button>
          </section>
        </div>
      </div>
    </div>
  );
} 