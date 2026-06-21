import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { AdImage } from './AdminDashboard';

export default function AdsManager() {
  const [ads, setAds] = useState<AdImage[]>([]);
  const [currentAd, setCurrentAd] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'ads'), (snapshot) => {
      const activeAds = snapshot.docs
        .map(d => ({id: d.id, ...d.data()}) as AdImage)
        .filter(ad => ad.active);
      setAds(activeAds);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 8000); // Rotate every 8 seconds
    return () => clearInterval(interval);
  }, [ads.length]);

  if (ads.length === 0) {
    return (
      <div className={`w-full overflow-hidden rounded-xl p-5 flex items-center justify-between transition-colors duration-500 shadow-lg bg-orange-600`}>
        <div>
          <p className="text-[10px] font-black uppercase text-white/50 tracking-[0.2em] mb-1">Sponsored</p>
          <h3 className="text-xl font-bold text-white mb-1">FGC (Fawad Group of Companies)</h3>
          <p className="text-sm text-white/80">Official Title Sponsor - Empowering Sports in Shangla</p>
        </div>
        <div className="hidden sm:block text-white/20">
           <div className="w-16 h-16 rounded-full border-4 border-current border-dashed animate-[spin_10s_linear_infinite]"></div>
        </div>
      </div>
    );
  }

  const ad = ads[currentAd] || ads[0];

  return (
    <div className={`w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center transition-colors duration-500 shadow-lg relative h-48 sm:h-64`}>
       <img src={ad.url} alt="Official Sponsor" className="w-full h-full object-cover animate-in fade-in duration-500" key={ad.id} />
       <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-black uppercase text-white/80 tracking-widest border border-white/10">Sponsored</div>
    </div>
  );
}
