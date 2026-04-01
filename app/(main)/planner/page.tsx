'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useData } from '@/contexts/DataContext';
import { ChevronLeft, ChevronRight, Layers, Trash2 } from 'lucide-react';
import PlannerGrid from '@/components/planner/PlannerGrid';
import ViewWeekModal from '@/components/planner/ViewWeekModal';
import InventoryList from '@/components/grocery/InventoryList';
import GroceryList from '@/components/grocery/GroceryList';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function PlannerPage() {
  const { clearWeeklyPlan, setCookingRecipeId } = useData();
  const [plannerWeek, setPlannerWeek] = useState<number>(0); // 0 = Current, 1 = Next
  const [isViewWeekOpen, setIsViewWeekOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  const handleClearWeek = async () => {
    setIsConfirmClearOpen(true);
  };

  const confirmClearWeek = async () => {
    await clearWeeklyPlan(plannerWeek);
    setIsConfirmClearOpen(false);
  };

  return (
    <div className="relative min-h-[calc(100vh-120px)]">
      <div className="flex flex-wrap justify-between items-center mb-6 border-b border-border-color pb-4 gap-2.5">
        
        <div className="flex items-center gap-2.5">
          <h2 className="font-serif text-3xl text-text-main m-0">
            Weekly Plan 
            <span className="text-[0.6em] opacity-70 align-middle font-sans font-normal ml-2">
              ({plannerWeek === 0 ? 'Current' : 'Next Week'})
            </span>
          </h2>
          <button 
            onClick={() => setPlannerWeek(0)}
            className="px-2.5 py-1.5 text-[0.85rem] rounded-lg border border-[#D1D5DB] bg-card-bg text-text-light font-semibold cursor-pointer transition-all flex items-center gap-1.5 hover:border-primary hover:text-primary active:scale-95"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => setPlannerWeek(1)}
            className="px-2.5 py-1.5 text-[0.85rem] rounded-lg border border-[#D1D5DB] bg-card-bg text-text-light font-semibold cursor-pointer transition-all flex items-center gap-1.5 hover:border-primary hover:text-primary active:scale-95"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex gap-2.5 items-center">
          <button 
            onClick={() => setIsViewWeekOpen(true)}
            className="px-3 py-2 text-[0.85rem] rounded-lg border border-[#D1D5DB] bg-card-bg text-text-light font-semibold cursor-pointer transition-all flex items-center gap-1.5 hover:border-primary hover:text-primary active:scale-95"
          >
            <Layers size={16} /> View Week
          </button>
          <button 
            onClick={handleClearWeek}
            className="px-3 py-2 text-[0.85rem] rounded-lg border border-[#D1D5DB] bg-card-bg text-text-light font-semibold cursor-pointer transition-all flex items-center gap-1.5 hover:border-primary hover:text-primary active:scale-95"
          >
            <Trash2 size={16} /> Clear Week
          </button>
        </div>

      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <PlannerGrid plannerWeek={plannerWeek} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card-bg p-6 md:p-8 rounded-2xl shadow-soft border border-border-color h-[650px] transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-dark"
        >
          <InventoryList />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-card-bg p-6 md:p-8 rounded-2xl shadow-soft border border-border-color h-[650px] transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-dark"
        >
          <GroceryList plannerWeek={plannerWeek} />
        </motion.div>
      </div>

      <ViewWeekModal 
        isOpen={isViewWeekOpen} 
        onClose={() => setIsViewWeekOpen(false)} 
        plannerWeek={plannerWeek}
        onStartCooking={(id) => setCookingRecipeId(id)}
      />

      <ConfirmModal
        isOpen={isConfirmClearOpen}
        title={`Clear ${plannerWeek === 0 ? "Current" : "Next"} Week`}
        message={`Are you sure you want to clear all planned meals for ${plannerWeek === 0 ? "this" : "next"} week? This action cannot be undone.`}
        confirmText="Clear Week"
        isDestructive={true}
        onConfirm={confirmClearWeek}
        onCancel={() => setIsConfirmClearOpen(false)}
      />
    </div>
  );
}
