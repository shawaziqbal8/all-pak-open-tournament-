import React, { useState, useEffect } from 'react';

const ADS = [
  { id: 1, title: 'Red Bull Energy', bg: 'bg-red-600', text: 'Wings for the Winners!' },
  { id: 2, title: 'Nike Sports', bg: 'bg-slate-800', text: 'Just Do It. Official Gear Sponsor.' },
  { id: 3, title: 'Gatorade', bg: 'bg-orange-500', text: 'Replenish and perform better.' }
];

export default function AdsManager() {
  const [currentAd, setCurrentAd] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ADS.length);
    }, 5000); // Rotate every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const ad = ADS[currentAd];

  return (
    <div className={`w-full overflow-hidden rounded-xl p-5 flex items-center justify-between transition-colors duration-500 shadow-lg ${ad.bg}`}>
      <div>
        <p className="text-[10px] font-black uppercase text-white/50 tracking-[0.2em] mb-1">Sponsored</p>
        <h3 className="text-xl font-bold text-white mb-1">{ad.title}</h3>
        <p className="text-sm text-white/80">{ad.text}</p>
      </div>
      <div className="hidden sm:block text-white/20">
         <div className="w-16 h-16 rounded-full border-4 border-current border-dashed animate-[spin_10s_linear_infinite]"></div>
      </div>
    </div>
  );
}
