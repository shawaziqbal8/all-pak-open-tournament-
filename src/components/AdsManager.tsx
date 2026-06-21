import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { AdImage } from './AdminDashboard';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import AdBlockerDetector from './AdBlockerDetector';

export default function AdsManager() {
  const [ads, setAds] = useState<AdImage[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, { rootMargin: '200px' }); // Load before it comes fully into view

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setConnectionStatus('connecting');
    const unsub = onSnapshot(collection(db, 'ads'), (snapshot) => {
      setConnectionStatus('connected');
      const activeAds = snapshot.docs
        .map(d => ({id: d.id, ...d.data()}) as AdImage)
        .filter(ad => ad.active);
      setAds(activeAds);
    }, (error) => {
      console.error('Error fetching ads:', error);
      setConnectionStatus('error');
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (ads.length <= 2) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 2) % ads.length);
    }, 10000); // Rotate every 10 seconds
    return () => clearInterval(interval);
  }, [ads.length]);

  return (
    <div ref={containerRef} className="w-full relative">
      <AdBlockerDetector />
      
      {/* Connection Status Indicator */}
      <div className="absolute -top-3 right-2 z-20" title={connectionStatus === 'connected' ? 'Ad server connected' : connectionStatus === 'error' ? 'Failed to connect to ad server' : 'Connecting to ad server...'}>
        <div className={`p-1.5 rounded-full text-xs flex items-center justify-center bg-slate-900 border ${connectionStatus === 'connected' ? 'border-green-500/50 text-green-500' : connectionStatus === 'error' ? 'border-red-500/50 text-red-500' : 'border-orange-500/50 text-orange-500 animate-pulse'}`}>
          {connectionStatus === 'connected' && <Wifi className="w-3 h-3" />}
          {connectionStatus === 'error' && <WifiOff className="w-3 h-3" />}
          {connectionStatus === 'connecting' && <RefreshCw className="w-3 h-3 animate-spin" />}
        </div>
      </div>

      {ads.length === 0 ? (
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
      ) : (
        <div className={`grid grid-cols-1 ${ads.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
          {isVisible && (
            <>
              {[ads[currentAdIndex % ads.length], ads.length > 1 ? ads[(currentAdIndex + 1) % ads.length] : null].filter(Boolean).map((ad, idx) => (
                <div key={ad ? `${ad.id}-${idx}` : idx} className="w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center transition-colors duration-500 shadow-lg relative h-48 sm:h-64">
                   {ad && (ad.type === 'video' || (ad.url && ad.url.match(/\.(mp4|webm|ogg)$/i))) ? (
                     <video src={ad.url} controls autoPlay muted loop className="w-full h-full object-cover animate-in fade-in duration-500" />
                   ) : (
                     ad && <img src={ad.url} alt="Official Sponsor" className="w-full h-full object-cover animate-in fade-in duration-500" loading="lazy" />
                   )}
                   <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-black uppercase text-white/80 tracking-widest border border-white/10 z-10">Sponsored</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
