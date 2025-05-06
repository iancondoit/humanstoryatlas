"use client";

import React, { useEffect, useRef, useState } from 'react';
import { X, Users, Map, Building, Calendar } from 'lucide-react';
import { Entity, EntityDetails, EntityType } from '@/types/entity';
import { getEntityDetails } from '@/lib/discoveryUtils';

interface DiscoveryDrawerProps {
  entity?: Entity | null;
  isOpen: boolean;
  onClose: () => void;
  source?: string;
  startDate?: string;
  endDate?: string;
}

const getEntityIcon = (type: EntityType) => {
  switch (type) {
    case 'person':
      return <Users className="h-5 w-5 text-blue-400" />;
    case 'place':
      return <Map className="h-5 w-5 text-blue-400" />;
    case 'organization':
      return <Building className="h-5 w-5 text-blue-400" />;
    default:
      return null;
  }
};

export default function DiscoveryDrawer({ 
  entity, 
  isOpen, 
  onClose,
  source = '',
  startDate = '',
  endDate = ''
}: DiscoveryDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [entityDetails, setEntityDetails] = useState<EntityDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch entity details when entity changes
  useEffect(() => {
    if (!entity || !isOpen || !source || !startDate || !endDate) {
      return;
    }
    
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const details = await getEntityDetails(
          entity.name,
          entity.type,
          source,
          startDate,
          endDate
        );
        
        if (details) {
          setEntityDetails(details);
        }
      } catch (error) {
        console.error('Error fetching entity details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDetails();
  }, [entity, isOpen, source, startDate, endDate]);
  
  // Add escape key event listener
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !entity) {
    return null;
  }

  // Format dates for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div 
        ref={drawerRef}
        className="absolute top-0 right-0 h-full w-full md:w-[450px] bg-neutral-900 border-l border-neutral-800 shadow-xl transform transition-transform duration-300"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-center p-4 border-b border-neutral-800">
          <h2 className="text-2xl font-bold text-white">DISCOVERY DRAWER</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 transition-colors"
            aria-label="Close drawer"
          >
            <X className="h-6 w-6 text-neutral-400" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 overflow-y-auto h-[calc(100%-64px)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mb-4"></div>
              <p className="text-neutral-400">Loading entity information...</p>
            </div>
          ) : (
            <>
              {/* Entity Summary */}
              <section className="mb-6 border-b border-neutral-800 pb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Entity Summary</h3>
                <h2 className="text-3xl font-bold text-white mb-3">{entity.name}</h2>
                <div className="flex items-center gap-2 text-neutral-300 mb-2">
                  {getEntityIcon(entity.type)}
                  <span className="capitalize">{entity.type}</span>
                  <span className="ml-2">{entity.count} mentions</span>
                </div>
                {entityDetails && (
                  <div className="flex items-center gap-2 text-neutral-300">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    <span>
                      {entityDetails.firstSeen ? `First seen: ${formatDate(entityDetails.firstSeen)}` : ''}
                      {entityDetails.lastSeen ? ` • Last seen: ${formatDate(entityDetails.lastSeen)}` : ''}
                    </span>
                  </div>
                )}
              </section>

              {/* Associated Stories */}
              {entityDetails && entityDetails.associatedStories.length > 0 && (
                <section className="mb-6 border-b border-neutral-800 pb-6">
                  <h3 className="text-xl font-semibold text-white uppercase mb-4">ASSOCIATED STORIES</h3>
                  <div className="space-y-4">
                    {entityDetails.associatedStories.map(story => (
                      <div 
                        key={story.id} 
                        className="cursor-pointer hover:bg-neutral-800/50 p-3 rounded-lg transition-colors"
                        onClick={() => console.log('Story clicked:', story.id)}
                      >
                        <h4 className="text-lg font-medium text-white mb-1">{story.title}</h4>
                        <p className="text-neutral-400">{formatDate(story.date)}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Co-occurring Entities */}
              {entityDetails && entityDetails.coOccurringEntities.length > 0 && (
                <section className="mb-6 border-b border-neutral-800 pb-6">
                  <h3 className="text-xl font-semibold text-white uppercase mb-4">Co-occurring Entities</h3>
                  <div className="flex flex-wrap gap-2">
                    {entityDetails.coOccurringEntities.map((coEntity, index) => (
                      <button
                        key={index}
                        className="border border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 text-white px-4 py-2 rounded-full transition-colors"
                        onClick={() => console.log('Co-occurring entity clicked:', coEntity.name)}
                      >
                        {coEntity.name}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Related Keywords */}
              {entityDetails && entityDetails.relatedKeywords.length > 0 && (
                <section className="mb-8 border-b border-neutral-800 pb-6">
                  <h3 className="text-xl font-semibold text-white uppercase mb-4">Related Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {entityDetails.relatedKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-neutral-800/70 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-full transition-colors"
                      >
                        {keyword.term}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Action Buttons */}
              <section className="flex flex-col gap-3">
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                  onClick={() => console.log('Trace Narrative Arc clicked for:', entity.name)}
                >
                  Trace Narrative Arc
                </button>
                <button 
                  className="w-full bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-lg font-medium transition-colors"
                  onClick={() => console.log('Create Story Proposal clicked for:', entity.name)}
                >
                  Create Story Proposal
                </button>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 