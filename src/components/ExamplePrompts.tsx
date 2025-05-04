import React from 'react';
import { Button } from '@/components/ui/button';

interface ExamplePromptsProps {
  onPromptSelect: (prompt: string) => void;
}

const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ onPromptSelect }) => {
  const examplePrompts = [
    "Oil crisis 1979",
    "Watergate scandal",
    "Apollo moon landing",
    "Vietnam War peace talks"
  ];
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-neutral-400">Try these examples:</h3>
      <div className="flex flex-wrap gap-2">
        {examplePrompts.map((prompt, index) => (
          <button
            key={index}
            className="text-xs bg-neutral-800/50 text-neutral-300 border border-neutral-700 hover:bg-neutral-700 hover:text-white px-3 py-1 rounded-md"
            onClick={() => onPromptSelect(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExamplePrompts;
