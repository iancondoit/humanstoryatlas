import React from 'react';

interface StoryPreviewCardProps {
  title: string;
  snippet: string;
}

const StoryPreviewCard: React.FC<StoryPreviewCardProps> = ({ title, snippet }) => {
  return (
    <div className="bg-neutral-800 rounded-lg p-3 border border-neutral-700 hover:border-blue-500 transition-colors cursor-pointer">
      <h3 className="font-medium text-white">📰 <strong>{title}</strong></h3>
      <p className="text-neutral-300 text-sm mt-1"><em>{snippet}</em></p>
    </div>
  );
};

export default StoryPreviewCard; 