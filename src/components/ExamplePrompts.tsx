import React from 'react';
import { Lightbulb } from 'lucide-react';

interface ExamplePromptsProps {
  onPromptSelect: (prompt: string) => void;
}

const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ onPromptSelect }) => {
  const examplePrompts = [
    "Show me 5 stories that could become a true crime series",
    "Find a forgotten sports scandal in 1977",
    "Uncover hidden arcs about women leaders in the 1970s",
    "Bring back political crises from the oil boom",
    "Stories that feel like a forgotten HBO pilot",
    "Find cold war stories with unexpected heroes"
  ];
  
  return (
    <div className="space-y-3 p-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-medium text-neutral-300">Looking for narrative inspiration?</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {examplePrompts.map((prompt, index) => (
          <button
            key={index}
            className="text-sm bg-neutral-800/70 text-blue-300 border border-neutral-700/50 hover:bg-blue-900/20 hover:border-blue-800/30 hover:text-blue-200 px-3 py-1.5 rounded-md transition-colors"
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
