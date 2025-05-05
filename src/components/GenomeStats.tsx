"use client";

import React, { useEffect, useState } from 'react';
import { Database, AlertCircle, Info, Calendar, Clock, Users, Globe, Network, BookOpen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GenomeStatsProps {
  compact?: boolean;
}

interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

interface DatabaseStats {
  stories: number;
  arcs: number;
  sources: number;
  timePeriods: number;
  entities: number;
  dateRange: DateRange;
  lastIngestTimestamp: string | null;
  lastUpdated: string | null;
}

const GenomeStats: React.FC<GenomeStatsProps> = ({ compact = false }) => {
  const [stats, setStats] = useState<DatabaseStats>({
    stories: 0,
    arcs: 0,
    sources: 0,
    timePeriods: 0,
    entities: 0,
    dateRange: { startDate: null, endDate: null },
    lastIngestTimestamp: null,
    lastUpdated: null
  });
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [usingRealData, setUsingRealData] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        const response = await fetch('/api/status');
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        let data;
        
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Failed to parse API response:', text);
          throw new Error('Invalid JSON response from API');
        }
        
        if (data) {
          setStats(data.stats);
          setStatus(data.status);
          setUsingRealData(data.usingRealData);
        } else {
          throw new Error('Empty response from API');
        }
      } catch (error) {
        console.error('Failed to fetch database status:', error);
        setStatus('error');
        setUsingRealData(false);
        setErrorMessage(error instanceof Error ? error.message : String(error));
      }
    };

    checkDatabaseStatus();
    
    // Set up polling every 30 seconds to keep status updated
    const interval = setInterval(checkDatabaseStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format date range
  const formatDateRange = () => {
    const { startDate, endDate } = stats.dateRange;
    if (!startDate || !endDate) return 'No data available';
    
    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();
    
    return `${startYear} – ${endYear}`;
  };

  // Determine the status icon and color
  const renderStatusIndicator = () => {
    switch (status) {
      case 'connected':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1">
                  <Database className={`h-4 w-4 ${usingRealData ? 'text-green-500' : 'text-yellow-500'}`} />
                  {!compact && (
                    <span className={`text-xs ${usingRealData ? 'text-green-500' : 'text-yellow-500'}`}>
                      {usingRealData ? 'Using DB' : 'Using Fallback'}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{usingRealData 
                  ? 'Database connected and using real data' 
                  : 'Database connected but using fallback data (no records found)'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'error':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  {!compact && <span className="text-xs text-red-500">DB Error</span>}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Database error: {errorMessage || 'Unknown error'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return (
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></div>
            {!compact && <span className="text-xs text-blue-400">Connecting...</span>}
          </div>
        );
    }
  };
  
  // Render a stat with tooltip
  const renderStat = (
    title: string, 
    value: string | number, 
    icon: React.ReactNode, 
    tooltipText: string
  ) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">{title}</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3 w-3 text-neutral-500 hover:text-neutral-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-xs">{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
  
  if (compact) {
    return (
      <div className="flex items-center gap-4">
        {renderStatusIndicator()}
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <span className="text-sm text-neutral-400">{stats.stories.toLocaleString()} stories</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-teal-500"></div>
          <span className="text-sm text-neutral-400">{stats.arcs.toLocaleString()} arcs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
          <span className="text-sm text-neutral-400">{stats.entities.toLocaleString()} entities</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-orange-400" />
          <span className="text-sm text-neutral-400">{formatDateRange()}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4 bg-neutral-800/30 p-4 rounded-lg shadow-sm">
      <div className="space-y-1 lg:col-span-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-500">Database Status</p>
          {renderStatusIndicator()}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-white">
            {status === 'connected' 
              ? (usingRealData ? 'Active' : 'Empty') 
              : (status === 'error' ? 'Error' : 'Connecting...')}
          </p>
          {stats.lastIngestTimestamp && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                    <Clock className="h-3 w-3" />
                    <span>Last updated: {formatTimestamp(stats.lastIngestTimestamp).split(',')[0]}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Last data import: {formatTimestamp(stats.lastIngestTimestamp)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      {renderStat(
        'Stories', 
        stats.stories.toLocaleString(), 
        <BookOpen className="h-4 w-4 text-blue-500" />, 
        'Total number of stories indexed from historical sources. Each story represents a distinct news article or document.'
      )}
      
      {renderStat(
        'Narrative Arcs', 
        stats.arcs.toLocaleString(), 
        <Network className="h-4 w-4 text-teal-500" />, 
        'Connected story patterns detected across the archive. Arcs reveal thematic, character, or event-based narratives.'
      )}
      
      {renderStat(
        'Named Entities', 
        stats.entities.toLocaleString(), 
        <Users className="h-4 w-4 text-indigo-500" />, 
        'People, places, organizations, and key concepts extracted from the stories. Entities form the nodes in the narrative network.'
      )}
      
      {renderStat(
        'Sources', 
        stats.sources.toLocaleString(), 
        <Globe className="h-4 w-4 text-amber-500" />, 
        'Distinct publications and data sources represented in the archive.'
      )}
      
      {renderStat(
        'Time Periods', 
        stats.timePeriods.toLocaleString(), 
        <Calendar className="h-4 w-4 text-orange-500" />, 
        'The number of distinct years covered in the archive.'
      )}
      
      <div className="space-y-1 lg:col-span-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-500">Coverage Period</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-neutral-500 hover:text-neutral-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">The full date range represented in the archive, from oldest to newest story.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-rose-500" />
            <p className="text-lg font-bold text-white">{formatDateRange()}</p>
          </div>
          <div className="flex justify-between text-xs text-neutral-400 mt-1">
            <span>{formatDate(stats.dateRange.startDate)}</span>
            <span>to</span>
            <span>{formatDate(stats.dateRange.endDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenomeStats; 