'use client';

import React from 'react';
import { Recipe } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Star, Edit, Trash2, CalendarPlus, Minus, Plus } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  multiplier: number;
  onUpdateMultiplier: (id: string, delta: number, e: React.MouseEvent) => void;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddToPlan?: (id: string) => void;
  onStartCooking?: (id: string) => void;
  onSaveToCookbook?: (id: string) => void;
  isToday?: boolean;
  isFriend?: boolean;
}

export default function RecipeCard({
  recipe,
  multiplier,
  onUpdateMultiplier,
  onView,
  onEdit,
  onDelete,
  onAddToPlan,
  onStartCooking,
  onSaveToCookbook,
  isToday = false,
  isFriend = false
}: RecipeCardProps) {
  const { appCategories, toggleFavorite } = useData();

  // Helper to get category color
  const getCategoryColor = (catName: string) => {
    const found = appCategories.find(c => c.name === catName);
    return found ? found.color : '#7E8A8A';
  };

  // Helper to scale ingredients
  const scaleIngredientText = (text: string, factor: number) => {
    if (factor === 1) return text;
    const regex = /(^|[\s\(\-])(\d+(?:[\s\-]?\d+\/\d+)|(?:(?:\d+\/)?\d+(?:\.\d+)?))/g;
    return text.replace(regex, (fullMatch, prefix, numStr) => {
      let cleanNum = numStr.trim();
      let val = 0;
      try {
        if (cleanNum.includes('/')) {
          let parts = cleanNum.split(/\/|[\s\-]/).filter((x: string) => x.trim() !== '');
          if (parts.length === 2) {
            val = parseFloat(parts[0]) / parseFloat(parts[1]);
          } else if (parts.length === 3) {
            val = parseFloat(parts[0]) + (parseFloat(parts[1]) / parseFloat(parts[2]));
          } else { return fullMatch; }
        } else { val = parseFloat(cleanNum); }
        if (isNaN(val)) return fullMatch;
        let newVal = val * factor;
        let formatted = parseFloat(newVal.toFixed(2)); 
        return prefix + formatted;
      } catch(e) { return fullMatch; }
    });
  };

  const cats = Array.isArray(recipe.category) ? recipe.category : [recipe.category];
  const scaledIngredientsText = scaleIngredientText(recipe.ingredients || '', multiplier);
  
  const ingredientsList = scaledIngredientsText.split('\n').map(l => l.trim()).filter(l => l);
  const instructionsList = (recipe.instructions || '').split('\n').map(l => l.trim()).filter(l => l).map(l => l.replace(/^[\d\.\)\-\*\•\s]+/, ''));

  const baseServings = recipe.servings ? parseFloat(recipe.servings.toString()) : null;
  const calculatedServings = baseServings ? Math.round(baseServings * multiplier * 10) / 10 : null;

  return (
    <div className={`bg-card-bg rounded-2xl p-6 border-none shadow-soft relative transition-all duration-300 flex flex-col h-[420px] overflow-hidden hover:-translate-y-1 hover:shadow-soft-dark ${isToday ? 'border-2 border-today-blue shadow-[0_0_15px_rgba(92,141,137,0.2)]' : ''}`}>
      
      {isToday && (
        <div className="absolute top-0 right-5 bg-today-blue text-white text-[0.7rem] px-2 py-1 rounded-b-lg font-bold z-10 uppercase tracking-wide">
          Today&apos;s Meal
        </div>
      )}

      <div className="cursor-pointer flex-grow flex flex-col overflow-hidden relative" onClick={() => onView(recipe.id)}>
        
        {/* Header */}
        <div className="flex flex-col items-start mb-4">
          <div className="flex gap-1.5 flex-wrap mb-1">
            {cats.map(c => (
              <span key={c} className="text-[0.65rem] font-bold uppercase px-2 py-1 rounded tracking-wide" style={{ backgroundColor: `${getCategoryColor(c)}20`, color: getCategoryColor(c) }}>
                {c}
              </span>
            ))}
            {calculatedServings && (
              <span className="text-[0.65rem] font-bold uppercase px-2 py-1 rounded tracking-wide bg-hover-bg text-text-main flex items-center gap-1">
                <UsersIcon size={10} /> {calculatedServings}
              </span>
            )}
          </div>
          
          <div className="flex justify-between w-full items-start mt-1.5">
            <h3 className="font-serif text-[1.7rem] text-text-main leading-tight mr-2.5">{recipe.title}</h3>
            
            {/* Multiplier */}
            <div className="inline-flex items-center bg-[#F3F4F6] rounded-full p-0.5 border-none text-[0.8rem] font-semibold text-text-main flex-shrink-0 mt-1" onClick={(e) => e.stopPropagation()}>
              <button className="bg-transparent border-none w-6 h-6 rounded-full cursor-pointer flex items-center justify-center text-text-light transition-colors hover:bg-black/5 hover:text-primary" onClick={(e) => onUpdateMultiplier(recipe.id, -0.5, e)}>
                <Minus size={12} />
              </button>
              <div className="px-1 min-w-[28px] text-center">{multiplier}x</div>
              <button className="bg-transparent border-none w-6 h-6 rounded-full cursor-pointer flex items-center justify-center text-text-light transition-colors hover:bg-black/5 hover:text-primary" onClick={(e) => onUpdateMultiplier(recipe.id, 0.5, e)}>
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Details Preview */}
        <div className="text-[0.95rem] color-text-light mb-2 flex-grow overflow-hidden relative">
          <div className="font-bold text-[0.75rem] mb-1 uppercase text-text-main opacity-60 tracking-wide mt-2.5">Ingredients</div>
          <ul className="list-disc pl-5 m-0 mb-3 text-text-light text-[0.9rem] leading-relaxed">
            {ingredientsList.slice(0, 4).map((ing, i) => <li key={i} className="mb-1">{ing}</li>)}
            {ingredientsList.length > 4 && <li className="mb-1 italic">...and {ingredientsList.length - 4} more</li>}
          </ul>
          
          <div className="font-bold text-[0.75rem] mb-1 uppercase text-text-main opacity-60 tracking-wide">Instructions</div>
          <ol className="list-decimal pl-5 m-0 text-text-light text-[0.9rem] leading-relaxed">
            {instructionsList.slice(0, 2).map((inst, i) => <li key={i} className="mb-1">{inst}</li>)}
            {instructionsList.length > 2 && <li className="mb-1 italic">...and {instructionsList.length - 2} more steps</li>}
          </ol>
          
          {/* Fade out effect at bottom */}
          <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-card-bg to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-between items-center border-t border-dashed border-border-color pt-4 mt-2.5">
        {isFriend ? (
          <div className="flex gap-3 items-center w-full justify-end">
            {onSaveToCookbook && (
              <button 
                className="bg-primary text-white border-none cursor-pointer text-[0.75rem] font-bold uppercase tracking-wide px-3 py-1.5 rounded-md transition-all z-10 hover:bg-primary-dark active:scale-95 flex items-center gap-1.5" 
                onClick={() => onSaveToCookbook(recipe.id)}
              >
                <Plus size={14} /> Save to Cookbook
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex gap-3 items-center">
              {onAddToPlan && (
                <button className="bg-transparent border-none cursor-pointer text-text-light text-base transition-all z-10 hover:text-primary hover:scale-110" onClick={() => onAddToPlan(recipe.id)} title="Add to Plan">
                  <CalendarPlus size={18} />
                </button>
              )}
              {onEdit && (
                <button className="bg-transparent border-none cursor-pointer text-text-light text-base transition-all z-10 hover:text-primary hover:scale-110" onClick={() => onEdit(recipe.id)} title="Edit">
                  <Edit size={18} />
                </button>
              )}
              {onDelete && (
                <button className="bg-transparent border-none cursor-pointer text-text-light text-base transition-all z-10 hover:text-danger hover:scale-110" onClick={() => onDelete(recipe.id)} title="Delete">
                  <Trash2 size={18} />
                </button>
              )}
              {onStartCooking && (
                <button 
                  className="bg-primary/10 text-primary border-none cursor-pointer text-[0.75rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md transition-all z-10 hover:bg-primary hover:text-white ml-2 active:scale-95" 
                  onClick={() => onStartCooking(recipe.id)}
                >
                  Cook
                </button>
              )}
            </div>
            
            <button 
              className={`bg-transparent border-none cursor-pointer text-[1.2rem] z-10 transition-colors absolute top-0 right-0 p-3 ${recipe.favorite ? 'text-[#F59E0B]' : 'text-[#D1D5DB] hover:text-[#F59E0B]'}`}
              onClick={() => toggleFavorite(recipe.id)}
            >
              <Star size={20} fill={recipe.favorite ? "currentColor" : "none"} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Helper icon
function UsersIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}
