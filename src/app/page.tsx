"use client";

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Using direct window location instead of router for more reliable redirect
    window.location.href = '/jordi';
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Loading Human Story Atlas...</h1>
        <p className="text-neutral-400">Redirecting to the Jordi interface</p>
      </div>
    </div>
  );
} 