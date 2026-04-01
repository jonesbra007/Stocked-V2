'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useData } from '@/contexts/DataContext';
import { Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#1ABC9C', 
  '#3498DB', '#9B59B6', '#E91E63', '#34495E', '#A2D729',
  '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9', '#92A8D1', 
  '#955251', '#B565A7', '#009B77', '#DD4124', '#45B8AC'
];

export default function ManageCategoriesModal({ isOpen, onClose }: ManageCategoriesModalProps) {
  const { appCategories, saveCategories } = useData();
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  const handleAddCategory = async () => {
    const name = newCatName.trim();
    if (name && !appCategories.find(c => c.name === name)) {
      const newCats = [...appCategories, { name, color: selectedColor }];
      await saveCategories(newCats);
      setNewCatName('');
    } else if (name) {
      alert("Category already exists");
    }
  };

  const handleDeleteCategory = async (idx: number) => {
    setCategoryToDelete(idx);
  };

  const confirmDelete = async () => {
    if (categoryToDelete !== null) {
      const newCats = [...appCategories];
      newCats.splice(categoryToDelete, 1);
      await saveCategories(newCats);
      setCategoryToDelete(null);
    }
  };

  const handleUpdateColor = async (color: string) => {
    if (editingIndex !== null && appCategories[editingIndex]) {
      const newCats = [...appCategories];
      newCats[editingIndex].color = color;
      await saveCategories(newCats);
      setEditingIndex(null);
    }
  };

  const handleMoveUp = async (idx: number) => {
    if (idx > 0) {
      const newCats = [...appCategories];
      const temp = newCats[idx];
      newCats[idx] = newCats[idx - 1];
      newCats[idx - 1] = temp;
      await saveCategories(newCats);
    }
  };

  const handleMoveDown = async (idx: number) => {
    if (idx < appCategories.length - 1) {
      const newCats = [...appCategories];
      const temp = newCats[idx];
      newCats[idx] = newCats[idx + 1];
      newCats[idx + 1] = temp;
      await saveCategories(newCats);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Categories">
      <div className="mb-4">
        <label className="block mb-2 font-semibold text-[0.85rem] uppercase text-text-light tracking-wide">New Category</label>
        <div className="flex gap-2 mb-4 flex-wrap">
          {PRESET_COLORS.map(c => (
            <div 
              key={c}
              className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-transform hover:scale-125 ${c === selectedColor ? 'border-text-main shadow-[0_0_0_2px_var(--card-bg),0_0_0_4px_var(--primary)]' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
              onClick={() => setSelectedColor(c)}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 items-center mb-4">
        <input 
          type="text" 
          placeholder="Category Name (e.g. Thai)" 
          className="w-full p-3 border border-border-color rounded-lg bg-input-bg font-sans text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
        />
        <button 
          onClick={handleAddCategory}
          className="bg-primary text-white border-none px-5 rounded-lg h-[48px] flex items-center justify-center hover:bg-primary-dark transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <hr className="border-0 border-t border-border-color my-6" />
      
      <p className="text-[0.85rem] text-text-light mb-2">Click color to edit</p>
      
      <ul className="list-none mt-4 p-0">
        {appCategories.map((cat, idx) => (
          <li key={cat.name} className="flex justify-between items-center p-3 bg-input-bg border border-border-color rounded-lg mb-2 transition-colors text-text-main relative">
            <div className="flex-grow font-medium flex items-center gap-2">
              <span 
                className="w-3.5 h-3.5 rounded-full inline-block flex-shrink-0 border border-black/10 cursor-pointer transition-transform hover:scale-125 relative z-20" 
                style={{ backgroundColor: cat.color }}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingIndex(editingIndex === idx ? null : idx);
                }}
              />
              {cat.name}
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handleMoveUp(idx)}
                disabled={idx === 0}
                className="text-text-light cursor-pointer p-1.5 bg-transparent border-none hover:text-primary disabled:opacity-30 disabled:hover:text-text-light relative z-10"
              >
                <ChevronUp size={18} />
              </button>
              <button 
                onClick={() => handleMoveDown(idx)}
                disabled={idx === appCategories.length - 1}
                className="text-text-light cursor-pointer p-1.5 bg-transparent border-none hover:text-primary disabled:opacity-30 disabled:hover:text-text-light relative z-10"
              >
                <ChevronDown size={18} />
              </button>
              <button 
                onClick={() => handleDeleteCategory(idx)}
                className="text-text-light cursor-pointer p-1.5 bg-transparent border-none hover:text-danger relative z-10 ml-1"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Inline Color Picker Popup */}
            {editingIndex === idx && (
              <div className="absolute top-[110%] left-0 bg-card-bg p-2.5 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.2)] border border-border-color z-[1100] flex gap-1.5 flex-wrap w-[160px]">
                {PRESET_COLORS.map(c => (
                  <div 
                    key={c}
                    className="w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-125"
                    style={{ backgroundColor: c }}
                    onClick={() => handleUpdateColor(c)}
                  />
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="flex justify-end gap-4 mt-8">
        <button 
          onClick={onClose}
          className="bg-primary text-white border-none py-3 px-8 rounded-full font-semibold text-base hover:bg-primary-dark hover:shadow-[0_4px_12px_rgba(92,141,137,0.3)] transition-all"
        >
          Done
        </button>
      </div>

      <ConfirmModal
        isOpen={categoryToDelete !== null}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${categoryToDelete !== null ? appCategories[categoryToDelete]?.name : ''}"?`}
        confirmText="Delete"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setCategoryToDelete(null)}
      />
    </Modal>
  );
}
