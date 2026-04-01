'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import { Recipe } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Flame, Edit, Copy, Printer, Download } from 'lucide-react';

interface ViewRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  isFriend?: boolean;
  onStartCooking: (id: string) => void;
  onEdit?: (id: string) => void;
  onSaveToCookbook?: (id: string) => void;
}

export default function ViewRecipeModal({ 
  isOpen, 
  onClose, 
  recipe, 
  isFriend = false,
  onStartCooking,
  onEdit,
  onSaveToCookbook
}: ViewRecipeModalProps) {
  const { appCategories } = useData();

  if (!recipe) return null;

  const getCategoryColor = (catName: string) => {
    const found = appCategories.find(c => c.name === catName);
    return found ? found.color : '#7E8A8A';
  };

  const cats = Array.isArray(recipe.category) ? recipe.category : [recipe.category];
  const ingredientsList = (recipe.ingredients || '').split('\n').filter(l => l.trim());
  const instructionsList = (recipe.instructions || '').split('\n').filter(l => l.trim());

  const handleCopy = () => {
    const text = `${recipe.title}\n\nIngredients:\n${recipe.ingredients}\n\nInstructions:\n${recipe.instructions}`;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  const handlePrint = () => {
    const win = window.open('', '', 'height=600,width=800');
    if (win) {
      win.document.write(`<html><head><title>${recipe.title}</title></head><body><h1>${recipe.title}</h1><h3>Ingredients</h3><pre>${recipe.ingredients}</pre><h3>Instructions</h3><pre>${recipe.instructions}</pre></body></html>`);
      win.print();
      win.close();
    }
  };

  const headerTitle = (
    <div>
      <div className="flex gap-1.5 flex-wrap mb-2">
        {cats.map(c => (
          <span key={c} className="text-[0.65rem] font-bold uppercase px-2 py-1 rounded tracking-wide" style={{ backgroundColor: `${getCategoryColor(c)}20`, color: getCategoryColor(c) }}>
            {c}
          </span>
        ))}
      </div>
      <h2 className="font-serif text-[1.8rem] text-text-main m-0 leading-tight">{recipe.title}</h2>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={headerTitle}>
      
      <div className="flex flex-wrap gap-2.5 mb-6 border-b border-border-color pb-4">
        <button 
          onClick={() => { onClose(); onStartCooking(recipe.id); }}
          className="flex-1 min-w-[140px] bg-primary text-white border-none py-2 px-3 rounded-lg text-[0.8rem] font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors hover:bg-primary-dark"
        >
          <Flame size={16} /> Start Cooking
        </button>
        
        {isFriend && onSaveToCookbook ? (
          <button 
            onClick={() => { onSaveToCookbook(recipe.id); onClose(); }}
            className="flex-1 min-w-[140px] bg-accent text-white border-none py-2 px-3 rounded-lg text-[0.8rem] font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors hover:bg-opacity-90"
          >
            <Download size={16} /> Save to Cookbook
          </button>
        ) : (
          <button 
            onClick={() => { onClose(); onEdit?.(recipe.id); }}
            className="px-3 py-2 text-[0.85rem] rounded-lg border border-border-color bg-card-bg text-text-light font-semibold cursor-pointer transition-colors flex items-center gap-1.5 hover:border-primary hover:text-primary"
          >
            <Edit size={16} /> Edit
          </button>
        )}

        <button 
          onClick={handleCopy}
          className="px-3 py-2 text-[0.85rem] rounded-lg border border-border-color bg-card-bg text-text-light font-semibold cursor-pointer transition-colors flex items-center gap-1.5 hover:border-primary hover:text-primary"
        >
          <Copy size={16} /> Copy
        </button>
        <button 
          onClick={handlePrint}
          className="px-3 py-2 text-[0.85rem] rounded-lg border border-border-color bg-card-bg text-text-light font-semibold cursor-pointer transition-colors flex items-center gap-1.5 hover:border-primary hover:text-primary"
        >
          <Printer size={16} /> Print
        </button>
      </div>

      <div className="mb-5">
        <label className="block mb-2.5 font-semibold text-[0.85rem] uppercase text-text-light tracking-wide">Ingredients</label>
        <ul className="ml-6 leading-relaxed text-text-light list-disc">
          {ingredientsList.map((ing, i) => <li key={i} className="mb-1">{ing}</li>)}
        </ul>
      </div>

      <div className="mb-5">
        <label className="block mb-2.5 font-semibold text-[0.85rem] uppercase text-text-light tracking-wide">Instructions</label>
        <ul className="ml-6 leading-relaxed text-text-light list-disc">
          {instructionsList.map((inst, i) => <li key={i} className="mb-1">{inst}</li>)}
        </ul>
      </div>

      {recipe.notes && (
        <div className="mt-6 border-t border-dashed border-border-color pt-4">
          <label className="block mb-2.5 font-semibold text-[0.85rem] uppercase text-text-light tracking-wide">Notes</label>
          <div className="leading-relaxed text-text-main italic bg-slot-bg p-3 rounded-lg">
            {recipe.notes}
          </div>
        </div>
      )}

    </Modal>
  );
}
