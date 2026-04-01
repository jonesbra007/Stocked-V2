'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Recipe, Friend } from '@/types';
import RecipeCard from '@/components/recipe/RecipeCard';
import { ArrowLeft } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import ViewRecipeModal from '@/components/recipe/ViewRecipeModal';

export default function FriendCookbook({ friend, onBack }: { friend: Friend, onBack: () => void }) {
  const { saveRecipe } = useData();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [multipliers, setMultipliers] = useState<Record<string, number>>({});
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'users', friend.uid, 'recipes'));
        const fetchedRecipes: Recipe[] = [];
        snapshot.forEach(doc => {
          fetchedRecipes.push({ id: doc.id, ...doc.data() } as Recipe);
        });
        setRecipes(fetchedRecipes);
      } catch (error) {
        console.error("Error fetching friend's recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [friend.uid]);

  const handleUpdateMultiplier = (id: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMultipliers(prev => {
      const current = prev[id] || 1.0;
      const next = Math.max(0.5, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleSaveToCookbook = async (id: string) => {
    const recipeToSave = recipes.find(r => r.id === id);
    if (!recipeToSave) return;

    const { id: oldId, ...recipeData } = recipeToSave;
    
    // Create a new recipe in the current user's cookbook
    const newRecipe = {
      ...recipeData,
      id: Date.now().toString(), // Generate a new ID
      favorite: false
    };

    await saveRecipe(newRecipe);
    alert(`${recipeToSave.title} has been saved to your cookbook!`);
  };

  const handleView = (id: string) => {
    const r = recipes.find(x => x.id === id);
    if (r) {
      setSelectedRecipe(r);
      setIsViewOpen(true);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="bg-card-bg border border-border-color p-2 rounded-full text-text-light hover:text-primary hover:border-primary transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-serif text-3xl text-text-main m-0">{friend.firstName}&apos;s Cookbook</h2>
          <p className="text-text-light text-sm mt-1">{recipes.length} recipes</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-light">Loading recipes...</div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-12 text-text-light bg-card-bg rounded-2xl border border-border-color">
          {friend.firstName} hasn&apos;t added any recipes yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              multiplier={multipliers[recipe.id] || 1.0}
              onUpdateMultiplier={handleUpdateMultiplier}
              onView={handleView}
              isFriend={true}
              onSaveToCookbook={handleSaveToCookbook}
            />
          ))}
        </div>
      )}

      <ViewRecipeModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        recipe={selectedRecipe}
        isFriend={true}
        onSaveToCookbook={handleSaveToCookbook}
        onStartCooking={() => {}} // Not used for friends
      />
    </div>
  );
}
