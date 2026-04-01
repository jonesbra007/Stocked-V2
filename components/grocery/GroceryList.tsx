'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Copy, Pen, Plus, Trash2 } from 'lucide-react';
import { INVENTORY_CATEGORIES, categorizeIngredient } from '@/lib/grocery';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface GroceryListProps {
  plannerWeek: number; // 0 = Current, 1 = Next
}

export default function GroceryList({ plannerWeek }: GroceryListProps) {
  const { mealPlan, recipes, inventory, manualGrocery, saveManualGrocery, groceryOverrides, saveGroceryOverrides } = useData();
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState(INVENTORY_CATEGORIES[0]);
  
  const [editItem, setEditItem] = useState<{ name: string, category: string, isManual: boolean, originalIdx?: number } | null>(null);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkEdits, setBulkEdits] = useState<Record<string, string>>({});
  const [manualItemToDelete, setManualItemToDelete] = useState<number | null>(null);

  // Generate Grocery List
  const groceryItems = useMemo(() => {
    const items: { name: string, category: string, isManual: boolean, originalIdx?: number }[] = [];
    const isNextWeek = plannerWeek === 1;

    Object.keys(mealPlan).forEach(key => {
      const keyIsNext = key.startsWith('next_');
      if ((isNextWeek && keyIsNext) || (!isNextWeek && !keyIsNext)) {
        const planItem = mealPlan[key];
        const r = recipes.find(x => x.id === planItem.id);
        if (r) {
          const lines = (r.parsedIngredients && r.parsedIngredients.length > 0) 
            ? r.parsedIngredients 
            : (r.ingredients || '').split('\n').filter(l => l.trim() !== '');
            
          lines.forEach(line => {
            const lowerLine = line.toLowerCase();
            // Check if we already have it in inventory
            if (!inventory.some(inv => lowerLine.includes(inv.name.toLowerCase()))) {
              items.push({ 
                name: line, 
                category: categorizeIngredient(line, groceryOverrides), 
                isManual: false 
              });
            }
          });
        }
      }
    });

    manualGrocery.forEach((item, idx) => {
      items.push({ name: item.name, category: item.category, isManual: true, originalIdx: idx });
    });

    return items;
  }, [mealPlan, recipes, inventory, manualGrocery, groceryOverrides, plannerWeek]);

  const handleAddManual = async () => {
    const name = newItemName.trim();
    if (!name) return;

    const newManual = [...manualGrocery, { name, category: newItemCategory, isManual: true }];
    await saveManualGrocery(newManual);
    setNewItemName('');
  };

  const handleDeleteManual = async (idx: number) => {
    setManualItemToDelete(idx);
  };

  const confirmDeleteManual = async () => {
    if (manualItemToDelete === null) return;
    const newManual = [...manualGrocery];
    newManual.splice(manualItemToDelete, 1);
    await saveManualGrocery(newManual);
    setManualItemToDelete(null);
  };

  const handleCopyList = () => {
    let text = "My Grocery List\n\n";
    
    const grouped: Record<string, typeof groceryItems> = {};
    groceryItems.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });

    INVENTORY_CATEGORIES.forEach(cat => {
      if (grouped[cat] && grouped[cat].length > 0) {
        text += `\n[${cat.toUpperCase()}]\n`;
        grouped[cat].forEach(item => {
          text += `- ${item.name}\n`;
        });
      }
    });

    navigator.clipboard.writeText(text);
    alert("List copied!");
  };

  const handleSaveSingleEdit = async () => {
    if (!editItem) return;

    if (editItem.isManual && editItem.originalIdx !== undefined) {
      const newManual = [...manualGrocery];
      newManual[editItem.originalIdx].category = editItem.category;
      await saveManualGrocery(newManual);
    } else {
      const newOverrides = { ...groceryOverrides, [editItem.name.toLowerCase()]: editItem.category };
      await saveGroceryOverrides(newOverrides);
    }
    setEditItem(null);
  };

  const handleSaveBulkEdits = async () => {
    const newOverrides = { ...groceryOverrides, ...bulkEdits };
    await saveGroceryOverrides(newOverrides);
    setIsBulkEditOpen(false);
    setBulkEdits({});
  };

  // Group items for display
  const grouped: Record<string, typeof groceryItems> = {};
  groceryItems.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  // Unique items for bulk edit
  const uniqueItems = Array.from(new Set(groceryItems.map(i => i.name))).map(name => {
    return groceryItems.find(i => i.name === name)!;
  }).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-serif text-[1.4rem] m-0 text-text-main">
          Grocery List
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={handleCopyList}
            className="px-3 py-1.5 text-[0.85rem] rounded-lg border border-border-color bg-card-bg text-text-light font-semibold cursor-pointer transition-all flex items-center gap-1.5 hover:border-primary hover:text-primary active:scale-95"
          >
            <Copy size={14} /> Copy
          </button>
          <button 
            onClick={() => setIsBulkEditOpen(true)}
            className="px-3 py-1.5 text-[0.85rem] rounded-lg border border-border-color bg-card-bg text-text-light font-semibold cursor-pointer transition-all flex items-center gap-1.5 hover:border-primary hover:text-primary active:scale-95"
          >
            <Pen size={14} /> Edit
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto mb-6 pr-1">
        {groceryItems.length === 0 ? (
          <div className="text-center text-text-light p-4 text-[0.9rem]">List is empty.</div>
        ) : (
          INVENTORY_CATEGORIES.map(cat => {
            if (!grouped[cat] || grouped[cat].length === 0) return null;
            return (
              <div key={cat}>
                <div className="font-bold text-[0.8rem] text-primary mt-3 mb-1.5 uppercase tracking-wide border-b border-border-color pb-1">
                  {cat}
                </div>
                {grouped[cat].map((item, idx) => (
                  <div key={idx} className={`flex items-start p-2 rounded-lg transition-colors hover:bg-slot-bg mb-0.5 group ${item.isManual ? 'bg-slot-bg border-l-4 border-text-light' : ''}`}>
                    <label className="flex items-start gap-2 flex-grow cursor-pointer group/label">
                      <input 
                        type="checkbox" 
                        className="appearance-none w-5 h-5 bg-white border-2 border-[#d1d5db] rounded cursor-pointer relative flex-shrink-0 mt-0.5 transition-all duration-300 checked:bg-primary checked:border-primary checked:scale-110 group-active/label:scale-95 after:content-['✓'] after:font-black after:text-white after:text-[10px] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:hidden checked:after:block"
                        onChange={(e) => {
                          const span = e.target.nextElementSibling as HTMLElement;
                          if (span) {
                            if (e.target.checked) {
                              span.classList.add('after:w-full', 'text-text-light');
                              span.classList.remove('after:w-0', 'text-text-main');
                            } else {
                              span.classList.remove('after:w-full', 'text-text-light');
                              span.classList.add('after:w-0', 'text-text-main');
                            }
                          }
                        }}
                      />
                      <span className="text-[0.95rem] text-text-main leading-snug relative inline-block transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:top-1/2 after:h-[2px] after:bg-text-light after:transition-all after:duration-300 after:w-0">{item.name}</span>
                    </label>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button 
                        onClick={() => setEditItem(item)}
                        className="text-[#bbb] bg-transparent border-none cursor-pointer p-1 hover:text-accent transition-colors"
                      >
                        <Pen size={14} />
                      </button>
                      {item.isManual && item.originalIdx !== undefined && (
                        <button 
                          onClick={() => handleDeleteManual(item.originalIdx!)}
                          className="text-[#bbb] bg-transparent border-none cursor-pointer p-1 hover:text-danger transition-colors ml-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
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
          placeholder="Add extra item..." 
          className="flex-grow p-3 border border-border-color rounded-lg bg-input-bg font-sans text-text-main text-[0.95rem] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddManual()}
        />
        <button 
          onClick={handleAddManual}
          className="bg-primary text-white border-none px-5 rounded-lg h-[46px] flex items-center justify-center hover:bg-primary-dark transition-all active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Single Edit Modal */}
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
          <button onClick={handleSaveSingleEdit} className="bg-primary text-white border-none py-2.5 px-6 rounded-full font-semibold text-sm hover:bg-primary-dark transition-all active:scale-95">Save</button>
        </div>
      </Modal>

      {/* Bulk Edit Modal */}
      <Modal isOpen={isBulkEditOpen} onClose={() => setIsBulkEditOpen(false)} title="Edit Grocery Categories" maxWidth="max-w-[920px]">
        <div className="text-text-light text-[0.9rem] mb-4">
          Changes apply to this week&apos;s list and will be remembered for future lists.
        </div>
        <div className="max-h-[50vh] overflow-y-auto pr-2">
          {uniqueItems.length === 0 ? (
            <div className="text-center p-4">Empty</div>
          ) : (
            uniqueItems.map(item => (
              <div key={item.name} className="flex flex-col md:flex-row md:items-center gap-3 py-3 border-b border-border-color last:border-b-0">
                <div className="flex-1 text-[0.95rem] text-text-main">{item.name}</div>
                <div className="relative w-full md:w-[220px]">
                  <select 
                    className="w-full p-2 border border-border-color rounded-lg bg-input-bg font-sans text-text-main text-[0.9rem] appearance-none focus:outline-none focus:border-primary"
                    value={bulkEdits[item.name.toLowerCase()] || item.category}
                    onChange={(e) => setBulkEdits(prev => ({ ...prev, [item.name.toLowerCase()]: e.target.value }))}
                  >
                    {INVENTORY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary text-xs">▼</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={() => setIsBulkEditOpen(false)} className="bg-hover-bg text-text-main border-none py-2.5 px-6 rounded-full font-semibold text-sm hover:bg-border-color transition-all active:scale-95">Cancel</button>
          <button onClick={handleSaveBulkEdits} className="bg-primary text-white border-none py-2.5 px-6 rounded-full font-semibold text-sm hover:bg-primary-dark transition-all active:scale-95">Save All</button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={manualItemToDelete !== null}
        title="Remove Item"
        message="Are you sure you want to remove this item from your grocery list?"
        confirmText="Remove"
        isDestructive={true}
        onConfirm={confirmDeleteManual}
        onCancel={() => setManualItemToDelete(null)}
      />
    </div>
  );
}
