import React, { useState, useEffect } from 'react';
import { MatchScore } from '../types';
import { Ticket, Calendar, CheckCircle2, User, Phone, CupSoda, Droplets, Armchair } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

interface TicketPortalProps {
  matches: MatchScore[];
}

const TICKET_CATEGORIES = [
  { id: 'cat-300', price: 300, name: 'Premium Pass', desc: 'Comfortable seat with Coldrink', icon: <CupSoda className="w-5 h-5" /> },
  { id: 'cat-200', price: 200, name: 'Standard Pass', desc: 'Comfortable seat with Mineral Water', icon: <Droplets className="w-5 h-5" /> },
  { id: 'cat-100', price: 100, name: 'Basic Pass', desc: 'Comfortable seat', icon: <Armchair className="w-5 h-5" /> },
];

export default function TicketPortal({ matches }: TicketPortalProps) {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ts = params.get('ticketSuccess');
    const tid = params.get('ticketId');
    const tcanceled = params.get('ticketCanceled');

    if (ts === 'true' && tid) {
      updateDoc(doc(db, 'tickets', tid), {
        paymentStatus: 'paid'
      }).then(() => {
        setSuccess(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }).catch(console.error);
    } else if (tcanceled === 'true') {
      alert('Ticket payment was canceled.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handlePurchase = async () => {
    if (!buyerName || !buyerPhone || !selectedTicket) return;
    setIsProcessing(true);
    
    try {
      const id = 'tkt_' + Math.random().toString(36).substring(2, 9);
      
      await setDoc(doc(db, 'tickets', id), {
        id,
        buyerName,
        buyerPhone,
        ticketType: selectedTicket.id,
        ticketName: selectedTicket.name,
        price: selectedTicket.price,
        description: selectedTicket.desc,
        paymentStatus: 'pending',
        verified: false,
        timestamp: new Date().toISOString()
      });

      const res = await fetch('/api/checkout-ticket', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: id, name: selectedTicket.name, price: selectedTicket.price, desc: selectedTicket.desc })
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else if (data.success) {
        await updateDoc(doc(db, 'tickets', id), { paymentStatus: 'paid' });
        setSuccess(true);
        setIsProcessing(false);
      } else {
        alert('Payment processing failed.');
        setIsProcessing(false);
      }
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-white mb-2">Buy Tickets</h2>
        <p className="text-sm text-slate-400">Secure your seat for the tournament with our token categories.</p>
      </div>

      {success ? (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-xl text-center flex flex-col items-center justify-center">
          <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
          <h3 className="text-3xl font-black text-white mb-2">Purchase Successful!</h3>
          <p className="text-slate-400">Your ticket order is sent. The admin will verify and your pass can be printed.</p>
          <button onClick={() => {setSuccess(false); setSelectedTicket(null); setBuyerName(''); setBuyerPhone('');}} className="mt-8 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            Buy Another Ticket
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="space-y-4 lg:col-span-3">
            <h3 className="text-lg font-bold text-slate-200">Ticket Categories</h3>
            {TICKET_CATEGORIES.map(cat => (
              <div 
                key={cat.id} 
                className={`bg-slate-900 border ${selectedTicket?.id === cat.id ? 'border-orange-500 bg-orange-500/5' : 'border-slate-800'} p-5 rounded-xl cursor-pointer hover:border-orange-500/50 transition-colors flex items-center gap-4`}
                onClick={() => setSelectedTicket(cat)}
              >
                <div className={`p-4 rounded-full ${selectedTicket?.id === cat.id ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                   {cat.icon}
                </div>
                <div className="flex-1">
                  <div className="font-black text-white text-xl">{cat.name}</div>
                  <div className="text-sm text-slate-400 mt-1">{cat.desc}</div>
                </div>
                <div className="font-bold text-green-400 text-2xl">
                  PKR {cat.price}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl sticky top-6">
              <h3 className="text-xl font-bold text-white mb-4">Checkout</h3>
              {!selectedTicket ? (
                <div className="text-sm text-slate-500 pb-4 text-center py-10">
                  <Ticket className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                  Select a ticket category to continue.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <p className="font-black text-white mb-1">{selectedTicket.name}</p>
                    <p className="text-slate-400 text-sm mb-3">{selectedTicket.desc}</p>
                    <div className="flex justify-between font-black text-xl border-t border-slate-700/50 pt-3">
                      <span className="text-white">Total</span>
                      <span className="text-green-400">PKR {selectedTicket.price}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><User className="w-3 h-3"/> Full Name</label>
                       <input 
                         type="text" 
                         value={buyerName}
                         onChange={(e) => setBuyerName(e.target.value)}
                         placeholder="Enter your name" 
                         className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-orange-500 text-sm transition-colors" 
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><Phone className="w-3 h-3"/> Phone Number</label>
                       <input 
                         type="tel" 
                         value={buyerPhone}
                         onChange={(e) => setBuyerPhone(e.target.value)}
                         placeholder="03XX XXXXXXX" 
                         className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-orange-500 text-sm transition-colors" 
                       />
                     </div>
                  </div>

                  <button 
                    onClick={handlePurchase}
                    disabled={isProcessing || !buyerName || !buyerPhone}
                    className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors mt-2 flex items-center justify-center gap-2 text-lg shadow-lg"
                  >
                    {isProcessing ? 'Processing...' : (
                      <><Ticket className="w-5 h-5" /> Pay PKR {selectedTicket.price}</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
