'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import { X, CheckCircle2, Circle, Play, Pause, RotateCcw, Bell } from 'lucide-react';
import Image from 'next/image';

const extractTimeInSeconds = (text: string): number | null => {
  const match = text.match(/(\d+)\s*(min|minute|minutes|hr|hour|hours|sec|second|seconds)/i);
  if (!match) return null;
  const val = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  if (unit.startsWith('hr') || unit.startsWith('hour')) return val * 3600;
  if (unit.startsWith('min')) return val * 60;
  if (unit.startsWith('sec')) return val;
  return null;
};

const StepTimer = ({ initialSeconds }: { initialSeconds: number }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            // Timer finished
            setIsActive(false);
            setIsFinished(true);
            if (audioRef.current) {
              audioRef.current.play().catch(e => console.log("Audio play failed:", e));
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const toggleTimer = () => {
    if (isFinished) {
      setSecondsLeft(initialSeconds);
      setIsFinished(false);
      setIsActive(true);
    } else {
      setIsActive(!isActive);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(initialSeconds);
    setIsFinished(false);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between transition-colors ${isFinished ? 'bg-red-50 border-red-200' : isActive ? 'bg-primary/10 border-primary/30' : 'bg-bg-color border-border-color'}`}>
      <div className="flex items-center gap-3">
        <div className={`font-mono text-2xl font-bold ${isFinished ? 'text-red-600 animate-pulse' : 'text-primary'}`}>
          {formatTime(secondsLeft)}
        </div>
        {isFinished && <Bell className="text-red-500 animate-bounce" size={20} />}
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); toggleTimer(); }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-primary text-white hover:bg-primary-dark' : isFinished ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-primary text-white hover:bg-primary-dark'}`}
        >
          {isActive ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); resetTimer(); }}
          className="w-10 h-10 rounded-full bg-hover-bg text-text-main flex items-center justify-center hover:bg-border-color transition-colors"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
};

export default function CookModeModal() {
  const { cookingRecipeId, setCookingRecipeId, recipes, saveRecipe } = useData();
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [activeStep, setActiveStep] = useState<number>(0);
  const [prevRecipeId, setPrevRecipeId] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const recipe = recipes.find(r => r.id === cookingRecipeId);

  // Reset state when a new recipe is opened
  if (cookingRecipeId !== prevRecipeId) {
    setPrevRecipeId(cookingRecipeId);
    if (cookingRecipeId) {
      setCheckedIngredients(new Set());
      setActiveStep(0);
      setIsEditingNotes(false);
      setNotes(recipe?.notes || '');
    }
  }

  // Update notes if recipe changes externally
  useEffect(() => {
    if (recipe && !isEditingNotes) {
      setNotes(recipe.notes || '');
    }
  }, [recipe, isEditingNotes]);

  const handleSaveNotes = async () => {
    if (!recipe) return;
    setIsEditingNotes(false);
    if (notes !== (recipe.notes || '')) {
      const { id, ...recipeData } = recipe;
      await saveRecipe({ ...recipeData, notes }, id);
    }
  };

  useEffect(() => {
    if (cookingRecipeId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [cookingRecipeId]);

  if (!cookingRecipeId || !recipe) return null;

  const ingredients = recipe.parsedIngredients && recipe.parsedIngredients.length > 0 
    ? recipe.parsedIngredients 
    : (recipe.ingredients || '').split('\n').filter(l => l.trim() !== '');

  const instructions = recipe.parsedInstructions && recipe.parsedInstructions.length > 0
    ? recipe.parsedInstructions
    : (recipe.instructions || '').split('\n').filter(l => l.trim() !== '');

  const toggleIngredient = (idx: number) => {
    const newSet = new Set(checkedIngredients);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    setCheckedIngredients(newSet);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-card-bg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-border-color bg-card-bg shadow-sm z-10">
        <h2 className="font-serif text-2xl md:text-3xl m-0 text-text-main truncate pr-4">
          {recipe.title}
        </h2>
        <button 
          onClick={() => setCookingRecipeId(null)}
          className="w-10 h-10 rounded-full bg-hover-bg flex items-center justify-center text-text-main border-none cursor-pointer hover:bg-border-color transition-all active:scale-95 flex-shrink-0"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Image & Ingredients */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {recipe.imageUrl && (
              <div className="relative w-full aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-md">
                <Image 
                  src={recipe.imageUrl} 
                  alt={recipe.title} 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            
            <div className="p-2">
              <h3 className="font-serif text-xl mb-4 text-text-main border-b border-border-color pb-2">
                Ingredients
              </h3>
              <div className="flex flex-col gap-3">
                {ingredients.map((ing, idx) => {
                  const isChecked = checkedIngredients.has(idx);
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-start gap-3 cursor-pointer group transition-all duration-300 ${isChecked ? 'opacity-50' : 'opacity-100'}`}
                      onClick={() => toggleIngredient(idx)}
                    >
                      <div className={`mt-0.5 flex-shrink-0 transition-all duration-300 ${isChecked ? 'text-primary scale-110' : 'text-text-light group-hover:text-primary group-active:scale-95'}`}>
                        {isChecked ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </div>
                      <span className={`text-[1.05rem] leading-snug transition-all duration-300 relative inline-block ${isChecked ? 'text-text-light' : 'text-text-main'}
                        after:content-[''] after:absolute after:left-0 after:top-1/2 after:h-[2px] after:bg-text-light after:transition-all after:duration-300
                        ${isChecked ? 'after:w-full' : 'after:w-0'}
                      `}>
                        {ing}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Instructions */}
          <div className="lg:col-span-8">
            <div className="p-2 h-full">
              <h3 className="font-serif text-2xl mb-6 text-text-main border-b border-border-color pb-3">
                Instructions
              </h3>
              <div className="flex flex-col gap-4">
                {instructions.map((step, idx) => {
                  const isActive = activeStep === idx;
                  const isPast = idx < activeStep;
                  const timeInSeconds = extractTimeInSeconds(step);
                  
                  return (
                    <div 
                      key={idx}
                      onClick={() => setActiveStep(idx)}
                      className={`
                        relative p-5 rounded-xl cursor-pointer transition-all duration-300 border-2
                        ${isActive 
                          ? 'bg-primary/5 border-primary shadow-sm scale-[1.02] z-10' 
                          : 'bg-transparent border-transparent hover:bg-hover-bg'
                        }
                        ${isPast ? 'opacity-60' : 'opacity-100'}
                      `}
                    >
                      <div className="flex gap-4">
                        <div className={`
                          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                          ${isActive ? 'bg-primary text-white scale-110 shadow-md' : 'bg-border-color text-text-main'}
                        `}>
                          {idx + 1}
                        </div>
                        <div className={`text-[1.1rem] leading-relaxed transition-colors duration-300 ${isActive ? 'text-text-main font-medium' : 'text-text-main'} flex-1`}>
                          {step}
                          {isActive && timeInSeconds && (
                            <StepTimer initialSeconds={timeInSeconds} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Notes Section */}
              <div className="mt-12 pt-8 border-t border-border-color">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-2xl text-text-main">Notes</h3>
                  {!isEditingNotes && (
                    <button 
                      onClick={() => setIsEditingNotes(true)}
                      className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>
                
                {isEditingNotes ? (
                  <div className="flex flex-col gap-3 animate-in fade-in duration-200">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes, tweaks, or ideas for next time..."
                      className="w-full min-h-[120px] p-4 rounded-xl border border-border-color bg-bg-color text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-y"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setNotes(recipe?.notes || '');
                          setIsEditingNotes(false);
                        }}
                        className="px-4 py-2 rounded-lg text-text-light hover:bg-hover-bg transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveNotes}
                        className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors font-medium"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsEditingNotes(true)}
                    className={`p-5 rounded-xl border-2 border-transparent hover:border-border-color hover:bg-hover-bg cursor-pointer transition-all ${!notes ? 'text-text-light italic' : 'text-text-main whitespace-pre-wrap'}`}
                  >
                    {notes || "Click to add notes..."}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
