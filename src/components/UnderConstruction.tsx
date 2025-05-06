import React from 'react';
import { Construction, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface UnderConstructionProps {
  title?: string;
  message?: string;
}

const UnderConstruction: React.FC<UnderConstructionProps> = ({ 
  title = "This Section is Under Construction",
  message = "We're working on bringing you more amazing features. For now, check out Jordi for narrative discovery."
}) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center animate-fade-in">
      <div className="max-w-lg text-center p-8 relative">
        <div className="absolute -top-16 w-full flex justify-center">
          <div className="bg-amber-500/20 p-6 rounded-full border-2 border-amber-500/30 animate-pulse">
            <Construction className="h-12 w-12 text-amber-400" />
          </div>
        </div>
        
        <div className="bg-neutral-800/50 rounded-xl p-8 pt-16 border border-neutral-700 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
          <p className="text-neutral-300 mb-6">
            {message}
          </p>
          
          <Link 
            href="/jordi" 
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors group"
          >
            <span>Go to Jordi</span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction; 