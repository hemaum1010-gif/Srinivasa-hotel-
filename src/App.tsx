import { useState, useEffect } from 'react';
import { Calculator } from './components/Calculator';
import { Management } from './components/Management';
import { generateFoodImage } from './lib/imageGen';
import { FOOD_ITEMS } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'calculator' | 'management'>('calculator');

  useEffect(() => {
    const initImages = async () => {
      try {
        // Check cache first to save quota
        const cachedVadai = localStorage.getItem('img_cache_vadai');
        const cachedPuri = localStorage.getItem('img_cache_puri');

        let vadaiImg = cachedVadai;
        let puriImg = cachedPuri;

        if (!vadaiImg) {
          vadaiImg = await generateFoodImage("South Indian Medu Vadai with chutney");
          if (vadaiImg.startsWith('data:')) localStorage.setItem('img_cache_vadai', vadaiImg);
        }

        if (!puriImg) {
          puriImg = await generateFoodImage("South Indian Puri Bhaji with potato masala");
          if (puriImg.startsWith('data:')) localStorage.setItem('img_cache_puri', puriImg);
        }
        
        const vadaiItem = FOOD_ITEMS.find(i => i.id === 'vadai');
        const puriItem = FOOD_ITEMS.find(i => i.id === 'puri');
        
        if (vadaiItem && vadaiImg) vadaiItem.image = vadaiImg;
        if (puriItem && puriImg) puriItem.image = puriImg;
      } catch (e) {
        console.error("Failed to init images", e);
      }
    };

    initImages();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-100">
      {currentPage === 'calculator' ? (
        <Calculator onNavigateToManagement={() => setCurrentPage('management')} />
      ) : (
        <Management onBack={() => setCurrentPage('calculator')} />
      )}
    </div>
  );
}
