import Link from 'next/link';
import { Globe } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <header className="mb-8 flex items-center justify-center">
          <Globe className="h-10 w-10 text-blue-500 mr-2" />
          <h1 className="text-3xl font-bold text-white">Human Story Atlas 🧬</h1>
          <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded-full ml-2">v2.1.1</span>
        </header>
        
        <div className="bg-neutral-800/50 rounded-xl p-8 border border-neutral-700/50">
          <h2 className="text-3xl font-bold text-white mb-4">404 - Page Not Found</h2>
          <p className="text-neutral-300 mb-6">
            The archive section you're looking for doesn't exist or has been moved to a different location.
          </p>
          
          <div className="bg-blue-900/20 border border-blue-900/30 p-4 rounded-lg mb-6">
            <p className="text-blue-300 text-sm">
              Try exploring our main archives or using the search function to find what you're looking for.
            </p>
          </div>
          
          <Link 
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
} 