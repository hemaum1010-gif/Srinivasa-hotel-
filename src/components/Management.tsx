import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Lock, IndianRupee } from 'lucide-react';
import { DEFAULT_PRICES } from '../types';

interface ManagementProps {
  onBack: () => void;
}

export const Management: React.FC<ManagementProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [prices, setPrices] = useState(DEFAULT_PRICES);
  const [error, setError] = useState('');
  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedPrices = localStorage.getItem('hotel_prices');
    if (savedPrices) {
      setPrices(JSON.parse(savedPrices));
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      // Small delay to ensure the component is fully mounted and visible
      const timer = setTimeout(() => {
        pinInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '3044') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid PIN');
      setPin('');
    }
  };

  const handlePriceChange = (id: keyof typeof DEFAULT_PRICES, value: string) => {
    const numValue = parseFloat(value) || 0;
    setPrices(prev => ({
      ...prev,
      [id]: numValue
    }));
  };

  const savePrices = () => {
    localStorage.setItem('hotel_prices', JSON.stringify(prices));
    alert('Prices saved successfully!');
    onBack();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 w-full max-w-sm"
        >
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="bg-orange-100 p-4 rounded-full text-orange-600">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Admin Access</h2>
            <p className="text-slate-500 text-center text-sm">Enter PIN to manage item prices</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              ref={pinInputRef}
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center text-2xl font-bold focus:border-orange-500 outline-none transition-colors"
              autoFocus
            />
            {error && <p className="text-red-500 text-center text-sm font-medium">{error}</p>}
            <button
              type="submit"
              className="w-full bg-orange-600 text-white font-bold py-4 rounded-2xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-100"
            >
              Unlock
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full text-slate-400 font-bold py-2 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Price Management</h1>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          {(Object.keys(prices) as Array<keyof typeof DEFAULT_PRICES>).map((key) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">
                {key.charAt(0).toUpperCase() + key.slice(1)} Price
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <IndianRupee size={20} />
                </div>
                <input
                  type="number"
                  value={prices[key]}
                  onChange={(e) => handlePriceChange(key, e.target.value)}
                  className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-bold text-slate-900 focus:border-orange-500 outline-none transition-colors"
                />
              </div>
            </div>
          ))}

          <button
            onClick={savePrices}
            className="w-full bg-orange-600 text-white font-bold py-4 rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2 mt-4"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>
      </main>
    </div>
  );
};
