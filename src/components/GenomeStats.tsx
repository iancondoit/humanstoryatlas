"use client";

import React, { useEffect, useState } from 'react';
import { Database, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GenomeStatsProps {
  compact?: boolean;
}

interface DatabaseStats {
  stories: number;
  arcs: number;
  sources: number;
  timePeriods: number;
  lastUpdated: string | null;
}

const GenomeStats: React.FC<GenomeStatsProps> = ({ compact = false }) => {
  const [stats, setStats] = useState<DatabaseStats>({
    stories: 0,
    arcs: 0,
    sources: 0,
    timePeriods: 0,
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
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 bg-neutral-800/30 p-4 rounded-lg shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-500">Database Status</p>
          {renderStatusIndicator()}
        </div>
        <p className="text-sm font-bold text-white">
          {status === 'connected' 
            ? (usingRealData ? 'Active' : 'Empty') 
            : (status === 'error' ? 'Error' : 'Connecting...')}
        </p>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs text-neutral-500">Stories</p>
        <p className="text-xl font-bold text-white">{stats.stories.toLocaleString()}</p>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs text-neutral-500">Narrative Arcs</p>
        <p className="text-xl font-bold text-white">{stats.arcs.toLocaleString()}</p>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs text-neutral-500">Sources</p>
        <p className="text-xl font-bold text-white">{stats.sources.toLocaleString()}</p>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs text-neutral-500">Time Periods</p>
        <p className="text-xl font-bold text-white">{stats.timePeriods.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default GenomeStats; 