'use client';

import React from 'react';
import { Search, X, Edit2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

interface SearchAndFilterProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeFilter: string;
  setActiveFilter: (f: string) => void;
  totalCount: number;
  onManageCategories: () => void;
}

export default function SearchAndFilter({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  totalCount,
  onManageCategories
}: SearchAndFilterProps) {
  const { appCategories } = useData();

  return (
    <div className="mb-6">
      {/* Search Bar */}
      <div className="flex items-center bg-input-bg border border-border-color rounded-full px-5 py-2.5 mb-4 shadow-[0_2px_5px_rgba(0,0,0,0.02)] transition-all duration-200 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10 w-full md:w-1/4 min-w-[250px]">
        <Search className="text-text-light mr-3" size={18} />
        <input 
          type="text" 
          placeholder="Search recipes by name..." 
          className="border-none bg-transparent p-0 m-0 shadow-none text-base flex-grow focus:outline-none focus:ring-0 text-text-main"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="text-text-light hover:text-danger p-1"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex items-center justify-between gap-2.5 flex-nowrap overflow-visible">
        {/* Scrollable Pills */}
        <div className="flex gap-2.5 py-1 flex-grow overflow-x-auto md:flex-wrap md:overflow-visible scrollbar-hide" style={{
          maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)'
        }}>
          <button 
            onClick={() => setActiveFilter('All')}
            className={`flex-shrink-0 md:flex-shrink border-none px-5 py-2 rounded-full text-[0.85rem] font-semibold whitespace-nowrap cursor-pointer transition-colors duration-200 ${
              activeFilter === 'All' 
                ? 'bg-primary text-white shadow-[0_4px_10px_rgba(92,141,137,0.3)]' 
                : 'bg-hover-bg text-text-light hover:bg-border-color'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveFilter('Favorites')}
            className={`flex-shrink-0 md:flex-shrink border-none px-5 py-2 rounded-full text-[0.85rem] font-semibold whitespace-nowrap cursor-pointer transition-colors duration-200 flex items-center gap-1.5 ${
              activeFilter === 'Favorites' 
                ? 'bg-primary text-white shadow-[0_4px_10px_rgba(92,141,137,0.3)]' 
                : 'bg-hover-bg text-text-light hover:bg-border-color'
            }`}
          >
            <span className={activeFilter === 'Favorites' ? 'text-white' : 'text-text-light'}>♥</span> Favorites
          </button>
          
          {appCategories.map(cat => (
            <button 
              key={cat.name}
              onClick={() => setActiveFilter(cat.name)}
              className={`flex-shrink-0 md:flex-shrink border-none px-5 py-2 rounded-full text-[0.85rem] font-semibold whitespace-nowrap cursor-pointer transition-colors duration-200 ${
                activeFilter === cat.name 
                  ? 'bg-primary text-white shadow-[0_4px_10px_rgba(92,141,137,0.3)]' 
                  : 'bg-hover-bg text-text-light hover:bg-border-color'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-1 flex-shrink-0 ml-2.5">
          <span className="text-[0.85rem] text-text-light font-semibold whitespace-nowrap mr-2">
            {totalCount} Recipes
          </span>
          <button 
            onClick={onManageCategories}
            className="bg-transparent border-none cursor-pointer text-text-light text-base p-2 transition-colors duration-200 rounded-full hover:bg-hover-bg hover:text-primary"
            title="Manage Categories"
          >
            <Edit2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
