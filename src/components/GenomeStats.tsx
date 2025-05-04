import React from 'react';

interface GenomeStatsProps {
  compact?: boolean;
}

const GenomeStats: React.FC<GenomeStatsProps> = ({ compact = false }) => {
  // Mock stats data
  const stats = {
    stories: 19824,
    arcs: 2145,
    sources: 12,
    lastUpdated: "Today"
  };
  
  if (compact) {
    return (
      <div className="flex items-center gap-4">
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-neutral-800/30 p-4 rounded-lg shadow-sm">
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
        <p className="text-xs text-neutral-500">Last Updated</p>
        <p className="text-xl font-bold text-white">{stats.lastUpdated}</p>
      </div>
    </div>
  );
};

export default GenomeStats; 