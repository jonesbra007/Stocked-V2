'use client';

import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Plus, X, Coffee, Sandwich, Drumstick, Utensils } from 'lucide-react';
import RecipeSelectorModal from './RecipeSelectorModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface PlannerGridProps {
  plannerWeek: number; // 0 = Current, 1 = Next
  addModeRecipeId?: string;
  onSlotClick?: (day: string, type: string) => void;
}

export default function PlannerGrid({ plannerWeek, addModeRecipeId, onSlotClick }: PlannerGridProps) {
  const { mealPlan, saveMealPlan } = useData();
  const [selectorContext, setSelectorContext] = useState<{ day: string, type: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mealToRemove, setMealToRemove] = useState<{ day: string, type: string } | null>(null);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const types = [
    { id: 'break', label: 'Break', icon: Coffee },
    { id: 'lunch', label: 'Lunch', icon: Sandwich },
    { id: 'dinner-main', label: 'Dinner', icon: Drumstick },
    { id: 'dinner-side', label: 'Side', icon: Utensils }
  ];

  const getAppTodayIndex = () => {
    const d = new Date();
    const jsDay = d.getDay(); // 0=Sun, 1=Mon...
    return (jsDay + 6) % 7;
  };

  const todayIdx = getAppTodayIndex();
  const isCurrentWeek = plannerWeek === 0;

  const handleRemoveMeal = async (day: string, type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (addModeRecipeId) return; // Disable remove in add mode
    setMealToRemove({ day, type });
  };

  const confirmRemoveMeal = async () => {
    if (!mealToRemove) return;
    const { day, type } = mealToRemove;
    const prefix = plannerWeek === 1 ? 'next_' : '';
    const key = `${prefix}${day}_${type}`;
    const newPlan = { ...mealPlan };
    delete newPlan[key];
    await saveMealPlan(newPlan);
    setMealToRemove(null);
  };

  const handleSelectMeal = async (id: string, title: string) => {
    if (!selectorContext) return;
    const { day, type } = selectorContext;
    const prefix = plannerWeek === 1 ? 'next_' : '';
    const key = `${prefix}${day}_${type}`;
    
    const newPlan = {
      ...mealPlan,
      [key]: { id, title }
    };
    
    await saveMealPlan(newPlan);
    setSelectorContext(null);
  };

  const handleDragStart = (e: React.DragEvent, key: string, id: string, title: string) => {
    if (addModeRecipeId) return;
    e.dataTransfer.setData("text/plain", JSON.stringify({ key, id, title, origin: 'planner' }));
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-hover-bg', 'border-primary', 'border-dashed', 'border-2');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-hover-bg', 'border-primary', 'border-dashed', 'border-2');
  };

  const handleDrop = async (e: React.DragEvent, targetDay: string, targetType: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-hover-bg', 'border-primary', 'border-dashed', 'border-2');
    if (addModeRecipeId) return;
    
    try {
      const dataStr = e.dataTransfer.getData("text/plain");
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      
      const prefix = plannerWeek === 1 ? 'next_' : '';
      const newKey = `${prefix}${targetDay}_${targetType}`;
      
      const newPlan = { ...mealPlan };
      
      if (data.origin === 'planner' && data.key && newPlan[data.key]) {
        delete newPlan[data.key];
      }
      
      newPlan[newKey] = { id: data.id, title: data.title };
      await saveMealPlan(newPlan);
    } catch (err) {
      console.error("Drop failed", err);
    } finally {
      setIsDragging(false);
    }
  };

  return (
    <>
      <div className="flex md:gap-2 overflow-x-auto mb-10 bg-card-bg p-4 md:p-6 rounded-2xl shadow-soft border border-border-color flex-col md:flex-row transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-dark">
        
        {/* Desktop Labels Column */}
        <div className="hidden md:flex flex-col min-w-[80px] gap-2">
          <div className="min-h-[45px] mb-2 border-b-2 border-transparent"></div>
          {types.map(t => {
            const Icon = t.icon;
            return (
              <div key={t.id} className="font-semibold flex flex-col items-center justify-center text-text-light text-[0.75rem] uppercase tracking-wide text-center h-[70px]">
                <Icon size={18} className="mb-1 text-primary opacity-70" />
                {t.label}
              </div>
            );
          })}
        </div>

        {/* Days Columns */}
        {days.map((dayLabel, dayIdx) => {
          const isToday = isCurrentWeek && dayIdx === todayIdx;
          
          return (
            <div 
              key={dayIdx} 
              className={`flex-1 min-w-[130px] flex flex-col gap-2 border-2 rounded-xl p-1 transition-colors mb-8 md:mb-0 md:border-b-0 border-b border-border-color pb-4 md:pb-1 ${isToday ? 'border-today-blue bg-today-blue/5' : 'border-transparent'}`}
            >
              <div className={`font-serif text-left md:text-center pb-2 md:pb-4 text-[1.4rem] md:text-[1.1rem] text-text-main md:border-b-2 md:border-bg-color mb-2 min-h-[45px] ${isToday ? 'md:bg-today-blue/10 md:border-transparent md:rounded-lg text-today-blue' : ''}`}>
                {dayLabel}
              </div>

              {types.map(t => {
                const prefix = plannerWeek === 1 ? 'next_' : '';
                const key = `${prefix}${dayIdx}_${t.id}`;
                const meal = mealPlan[key];

                return (
                  <div 
                    key={t.id}
                    onClick={() => {
                      if (onSlotClick) {
                        onSlotClick(dayIdx.toString(), t.id);
                      } else {
                        setSelectorContext({ day: dayIdx.toString(), type: t.id });
                      }
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, dayIdx.toString(), t.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-slot-bg border rounded-xl p-1 text-[0.8rem] relative transition-all duration-300 cursor-pointer flex justify-center items-center flex-col md:flex-col hover:bg-hover-bg group
                      md:h-[70px] md:p-1
                      h-auto min-h-[50px] mb-2 md:mb-0 flex-row md:justify-center justify-start px-3 md:px-1 text-left md:text-center
                      ${isDragging && !meal ? 'border-primary/40 border-dashed border-2 animate-pulse bg-primary/5' : 'border-transparent'}
                    `}
                  >
                    {/* Mobile Label */}
                    <div className="md:hidden w-[80px] text-[0.75rem] font-bold uppercase text-text-light tracking-wide flex-shrink-0">
                      {t.label}
                    </div>

                    {meal ? (
                      <div 
                        draggable
                        onDragStart={(e) => handleDragStart(e, key, meal.id, meal.title)}
                        className="bg-card-bg px-2.5 py-1.5 rounded-lg shadow-[0_2px_5px_rgba(0,0,0,0.05)] w-auto md:w-full h-auto md:h-full flex justify-between items-center border-l-4 border-primary cursor-grab active:cursor-grabbing font-medium text-[0.85rem] text-text-main flex-grow md:flex-grow-0 ml-0 md:ml-0 md:px-2 md:py-1 md:text-[0.8rem]"
                      >
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap">{meal.title}</span>
                        {!addModeRecipeId && (
                          <button 
                            onClick={(e) => handleRemoveMeal(dayIdx.toString(), t.id, e)}
                            className="bg-transparent border-none cursor-pointer text-[#D1D5DB] ml-1.5 transition-colors hover:text-accent"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-text-light text-[1.1rem] pointer-events-none transition-transform group-hover:text-primary group-hover:scale-125 ml-auto md:ml-0">
                        <Plus size={18} />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <RecipeSelectorModal 
        isOpen={!!selectorContext}
        onClose={() => setSelectorContext(null)}
        onSelect={handleSelectMeal}
      />

      <ConfirmModal
        isOpen={!!mealToRemove}
        title="Remove Meal"
        message="Are you sure you want to remove this meal from your plan?"
        confirmText="Remove"
        isDestructive={true}
        onConfirm={confirmRemoveMeal}
        onCancel={() => setMealToRemove(null)}
      />
    </>
  );
}
