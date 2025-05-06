import React from 'react';

interface SuggestedPromptProps {
  prompt: string;
  onClick: () => void;
}

const SuggestedPrompt: React.FC<SuggestedPromptProps> = ({ prompt, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-neutral-700 hover:bg-neutral-600 text-neutral-200 px-3 py-1.5 rounded-full text-xs transition-colors"
    >
      {prompt}
    </button>
  );
};

export default SuggestedPrompt; 