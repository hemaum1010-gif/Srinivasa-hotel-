import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator as CalcIcon, Settings, RefreshCcw, IndianRupee } from 'lucide-react';
import { FOOD_ITEMS, FoodItem } from '../types';
import { DrawingBoard } from './DrawingBoard';
import { cn } from '../lib/utils';

interface CalculatorProps {
  onNavigateToManagement: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ onNavigateToManagement }) => {
  const [items, setItems] = useState<FoodItem[]>(FOOD_ITEMS);
  const [quantities, setQuantities] = useState<Record<string, { value: number; text: string }>>({});
  const [showTotal, setShowTotal] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const savedPrices = localStorage.getItem('hotel_prices');
    if (savedPrices) {
      const prices = JSON.parse(savedPrices);
      setItems(prev => prev.map(item => ({
        ...item,
        price: prices[item.id] || item.price
      })));
    }
  }, []);

  const handleRecognized = (id: string, value: number, text: string) => {
    setQuantities(prev => ({
      ...prev,
      [id]: { value, text }
    }));
  };

  const handleClear = (id: string) => {
    setQuantities(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setShowTotal(false);
  };

  const resetAll = () => {
    setQuantities({});
    setShowTotal(false);
    setResetKey(prev => prev + 1);
  };

  const calculateTotal = () => {
    setShowTotal(true);
  };

  const grandTotal = items.reduce((acc, item) => {
    const qty = quantities[item.id]?.value || 0;
    return acc + (qty * item.price);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-orange-600 text-white p-4 sticky top-0 z-10 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-white p-1.5 rounded-lg">
            <CalcIcon className="text-orange-600" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Srinivasa Hotel</h1>
        </div>
        <button 
          onClick={onNavigateToManagement}
          className="p-2 hover:bg-orange-700 rounded-full transition-colors"
        >
          <Settings size={24} />
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
          <p className="text-xs font-bold text-orange-800 uppercase tracking-widest">
            💡 Use the side bars to scroll without drawing
          </p>
        </div>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="flex items-center p-4 gap-4">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-24 h-24 rounded-2xl object-cover shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-900">{item.name}</h3>
                <div className="flex items-center text-lg text-orange-600 font-bold">
                  <IndianRupee size={18} />
                  <span>{item.price}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Qty</div>
                <div className="text-4xl font-black text-slate-900">
                  {quantities[item.id]?.value || 0}
                </div>
              </div>
            </div>

            <div className="px-2 pb-4 space-y-3">
              <DrawingBoard 
                onRecognized={(val, txt) => handleRecognized(item.id, val, txt)}
                onClear={() => handleClear(item.id)}
                resetKey={resetKey}
              />
              
              {quantities[item.id] && (
                <div className="flex justify-between items-center text-base px-2">
                  <span className="text-slate-500 italic font-medium">
                    "{quantities[item.id].text}"
                  </span>
                  <span className="font-black text-slate-900">
                    ₹{(quantities[item.id].value * item.price).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </main>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex gap-3 max-w-2xl mx-auto">
        <button
          onClick={resetAll}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
        >
          <RefreshCcw size={20} />
          Clear All
        </button>
        <button
          onClick={calculateTotal}
          className="flex-[2] bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 text-lg"
        >
          <CalcIcon size={24} />
          Calculate Bill
        </button>
      </div>

      {/* Total Modal */}
      <AnimatePresence>
        {showTotal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowTotal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">Final Bill</h2>
              
              <div className="space-y-4 mb-10">
                {items.map(item => {
                  const qty = quantities[item.id]?.value || 0;
                  if (qty === 0) return null;
                  return (
                    <div key={item.id} className="flex justify-between items-center text-lg">
                      <span className="text-slate-600 font-bold">
                        {item.name} ({qty} × ₹{item.price})
                      </span>
                      <span className="text-slate-900 font-black">₹{(qty * item.price).toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="h-px bg-slate-100 my-4" />
                <div className="flex justify-between items-center text-3xl">
                  <span className="font-black text-slate-900">Total</span>
                  <span className="font-black text-orange-600">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setShowTotal(false)}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
