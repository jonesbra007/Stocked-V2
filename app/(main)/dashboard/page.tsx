'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'motion/react';
import { useData } from '@/contexts/DataContext';
import { LogOut, Plus } from 'lucide-react';
import SearchAndFilter from '@/components/recipe/SearchAndFilter';
import RecipeCard from '@/components/recipe/RecipeCard';
import RecipeFormModal from '@/components/recipe/RecipeFormModal';
import ManageCategoriesModal from '@/components/recipe/ManageCategoriesModal';
import ViewRecipeModal from '@/components/recipe/ViewRecipeModal';
import AddToPlanModal from '@/components/planner/AddToPlanModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Recipe } from '@/types';

export default function DashboardPage() {
  const { profile, logout } = useAuth();
  const { recipes, loadingData, deleteRecipe, setCookingRecipeId } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [multipliers, setMultipliers] = useState<Record<string, number>>({});

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddToPlanOpen, setIsAddToPlanOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleUpdateMultiplier = (id: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMultipliers(prev => {
      const current = prev[id] || 1.0;
      const next = Math.max(0.5, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Favorites') return r.favorite;
    const cats = Array.isArray(r.category) ? r.category : [r.category];
    return cats.includes(activeFilter);
  }).sort((a, b) => a.title.localeCompare(b.title));

  const handleView = (id: string) => {
    const r = recipes.find(x => x.id === id);
    if (r) {
      setSelectedRecipe(r);
      setIsViewOpen(true);
    }
  };

  const handleEdit = (id: string) => {
    const r = recipes.find(x => x.id === id);
    if (r) {
      setSelectedRecipe(r);
      setIsFormOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    setRecipeToDelete(id);
  };

  const confirmDelete = async () => {
    if (recipeToDelete) {
      await deleteRecipe(recipeToDelete);
      setRecipeToDelete(null);
    }
  };

  const handleAddToPlan = (id: string) => {
    const r = recipes.find(x => x.id === id);
    if (r) {
      setSelectedRecipe(r);
      setIsAddToPlanOpen(true);
    }
  };

  const handleStartCooking = (id: string) => {
    setCookingRecipeId(id);
  };

  return (
    <div className="relative min-h-[calc(100vh-120px)]">
      <SearchAndFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        totalCount={filteredRecipes.length}
        onManageCategories={() => setIsCatManagerOpen(true)}
      />

      {loadingData ? (
        <div className="text-center text-text-light py-8">Loading recipes...</div>
      ) : filteredRecipes.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-text-light py-12 bg-card-bg rounded-2xl border border-border-color shadow-sm mt-8"
        >
          <div className="text-4xl mb-4 opacity-50">🍽️</div>
          <h3 className="text-xl font-serif text-text-main mb-2">No recipes found</h3>
          <p className="text-[0.95rem]">Try adjusting your search or add a new recipe to get started.</p>
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {filteredRecipes.map(recipe => (
            <motion.div 
              key={recipe.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
              }}
            >
              <RecipeCard 
                recipe={recipe}
                multiplier={multipliers[recipe.id] || 1.0}
                onUpdateMultiplier={handleUpdateMultiplier}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddToPlan={handleAddToPlan}
                onStartCooking={handleStartCooking}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Floating Action Button */}
      <button 
        id="tour-add-recipe"
        className="fixed bottom-[calc(20px+var(--bottom-nav-height))] md:bottom-8 right-8 bg-primary text-white w-14 h-14 rounded-full text-2xl shadow-[0_4px_15px_rgba(92,141,137,0.4)] cursor-pointer flex items-center justify-center z-[200] transition-all duration-300 hover:scale-110 hover:rotate-90 hover:bg-primary-dark active:scale-95"
        onClick={() => { setSelectedRecipe(null); setIsFormOpen(true); }}
      >
        <Plus size={24} />
      </button>

      {/* Modals */}
      <RecipeFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        recipeToEdit={selectedRecipe} 
      />
      
      <ManageCategoriesModal 
        isOpen={isCatManagerOpen} 
        onClose={() => setIsCatManagerOpen(false)} 
      />
      
      <ViewRecipeModal 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        recipe={selectedRecipe}
        onStartCooking={handleStartCooking}
        onEdit={(id) => { setIsViewOpen(false); handleEdit(id); }}
      />

      <AddToPlanModal 
        isOpen={isAddToPlanOpen} 
        onClose={() => setIsAddToPlanOpen(false)} 
        recipe={selectedRecipe} 
      />

      <ConfirmModal
        isOpen={!!recipeToDelete}
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setRecipeToDelete(null)}
      />
    </div>
  );
}
