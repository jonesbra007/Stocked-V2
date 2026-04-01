'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useData } from '@/contexts/DataContext';
import { Search } from 'lucide-react';

interface RecipeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string, title: string) => void;
}

export default function RecipeSelectorModal({ isOpen, onClose, onSelect }: RecipeSelectorModalProps) {
  const { recipes, appCategories } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === 'All') return true;
    const cats = Array.isArray(r.category) ? r.category : [r.category];
    return cats.includes(activeFilter);
  }).sort((a, b) => a.title.localeCompare(b.title));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select a Meal">
      <div className="flex items-center bg-input-bg border border-border-color rounded-full px-4 py-2 mb-4 shadow-[0_2px_5px_rgba(0,0,0,0.02)] focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10">
        <Search className="text-text-light mr-3" size={18} />
        <input 
          type="text" 
          placeholder="Search recipes..." 
          className="border-none bg-transparent p-0 m-0 shadow-none text-base flex-grow focus:outline-none text-text-main"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-2.5 py-1 mb-4 overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => setActiveFilter('All')}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[0.85rem] font-semibold transition-colors ${activeFilter === 'All' ? 'bg-primary text-white shadow-[0_4px_10px_rgba(92,141,137,0.3)]' : 'bg-hover-bg text-text-light hover:bg-border-color'}`}
        >
          All
        </button>
        {appCategories.map(cat => (
          <button 
            key={cat.name}
            onClick={() => setActiveFilter(cat.name)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[0.85rem] font-semibold transition-colors ${activeFilter === cat.name ? 'bg-primary text-white shadow-[0_4px_10px_rgba(92,141,137,0.3)]' : 'bg-hover-bg text-text-light hover:bg-border-color'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <ul className="list-none mt-4 p-0 max-h-[40vh] overflow-y-auto">
        {filteredRecipes.length === 0 ? (
          <li className="p-4 text-center text-text-light">No recipes found.</li>
        ) : (
          filteredRecipes.map(r => (
            <li 
              key={r.id}
              onClick={() => onSelect(r.id, r.title)}
              className="p-4 border-b border-border-color cursor-pointer flex justify-between items-center transition-all rounded-lg text-text-main hover:bg-slot-bg hover:text-primary hover:pl-6 last:border-b-0"
            >
              <span className="font-medium">{r.title}</span>
            </li>
          ))
        )}
      </ul>

      <div className="flex justify-end mt-6">
        <button 
          onClick={onClose}
          className="bg-hover-bg text-text-main border-none py-2.5 px-6 rounded-full font-semibold text-sm hover:bg-border-color transition-colors"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
