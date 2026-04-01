'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import { useData } from '@/contexts/DataContext';
import RecipeCard from '@/components/recipe/RecipeCard';
import { CalendarX } from 'lucide-react';

interface ViewWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  plannerWeek: number; // 0 = Current, 1 = Next
  onStartCooking: (id: string) => void;
}

export default function ViewWeekModal({ isOpen, onClose, plannerWeek, onStartCooking }: ViewWeekModalProps) {
  const { mealPlan, recipes } = useData();

  const isNextWeek = plannerWeek === 1;
  const weekLabel = isNextWeek ? "Next Week" : "This Week";

  // Filter meal plan for the selected week
  const planKeys = Object.keys(mealPlan).filter(key => {
    const keyIsNext = key.startsWith('next_');
    return (isNextWeek && keyIsNext) || (!isNextWeek && !keyIsNext);
  });

  const uniqueRecipeIds = new Set<string>();
  const counts = { breakfast: 0, lunch: 0, dinner: 0 };

  planKeys.forEach(key => {
    const rawKey = isNextWeek ? key.replace('next_', '') : key;
    const parts = rawKey.split('_');
    const type = parts.slice(1).join('_');

    if (type === 'break') counts.breakfast++;
    else if (type === 'lunch') counts.lunch++;
    else if (type.startsWith('dinner')) counts.dinner++;
    
    if (mealPlan[key].id) uniqueRecipeIds.add(mealPlan[key].id);
  });

  const summaryParts = [];
  if (counts.breakfast) summaryParts.push(`${counts.breakfast} Breakfasts`);
  if (counts.lunch) summaryParts.push(`${counts.lunch} Lunches`);
  if (counts.dinner) summaryParts.push(`${counts.dinner} Dinners`);

  const summaryText = summaryParts.length 
    ? summaryParts.join(' • ')
    : `${uniqueRecipeIds.size} Items`;

  const weekRecipes = recipes.filter(r => uniqueRecipeIds.has(r.id));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${weekLabel}'s Recipes`} maxWidth="max-w-[1100px]">
      
      {planKeys.length === 0 ? (
        <div className="col-span-full text-center text-text-light p-8">
          <CalendarX className="mx-auto mb-4 opacity-50" size={48} />
          <p>Your schedule is clear.</p>
        </div>
      ) : (
        <>
          <div className="text-text-light font-semibold mb-6">
            <strong>Overview:</strong> {summaryText}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {weekRecipes.map(recipe => (
              <RecipeCard 
                key={recipe.id}
                recipe={recipe}
                multiplier={1.0}
                onUpdateMultiplier={() => {}} // Disabled in this view
                onView={() => {}} // Disabled in this view
                onEdit={() => {}} // Disabled in this view
                onDelete={() => {}} // Disabled in this view
                onAddToPlan={() => {}} // Disabled in this view
              />
            ))}
          </div>
        </>
      )}

      <div className="flex justify-end mt-8">
        <button 
          onClick={onClose}
          className="bg-hover-bg text-text-main border-none py-3 px-8 rounded-full font-semibold text-base hover:bg-border-color transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
