import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function triggerPushNotification(title: string, body: string) {
  try {
    const snap = await getDocs(collection(db, 'push_subscriptions'));
    const subscriptions = snap.docs.map(doc => doc.data());
    
    if (subscriptions.length === 0) return;

    await fetch('/api/webpush', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: { title, body },
        subscriptions
      })
    });
  } catch (e) {
    console.error('Failed to trigger push notifications:', e);
  }
}
