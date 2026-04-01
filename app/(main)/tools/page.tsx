'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Scale, Thermometer, Droplets, Weight, ArrowRightLeft, RefreshCw } from 'lucide-react';

type UnitType = 'volume' | 'weight' | 'temperature';

interface Unit {
  id: string;
  name: string;
  type: UnitType;
  toBase: (val: number) => number; // Convert to base unit (ml for volume, g for weight, C for temp)
  fromBase: (val: number) => number; // Convert from base unit
}

const UNITS: Unit[] = [
  // Volume (Base: ml)
  { id: 'tsp', name: 'Teaspoon (tsp)', type: 'volume', toBase: v => v * 4.92892, fromBase: v => v / 4.92892 },
  { id: 'tbsp', name: 'Tablespoon (tbsp)', type: 'volume', toBase: v => v * 14.7868, fromBase: v => v / 14.7868 },
  { id: 'floz', name: 'Fluid Ounce (fl oz)', type: 'volume', toBase: v => v * 29.5735, fromBase: v => v / 29.5735 },
  { id: 'cup', name: 'Cup', type: 'volume', toBase: v => v * 236.588, fromBase: v => v / 236.588 },
  { id: 'pint', name: 'Pint', type: 'volume', toBase: v => v * 473.176, fromBase: v => v / 473.176 },
  { id: 'quart', name: 'Quart', type: 'volume', toBase: v => v * 946.353, fromBase: v => v / 946.353 },
  { id: 'gallon', name: 'Gallon', type: 'volume', toBase: v => v * 3785.41, fromBase: v => v / 3785.41 },
  { id: 'ml', name: 'Milliliter (ml)', type: 'volume', toBase: v => v, fromBase: v => v },
  { id: 'l', name: 'Liter (l)', type: 'volume', toBase: v => v * 1000, fromBase: v => v / 1000 },
  
  // Weight (Base: g)
  { id: 'oz', name: 'Ounce (oz)', type: 'weight', toBase: v => v * 28.3495, fromBase: v => v / 28.3495 },
  { id: 'lb', name: 'Pound (lb)', type: 'weight', toBase: v => v * 453.592, fromBase: v => v / 453.592 },
  { id: 'g', name: 'Gram (g)', type: 'weight', toBase: v => v, fromBase: v => v },
  { id: 'kg', name: 'Kilogram (kg)', type: 'weight', toBase: v => v * 1000, fromBase: v => v / 1000 },
  
  // Temperature (Base: C)
  { id: 'c', name: 'Celsius (°C)', type: 'temperature', toBase: v => v, fromBase: v => v },
  { id: 'f', name: 'Fahrenheit (°F)', type: 'temperature', toBase: v => (v - 32) * 5/9, fromBase: v => (v * 9/5) + 32 },
];

export default function ConversionsPage() {
  const [amount, setAmount] = useState<string>('1');
  const [fromUnitId, setFromUnitId] = useState<string>('cup');
  const [toUnitId, setToUnitId] = useState<string>('ml');

  const fromUnit = UNITS.find(u => u.id === fromUnitId);
  const toUnit = UNITS.find(u => u.id === toUnitId);

  // Filter available "to" units based on the "from" unit type
  const availableToUnits = UNITS.filter(u => u.type === fromUnit?.type);

  // Handle unit type change (if fromUnit changes to a different type, update toUnit)
  const handleFromUnitChange = (newId: string) => {
    const newUnit = UNITS.find(u => u.id === newId);
    setFromUnitId(newId);
    if (newUnit && newUnit.type !== fromUnit?.type) {
      const firstOfSameType = UNITS.find(u => u.type === newUnit.type && u.id !== newId);
      if (firstOfSameType) {
        setToUnitId(firstOfSameType.id);
      } else {
        setToUnitId(newId);
      }
    }
  };

  const calculateConversion = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !fromUnit || !toUnit) return '0.00';
    
    if (fromUnit.id === toUnit.id) return numAmount.toString();

    const baseValue = fromUnit.toBase(numAmount);
    const result = toUnit.fromBase(baseValue);
    
    // Format nicely: if it's a whole number, don't show decimals. Otherwise show up to 2 decimal places.
    return Number.isInteger(result) ? result.toString() : result.toFixed(2);
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto space-y-8 pb-12"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
      }}
      initial="hidden"
      animate="show"
    >
      <motion.div 
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
        className="border-b border-border-color pb-4"
      >
        <h1 className="font-serif text-3xl text-text-main flex items-center gap-3">
          <Scale className="text-primary" size={28} />
          Conversions & Substitutions
        </h1>
        <p className="text-text-light mt-2">
          Quick reference for common cooking measurements, temperatures, and ingredient substitutions.
        </p>
      </motion.div>

      {/* Interactive Converter */}
      <motion.div 
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
        className="bg-card-bg p-6 rounded-2xl shadow-sm border border-border-color transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      >
        <h2 className="text-xl font-serif text-text-main mb-6 flex items-center gap-2">
          <ArrowRightLeft size={20} className="text-primary" />
          Quick Calculator
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-text-light mb-1.5">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-color border border-border-color rounded-xl text-text-main focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter amount"
            />
          </div>
          
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-text-light mb-1.5">From</label>
            <select
              value={fromUnitId}
              onChange={(e) => handleFromUnitChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-color border border-border-color rounded-xl text-text-main focus:outline-none focus:border-primary transition-colors appearance-none"
            >
              <optgroup label="Volume">
                {UNITS.filter(u => u.type === 'volume').map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </optgroup>
              <optgroup label="Weight">
                {UNITS.filter(u => u.type === 'weight').map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </optgroup>
              <optgroup label="Temperature">
                {UNITS.filter(u => u.type === 'temperature').map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="hidden md:flex items-center justify-center pt-6 text-text-light">
            <ArrowRightLeft size={20} />
          </div>

          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-text-light mb-1.5">To</label>
            <select
              value={toUnitId}
              onChange={(e) => setToUnitId(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-color border border-border-color rounded-xl text-text-main focus:outline-none focus:border-primary transition-colors appearance-none"
            >
              {availableToUnits.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 p-4 bg-bg-color rounded-xl border border-border-color flex items-center justify-center">
          <div className="text-center">
            <span className="text-sm text-text-light block mb-1">Result</span>
            <span className="text-3xl font-serif text-primary">
              {calculateConversion()} <span className="text-xl text-text-main">{toUnit?.name.split(' ')[0]}</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* Reference Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Volume */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="bg-card-bg p-6 rounded-2xl shadow-sm border border-border-color transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
        >
          <h3 className="text-lg font-serif text-text-main mb-4 flex items-center gap-2">
            <Droplets size={18} className="text-primary" />
            Volume (Liquid & Dry)
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between items-center py-2 border-b border-border-color/50">
              <span className="text-text-main font-medium">1 Tablespoon</span>
              <span className="text-text-light">3 Teaspoons</span>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-border-color/50">
              <span className="text-text-main font-medium">1/4 Cup</span>
              <span className="text-text-light">4 Tablespoons</span>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-border-color/50">
              <span className="text-text-main font-medium">1/3 Cup</span>
              <span className="text-text-light">5 Tbsp + 1 tsp</span>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-border-color/50">
              <span className="text-text-main font-medium">1/2 Cup</span>
              <span className="text-text-light">8 Tablespoons</span>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-border-color/50">
              <span className="text-text-main font-medium">1 Cup</span>
              <span className="text-text-light">16 Tablespoons</span>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-border-color/50">
              <span className="text-text-main font-medium">1 Cup</span>
              <span className="text-text-light">8 Fluid Ounces</span>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-border-color/50">
              <span className="text-text-main font-medium">1 Pint</span>
              <span className="text-text-light">2 Cups</span>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-border-color/50">
              <span className="text-text-main font-medium">1 Quart</span>
              <span className="text-text-light">2 Pints (4 Cups)</span>
            </li>
            <li className="flex justify-between items-center py-2">
              <span className="text-text-main font-medium">1 Gallon</span>
              <span className="text-text-light">4 Quarts (16 Cups)</span>
            </li>
          </ul>
        </motion.div>

        {/* Weight & Temp */}
        <div className="space-y-6">
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            className="bg-card-bg p-6 rounded-2xl shadow-sm border border-border-color transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <h3 className="text-lg font-serif text-text-main mb-4 flex items-center gap-2">
              <Weight size={18} className="text-primary" />
              Weight
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center py-2 border-b border-border-color/50">
                <span className="text-text-main font-medium">1 Ounce</span>
                <span className="text-text-light">28 Grams</span>
              </li>
              <li className="flex justify-between items-center py-2 border-b border-border-color/50">
                <span className="text-text-main font-medium">1/4 Pound (4 oz)</span>
                <span className="text-text-light">113 Grams</span>
              </li>
              <li className="flex justify-between items-center py-2 border-b border-border-color/50">
                <span className="text-text-main font-medium">1/2 Pound (8 oz)</span>
                <span className="text-text-light">227 Grams</span>
              </li>
              <li className="flex justify-between items-center py-2">
                <span className="text-text-main font-medium">1 Pound (16 oz)</span>
                <span className="text-text-light">454 Grams</span>
              </li>
            </ul>
          </motion.div>

          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            className="bg-card-bg p-6 rounded-2xl shadow-sm border border-border-color transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <h3 className="text-lg font-serif text-text-main mb-4 flex items-center gap-2">
              <Thermometer size={18} className="text-primary" />
              Oven Temperature
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center py-2 border-b border-border-color/50">
                <span className="text-text-main font-medium">275°F</span>
                <span className="text-text-light">135°C (Gas Mark 1)</span>
              </li>
              <li className="flex justify-between items-center py-2 border-b border-border-color/50">
                <span className="text-text-main font-medium">350°F</span>
                <span className="text-text-light">175°C (Gas Mark 4)</span>
              </li>
              <li className="flex justify-between items-center py-2 border-b border-border-color/50">
                <span className="text-text-main font-medium">400°F</span>
                <span className="text-text-light">200°C (Gas Mark 6)</span>
              </li>
              <li className="flex justify-between items-center py-2">
                <span className="text-text-main font-medium">425°F</span>
                <span className="text-text-light">220°C (Gas Mark 7)</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Substitutions Section */}
      <motion.div 
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
        className="bg-card-bg p-6 rounded-2xl shadow-sm border border-border-color transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      >
        <h2 className="text-xl font-serif text-text-main mb-6 flex items-center gap-2">
          <RefreshCw size={20} className="text-primary" />
          Common Substitutions
        </h2>
        
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div className="space-y-4">
            <div className="pb-3 border-b border-border-color/50">
              <span className="block text-text-main font-medium mb-1">1 cup Buttermilk</span>
              <span className="text-text-light">1 tbsp lemon juice or white vinegar + enough milk to make 1 cup (let stand 5 mins)</span>
            </div>
            <div className="pb-3 border-b border-border-color/50">
              <span className="block text-text-main font-medium mb-1">1 tsp Baking Powder</span>
              <span className="text-text-light">1/4 tsp baking soda + 1/2 tsp cream of tartar</span>
            </div>
            <div className="pb-3 border-b border-border-color/50">
              <span className="block text-text-main font-medium mb-1">1 cup Cake Flour</span>
              <span className="text-text-light">1 cup all-purpose flour minus 2 tbsp, plus 2 tbsp cornstarch</span>
            </div>
            <div className="pb-3 border-b border-border-color/50 md:border-none md:pb-0">
              <span className="block text-text-main font-medium mb-1">1 cup Heavy Cream</span>
              <span className="text-text-light">3/4 cup milk + 1/4 cup melted butter (for cooking/baking, not whipping)</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="pb-3 border-b border-border-color/50">
              <span className="block text-text-main font-medium mb-1">1 cup Sour Cream</span>
              <span className="text-text-light">1 cup plain yogurt</span>
            </div>
            <div className="pb-3 border-b border-border-color/50">
              <span className="block text-text-main font-medium mb-1">1 clove Garlic</span>
              <span className="text-text-light">1/8 tsp garlic powder</span>
            </div>
            <div className="pb-3 border-b border-border-color/50">
              <span className="block text-text-main font-medium mb-1">1 tbsp Fresh Herbs</span>
              <span className="text-text-light">1 tsp dried herbs</span>
            </div>
            <div>
              <span className="block text-text-main font-medium mb-1">1 cup Brown Sugar</span>
              <span className="text-text-light">1 cup white sugar + 1 tbsp molasses</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
