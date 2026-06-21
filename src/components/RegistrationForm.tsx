import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Player } from '../types';
import { CheckCircle2, CreditCard, Loader2, Plus, Trash2 } from 'lucide-react';

interface RegistrationFormProps {
  socket: Socket | null;
}

export default function RegistrationForm({ socket }: RegistrationFormProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [roster, setRoster] = useState<Player[]>([
    { id: 'p1', name: '', jerseyNumber: '', position: 'Outside Hitter' }
  ]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleAddPlayer = () => {
    if (roster.length >= 12) return;
    setRoster([...roster, { id: 'p' + Math.random().toString(36).substring(2), name: '', jerseyNumber: '', position: 'Outside Hitter' }]);
  };

  const handleUpdatePlayer = (id: string, field: keyof Player, value: string) => {
    setRoster(roster.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleRemovePlayer = (id: string) => {
    if (roster.length <= 1) return;
    setRoster(roster.filter(p => p.id !== id));
  };

  const handlePaymentAndSubmit = async () => {
    setIsProcessingPayment(true);
    
    try {
      // Simulate Stripe Checkout
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        const id = Math.random().toString(36).substring(2, 9);
        await setDoc(doc(db, 'teams', id), {
          id,
          teamName,
          captainName,
          contactDetails,
          roster: roster.filter(p => p.name.trim() !== ''),
          paymentStatus: 'paid',
          verified: false
        });
        setStep(4);
      }
    } catch (e) {
      console.error(e);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl">
        <div className="mb-8 flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-slate-800 -z-10"></div>
          {[1, 2, 3].map((num) => (
            <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-slate-900 border-2 transition-colors ${step >= num ? 'border-orange-500 text-orange-400' : 'border-slate-700 text-slate-500'}`}>
              {step > num ? <CheckCircle2 className="w-6 h-6 text-orange-500" /> : num}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Club Details</h2>
              <p className="text-slate-400 text-sm">Register your club for the open tournament.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Club/Team Name</label>
                <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-slate-200 outline-none focus:border-orange-500 transition-colors"
                  placeholder="e.g. Lahore Eagles" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Captain Name</label>
                <input type="text" value={captainName} onChange={(e) => setCaptainName(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-slate-200 outline-none focus:border-orange-500 transition-colors"
                  placeholder="Full Name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Contact Number (WhatsApp info)</label>
                <input type="text" value={contactDetails} onChange={(e) => setContactDetails(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-slate-200 outline-none focus:border-orange-500 transition-colors"
                  placeholder="+92 3XX XXXXXXX" required />
              </div>
            </div>
            <button onClick={() => setStep(2)} disabled={!teamName || !captainName || !contactDetails}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors mt-4">
              Next: Player Roster
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Player Roster</h2>
                <p className="text-slate-400 text-sm">Add between 6 and 12 players.</p>
              </div>
              <span className="text-sm font-bold text-slate-500">{roster.length}/12</span>
            </div>
            
            <div className="space-y-3">
              {roster.map((player, index) => (
                <div key={player.id} className="flex flex-wrap md:flex-nowrap gap-2 items-center bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-slate-500 font-mono w-6 text-center">{index + 1}</span>
                  <input type="text" value={player.name} onChange={(e) => handleUpdatePlayer(player.id, 'name', e.target.value)}
                    className="flex-1 min-w-[120px] bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-orange-500"
                    placeholder="Player Name" />
                  <input type="text" value={player.jerseyNumber} onChange={(e) => handleUpdatePlayer(player.id, 'jerseyNumber', e.target.value)}
                    className="w-16 bg-slate-800 border border-slate-700 rounded p-2 text-sm text-center text-slate-200 outline-none focus:border-orange-500"
                    placeholder="No." />
                  <select value={player.position} onChange={(e) => handleUpdatePlayer(player.id, 'position', e.target.value)}
                     className="bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-300 outline-none focus:border-orange-500">
                    <option>Setter</option>
                    <option>Outside Hitter</option>
                    <option>Opposite Hitter</option>
                    <option>Middle Blocker</option>
                    <option>Libero</option>
                  </select>
                  <button onClick={() => handleRemovePlayer(player.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            {roster.length < 12 && (
              <button onClick={handleAddPlayer} className="w-full flex justify-center items-center gap-2 py-3 border-2 border-dashed border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-300 rounded-lg transition-colors font-medium text-sm">
                <Plus className="w-4 h-4" /> Add Player
              </button>
            )}

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(1)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors">
                Back
              </button>
              <button onClick={() => setStep(3)} disabled={roster.filter(p => p.name).length < 6} className="w-2/3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
                Next: Payment
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Entry Fee Checkout</h2>
              <p className="text-slate-400 text-sm">Secure your spot in the bracket.</p>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-xl border border-orange-500/20">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-300 font-medium">{teamName} Registration</span>
                <span className="text-xl font-bold text-white">Rs. 5,000</span>
              </div>
              <div className="space-y-2 mb-6 text-sm text-slate-400">
                <div className="flex justify-between"><span>Base Entry Fee</span><span>Rs. 4,500</span></div>
                <div className="flex justify-between"><span>Admin Surcharge</span><span>Rs. 500</span></div>
              </div>
              
              <button onClick={handlePaymentAndSubmit} disabled={isProcessingPayment}
                className="w-full relative flex justify-center items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)]">
                {isProcessingPayment ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing Payment...</>
                ) : (
                  <><CreditCard className="w-5 h-5" /> Pay Rs. 5,000 via Stripe</>
                )}
              </button>
              <p className="text-center text-xs text-slate-500 mt-4">Simulated secure payment via Stripe checkout.</p>
            </div>
            
            <button onClick={() => setStep(2)} disabled={isProcessingPayment} className="w-full text-slate-500 hover:text-slate-300 py-2 transition-colors font-medium text-sm">
              Back to Roster
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-4 py-8 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-white">Registration Confirmed!</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Your club <strong>{teamName}</strong> has been registered. You will receive a WhatsApp notification shortly with schedule details.
            </p>
            <button onClick={() => {
              setStep(1);
              setTeamName('');
              setCaptainName('');
              setContactDetails('');
              setRoster([{ id: 'p1', name: '', jerseyNumber: '', position: 'Outside Hitter' }]);
            }} className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-6 rounded-lg transition-colors mt-8 inline-block">
              Register Another Team
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
