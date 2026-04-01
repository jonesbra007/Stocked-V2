'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { useData } from '@/contexts/DataContext';
import { Recipe } from '@/types';
import { extractRecipeFromText, parseIngredientsWithAI } from '@/lib/ai';
import { FileDown, Mic, Loader2 } from 'lucide-react';

interface RecipeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeToEdit?: Recipe | null;
}

export default function RecipeFormModal({ isOpen, onClose, recipeToEdit }: RecipeFormModalProps) {
  const { appCategories, saveRecipe } = useData();
  
  const [title, setTitle] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  
  const [aiInput, setAiInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (recipeToEdit) {
        setTitle(recipeToEdit.title);
        setServings(recipeToEdit.servings?.toString() || '');
        setIngredients(recipeToEdit.ingredients || '');
        setInstructions(recipeToEdit.instructions || '');
        setNotes(recipeToEdit.notes || '');
        setSelectedCats(Array.isArray(recipeToEdit.category) ? recipeToEdit.category : [recipeToEdit.category]);
      } else {
        setTitle('');
        setServings('');
        setIngredients('');
        setInstructions('');
        setNotes('');
        setSelectedCats([]);
        setAiInput('');
      }
    }
  }, [isOpen, recipeToEdit]);

  const handleAiImport = async () => {
    if (!aiInput.trim()) return alert("Please enter text or URL first.");
    setIsProcessing(true);
    try {
      const data = await extractRecipeFromText(aiInput);
      if (data.title) setTitle(data.title);
      if (data.ingredients) setIngredients(data.ingredients);
      if (data.instructions) setInstructions(data.instructions);
      if (data.servings) setServings(data.servings.toString());
      if (data.cuisine) {
        setSelectedCats([data.cuisine]);
      }
      setAiInput('');
    } catch (e) {
      console.error(e);
      alert("AI processing failed. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleCategory = (catName: string) => {
    setSelectedCats(prev => 
      prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
    );
  };

  const handleSave = async () => {
    if (!title) return alert("Title required");
    setIsSaving(true);
    try {
      const parsed = await parseIngredientsWithAI(ingredients);
      const category = selectedCats.length > 0 ? selectedCats : ["Other"];
      
      const recipeData = {
        title,
        servings,
        ingredients,
        parsedIngredients: parsed,
        instructions,
        notes,
        category,
        favorite: recipeToEdit ? recipeToEdit.favorite : false
      };

      await saveRecipe(recipeData, recipeToEdit?.id);
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to save recipe");
    } finally {
      setIsSaving(false);
    }
  };

  // Basic dictation placeholder (Web Speech API)
  const handleDictation = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported in this browser.");
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setter(prev => prev ? prev + ' ' + transcript : transcript);
    };
    
    recognition.start();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={recipeToEdit ? "Edit Recipe" : "Add Recipe"}>
      
      {/* AI Import Section */}
      <div className="bg-slot-bg p-4 rounded-xl mb-6 border border-dashed border-primary">
        <div className="relative w-full">
          <textarea 
            rows={1} 
            placeholder="Paste recipe text or URL..." 
            className="w-full p-3 pr-10 border border-border-color rounded-lg bg-input-bg font-sans text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 resize-none"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
          />
          <button 
            onClick={handleAiImport}
            disabled={isProcessing}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-[1.1rem] text-text-light cursor-pointer transition-all z-10 hover:text-primary hover:scale-110 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <FileDown size={20} />}
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="flex gap-4 mb-5">
        <div className="flex-1">
          <label className="block mb-2 font-semibold text-[0.85rem] uppercase text-text-light tracking-wide">Title</label>
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="e.g. Grandma's Lasagna" 
              className="w-full p-3 pr-10 border border-border-color rounded-lg bg-input-bg font-sans text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button onClick={() => handleDictation(setTitle)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-[1.1rem] text-text-light cursor-pointer transition-all z-10 hover:text-primary hover:scale-110">
              <Mic size={18} />
            </button>
          </div>
        </div>
        <div className="w-[100px]">
          <label className="block mb-2 font-semibold text-[0.85rem] uppercase text-text-light tracking-wide">Servings</label>
          <input 
            type="number" 
            placeholder="4" 
            className="w-full p-3 border border-border-color rounded-lg bg-input-bg font-sans text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-5">
        <label className="block mb-2 font-semibold text-[0.85rem] uppercase text-text-light tracking-wide">Cuisine Style (Select multiple)</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {appCategories.map(cat => (
            <div 
              key={cat.name}
              onClick={() => toggleCategory(cat.name)}
              className={`px-3 py-1.5 border rounded-full cursor-pointer text-[0.85rem] transition-colors flex items-center gap-1.5 ${
                selectedCats.includes(cat.name) 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-input-bg text-text-main border-border-color hover:bg-hover-bg'
              }`}
            >
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: cat.color }}></span>
              {cat.name}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <label className="block mb-2 font-semibold text-[0.85rem] uppercase text-text-light tracking-wide">Ingredients (one per line)</label>
        <div className="relative w-full">
          <textarea 
            rows={4} 
            placeholder="2 Eggs&#10;1 cup Flour" 
            className="w-full p-3 pr-10 border border-border-color rounded-lg bg-input-bg font-sans text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
          <button onClick={() => handleDictation(setIngredients)} className="absolute right-3 top-5 bg-transparent border-none text-[1.1rem] text-text-light cursor-pointer transition-all z-10 hover:text-primary hover:scale-110">
            <Mic size={18} />
          </button>
        </div>
      </div>

      <div className="mb-5">
        <label className="block mb-2 font-semibold text-[0.85rem] uppercase text-text-light tracking-wide">Instructions</label>
        <div className="relative w-full">
          <textarea 
            rows={6} 
            placeholder="1. Mix ingredients...&#10;2. Bake at 350..." 
            className="w-full p-3 pr-10 border border-border-color rounded-lg bg-input-bg font-sans text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
          <button onClick={() => handleDictation(setInstructions)} className="absolute right-3 top-5 bg-transparent border-none text-[1.1rem] text-text-light cursor-pointer transition-all z-10 hover:text-primary hover:scale-110">
            <Mic size={18} />
          </button>
        </div>
      </div>

      <div className="mb-5">
        <label className="block mb-2 font-semibold text-[0.85rem] uppercase text-text-light tracking-wide">Notes</label>
        <div className="relative w-full">
          <textarea 
            rows={3} 
            placeholder="Family loves it extra spicy..." 
            className="w-full p-3 pr-10 border border-border-color rounded-lg bg-input-bg font-sans text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button onClick={() => handleDictation(setNotes)} className="absolute right-3 top-5 bg-transparent border-none text-[1.1rem] text-text-light cursor-pointer transition-all z-10 hover:text-primary hover:scale-110">
            <Mic size={18} />
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button 
          onClick={onClose}
          className="bg-hover-bg text-text-main border-none py-3 px-8 rounded-full font-semibold text-base hover:bg-border-color transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-white border-none py-3 px-8 rounded-full font-semibold text-base hover:bg-primary-dark hover:shadow-[0_4px_12px_rgba(92,141,137,0.3)] transition-all disabled:opacity-70 flex items-center gap-2"
        >
          {isSaving && <Loader2 className="animate-spin" size={18} />}
          Save Recipe
        </button>
      </div>
    </Modal>
  );
}
