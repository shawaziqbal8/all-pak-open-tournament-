import React, { useEffect, useState } from 'react';
import { collection, setDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Bell, BellOff } from 'lucide-react';

export default function NotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  async function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      if (permissionResult !== 'granted') return;

      const registration = await navigator.serviceWorker.register('/sw.js');
      
      const response = await fetch('/api/vapid-public-key');
      const { publicKey } = await response.json();
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // Save subscription to Firebase
      // Use endpoint hash as ID to avoid duplicates
      const subJson = subscription.toJSON();
      const id = btoa(subJson.endpoint || '').replace(/[^a-zA-Z0-9]/g, '');
      await setDoc(doc(collection(db, 'push_subscriptions'), id), subJson);
      
    } catch (error) {
      console.error('Push setup failed:', error);
    }
  }

  useEffect(() => {
    // Automatically try to register if already granted
    if (permission === 'granted') {
      subscribeToPush();
    }
  }, []);

  if (permission === 'denied') return null;

  if (permission === 'granted') {
    return null; // hide if granted
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom flex-wrap">
      <div className="bg-amber-500/20 p-2 rounded-full hidden sm:block">
        <Bell className="w-5 h-5 text-amber-500" />
      </div>
      <div>
        <p className="text-white text-sm font-bold">Enable Notifications</p>
        <p className="text-xs text-slate-400">Get instant updates on tickets & matches</p>
      </div>
      <button 
        onClick={subscribeToPush}
        className="ml-auto bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-lg text-xs font-black transition-colors"
      >
        Enable
      </button>
    </div>
  );
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
