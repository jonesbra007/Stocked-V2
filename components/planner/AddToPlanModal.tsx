'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Recipe } from '@/types';
import { useData } from '@/contexts/DataContext';
import PlannerGrid from './PlannerGrid';

interface AddToPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
}

export default function AddToPlanModal({ isOpen, onClose, recipe }: AddToPlanModalProps) {
  const { mealPlan, saveMealPlan } = useData();
  
  const [selectedWeek, setSelectedWeek] = useState<number>(0); // 0 = Current, 1 = Next

  const handleClose = () => {
    setSelectedWeek(0);
    onClose();
  };

  if (!recipe) return null;

  const handleSlotClick = async (day: string, type: string) => {
    const prefix = selectedWeek === 1 ? 'next_' : '';
    const key = `${prefix}${day}_${type}`;
    
    const newPlan = {
      ...mealPlan,
      [key]: { id: recipe.id, title: recipe.title }
    };
    
    await saveMealPlan(newPlan);
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Add "${recipe.title}" to Planner`} maxWidth="max-w-[1000px]">
      <div className="flex gap-2.5 mb-6 mt-2">
        <button 
          onClick={() => setSelectedWeek(0)}
          className={`px-5 py-2 rounded-full text-[0.85rem] font-semibold transition-colors ${selectedWeek === 0 ? 'bg-primary text-white shadow-[0_4px_10px_rgba(92,141,137,0.3)]' : 'bg-hover-bg text-text-light hover:bg-border-color'}`}
        >
          Current Week
        </button>
        <button 
          onClick={() => setSelectedWeek(1)}
          className={`px-5 py-2 rounded-full text-[0.85rem] font-semibold transition-colors ${selectedWeek === 1 ? 'bg-primary text-white shadow-[0_4px_10px_rgba(92,141,137,0.3)]' : 'bg-hover-bg text-text-light hover:bg-border-color'}`}
        >
          Next Week
        </button>
      </div>

      <div className="bg-bg-color p-2 rounded-xl">
        <p className="text-text-light text-sm mb-4 ml-2">Click any empty slot to add this recipe.</p>
        <PlannerGrid 
          plannerWeek={selectedWeek} 
          addModeRecipeId={recipe.id} 
          onSlotClick={handleSlotClick} 
        />
      </div>
    </Modal>
  );
}
