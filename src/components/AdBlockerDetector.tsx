import React, { useState, useEffect } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export default function AdBlockerDetector() {
  const [adBlockerDetected, setAdBlockerDetected] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Simple ad blocker detection by trying to create a bait element
    const checkAdBlocker = () => {
      const bait = document.createElement('div');
      bait.className = 'ad-banner adsbox ad-placement';
      bait.style.height = '1px';
      bait.style.width = '1px';
      bait.style.position = 'absolute';
      bait.style.left = '-999px';
      bait.style.top = '-999px';
      
      document.body.appendChild(bait);
      
      // Wait a short delay to allow ad blockers to remove or hide the element
      setTimeout(() => {
        if (!bait || bait.offsetHeight === 0 || bait.offsetParent === null || window.getComputedStyle(bait).display === 'none') {
          setAdBlockerDetected(true);
        }
        if (bait.parentNode) {
          bait.parentNode.removeChild(bait);
        }
      }, 500);
    };

    checkAdBlocker();
  }, []);

  if (!adBlockerDetected || dismissed) return null;

  return (
    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3 mb-6 relative">
      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
      <div>
        <h4 className="font-bold mb-1">Ad Blocker Detected</h4>
        <p className="text-sm">
          It looks like you're using an ad blocker. Please consider disabling it on our site to support the tournament organizers and see our sponsors. Media may fail to load with it enabled.
        </p>
      </div>
      <button 
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-red-500 hover:text-red-300 p-1 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
