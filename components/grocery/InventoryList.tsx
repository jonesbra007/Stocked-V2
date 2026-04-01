'use client';

import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Trash2, Plus, Pen } from 'lucide-react';
import { INVENTORY_CATEGORIES, categorizeIngredient } from '@/lib/grocery';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function InventoryList() {
  const { inventory, saveInventory, groceryOverrides, saveGroceryOverrides } = useData();
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState(INVENTORY_CATEGORIES[0]);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  
  const [editItem, setEditItem] = useState<{ idx: number, name: string, category: string } | null>(null);

  const handleInputChange = (val: string) => {
    setNewItemName(val);
    if (val) {
      const predicted = categorizeIngredient(val, groceryOverrides);
      if (predicted !== "Other") {
        setNewItemCategory(predicted);
      }
    }
  };

  const handleAddItem = async () => {
    const name = newItemName.trim();
    if (!name) return;

    const newInventory = [...inventory, { name, category: newItemCategory }];
    await saveInventory(newInventory);
    
    // Learn for future
    const newOverrides = { ...groceryOverrides, [name.toLowerCase()]: newItemCategory };
    await saveGroceryOverrides(newOverrides);

    setNewItemName('');
  };

  const handleDeleteItem = async (idx: number) => {
    const newInventory = [...inventory];
    newInventory.splice(idx, 1);
    await saveInventory(newInventory);
  };

  const handleClearAll = async () => {
    setIsConfirmClearOpen(true);
  };

  const confirmClearAll = async () => {
    await saveInventory([]);
    setIsConfirmClearOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    
    const newInventory = [...inventory];
    newInventory[editItem.idx].category = editItem.category;
    await saveInventory(newInventory);

    const newOverrides = { ...groceryOverrides, [editItem.name.toLowerCase()]: editItem.category };
    await saveGroceryOverrides(newOverrides);

    setEditItem(null);
  };

  // Group items
  const grouped: Record<string, { name: string, category: string, idx: number }[]> = {};
  inventory.forEach((item, idx) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push({ ...item, idx });
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-serif text-[1.4rem] m-0 text-text-main">
          Ingredients on Hand
        </h3>
        <button 
          onClick={handleClearAll}
          className="px-3 py-1.5 text-[0.85rem] rounded-lg border border-border-color bg-card-bg text-text-light font-semibold cursor-pointer transition-all flex items-center gap-1.5 hover:border-primary hover:text-primary active:scale-95"
        >
          <Trash2 size={14} /> Clear
        </button>
      </div>

      <div className="flex-grow overflow-y-auto mb-6 pr-1">
        {inventory.length === 0 ? (
          <div className="text-center text-text-light p-4 text-[0.9rem]">No items found.</div>
        ) : (
          INVENTORY_CATEGORIES.map(cat => {
            if (!grouped[cat] || grouped[cat].length === 0) return null;
            return (
              <div key={cat}>
                <div className="font-bold text-[0.8rem] text-primary mt-2 mb-1 uppercase tracking-wide">
                  {cat}
                </div>
                {grouped[cat].map(item => (
                  <div key={item.idx} className="flex items-center p-2 rounded-lg transition-colors hover:bg-slot-bg mb-0.5 group">
                    <label className="flex-grow text-[0.95rem] text-text-main cursor-pointer">{item.name}</label>
                    <button 
                      onClick={() => setEditItem(item)}
                      className="text-text-light bg-transparent border-none cursor-pointer p-1 ml-2 opacity-0 group-hover:opacity-100 transition-all hover:text-primary hover:scale-110"
                    >
                      <Pen size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.idx)}
                      className="text-text-light bg-transparent border-none cursor-pointer p-1 ml-1 opacity-0 group-hover:opacity-100 transition-all hover:text-danger hover:scale-110"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-2 items-center mt-auto pt-4 border-t border-dashed border-border-color">
        <div className="relative w-[170px]">
          <select 
            className="w-full p-3 border border-border-color rounded-lg bg-input-bg font-sans text-text-main text-[0.95rem] appearance-none focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value)}
          >
            {INVENTORY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
            ▼
          </div>
        </div>
        <input 
          type="text" 
          placeholder="Add item..." 
          className="flex-grow p-3 border border-border-color rounded-lg bg-input-bg font-sans text-text-main text-[0.95rem] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
          value={newItemName}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
        />
        <button 
          onClick={handleAddItem}
          className="bg-primary text-white border-none px-5 rounded-lg h-[46px] flex items-center justify-center hover:bg-primary-dark transition-all active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title={`Edit: ${editItem?.name}`} maxWidth="max-w-[400px]">
        <div className="mb-5">
          <label className="block mb-2 font-semibold text-[0.85rem] uppercase text-text-light tracking-wide">Category</label>
          <div className="relative w-full">
            <select 
              className="w-full p-3 border border-border-color rounded-lg bg-input-bg font-sans text-text-main text-[0.95rem] appearance-none focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
              value={editItem?.category || ''}
              onChange={(e) => setEditItem(prev => prev ? { ...prev, category: e.target.value } : null)}
            >
              {INVENTORY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
              ▼
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button onClick={() => setEditItem(null)} className="bg-hover-bg text-text-main border-none py-2.5 px-6 rounded-full font-semibold text-sm hover:bg-border-color transition-all active:scale-95">Cancel</button>
          <button onClick={handleSaveEdit} className="bg-primary text-white border-none py-2.5 px-6 rounded-full font-semibold text-sm hover:bg-primary-dark transition-all active:scale-95">Save</button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmClearOpen}
        title="Clear Inventory"
        message="Are you sure you want to clear all ingredients from your inventory? This action cannot be undone."
        confirmText="Clear All"
        isDestructive={true}
        onConfirm={confirmClearAll}
        onCancel={() => setIsConfirmClearOpen(false)}
      />
    </div>
  );
}
