"use client";

import React from 'react';
import { X, User, MapPin, Building, Tag, Calendar } from 'lucide-react';
import { EntityType } from '@/types/entity';

export type FilterChipType = 'entity' | 'keyword' | 'theme' | 'date';

interface FilterChipProps {
  type: FilterChipType;
  label: string;
  entityType?: EntityType;
  onRemove?: () => void;
  onClick?: () => void;
  interactive?: boolean;
}

export default function FilterChip({ 
  type, 
  label, 
  entityType,
  onRemove,
  onClick,
  interactive = true
}: FilterChipProps) {
  // Determine icon based on filter type
  const getIcon = () => {
    switch (type) {
      case 'entity':
        switch (entityType) {
          case 'person':
            return <User className="h-3.5 w-3.5 text-blue-400" />;
          case 'place':
            return <MapPin className="h-3.5 w-3.5 text-blue-400" />;
          case 'organization':
            return <Building className="h-3.5 w-3.5 text-blue-400" />;
          default:
            return <Tag className="h-3.5 w-3.5 text-blue-400" />;
        }
      case 'keyword':
        return <Tag className="h-3.5 w-3.5 text-blue-400" />;
      case 'theme':
        return <Tag className="h-3.5 w-3.5 text-blue-400" />;
      case 'date':
        return <Calendar className="h-3.5 w-3.5 text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={`
        flex items-center gap-1 px-3 py-1.5 bg-neutral-800 rounded-full text-white text-sm
        ${interactive ? 'hover:bg-neutral-700 transition-colors cursor-pointer' : ''}
      `}
      onClick={interactive ? onClick : undefined}
    >
      {getIcon()}
      <span>{label}</span>
      {onRemove && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 rounded-full hover:bg-neutral-700 p-0.5"
          aria-label="Remove filter"
        >
          <X className="h-3 w-3 text-neutral-400" />
        </button>
      )}
    </div>
  );
} 