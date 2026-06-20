import React, { useState } from 'react';
import { triggerPushNotification } from '../utils/push';
import { SpectatorTicket } from '../types';
import { User, Phone, CreditCard, ShieldCheck, Ticket } from 'lucide-react';

interface TicketRegistrationProps {
  onRegisterTicket: (ticket: SpectatorTicket) => void;
  onCancel: () => void;
}

const TICKET_OPTIONS = [
  { price: '100', name: 'Standard Pass', facilities: 'Comfortable Seat', description: 'Enjoy the match from a comfortable spectator seat.' },
  { price: '200', name: 'Premium Pass', facilities: 'Comfortable Seat + Mineral Water', description: 'Includes a comfortable seat and chilled mineral water.' },
  { price: '300', name: 'VIP Pass', facilities: 'Comfortable Seat + Cold Drink', description: 'Premium seating with a complimentary cold drink.' }
];

export default function TicketRegistration({ onRegisterTicket, onCancel }: TicketRegistrationProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'100' | '200' | '300'>('100');

  // Payment details
  const [accountName, setAccountName] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const selectedTicketInfo = TICKET_OPTIONS.find(t => t.price === selectedCategory);

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactNumber) {
      alert("Please fill all required personal details.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName || !transactionId) {
      alert("Please complete payment details.");
      return;
    }

    const ticket: SpectatorTicket = {
      id: `tick_${Date.now()}`,
      name,
      contactNumber,
      category: selectedCategory,
      facilities: selectedTicketInfo?.facilities || '',
      paymentStatus: 'pending',
      registrationDate: new Date().toLocaleString(),
      paymentDetails: {
        method: 'EasyPaisa',
        accountName,
        transactionId,
        amount: parseInt(selectedCategory, 10),
        timestamp: new Date().toLocaleString()
      }
    };

    triggerPushNotification("New Ticket Sold!", `${name} just purchased a ${selectedTicketInfo?.name || 'ticket'}!`);
    onRegisterTicket(ticket);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-slate-300 max-w-2xl mx-auto my-8">
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 flex justify-between items-center text-white">
        <div>
           <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
             <Ticket className="w-6 h-6" />
             Spectator Ticket
           </h2>
           <p className="text-xs font-medium text-orange-200 mt-1">Book your spot to watch the tournament live</p>
        </div>
      </div>

      <div className="p-6">
        <div className="flex gap-2 mb-8">
          <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-slate-800'}`} />
          <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-slate-800'}`} />
        </div>

        {step === 1 && (
          <form onSubmit={handleNextStep2} className="space-y-6">
            <div className="space-y-4">
               <div>
                  <h3 className="text-lg font-bold text-white mb-4">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950 border border-slate-800 text-slate-300 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none"
                          placeholder="Your real name"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Contact Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="tel"
                          required
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950 border border-slate-800 text-slate-300 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none"
                          placeholder="e.g. 0300-1234567"
                        />
                      </div>
                    </div>
                  </div>
               </div>

               <div>
                  <h3 className="text-lg font-bold text-white mb-4 mt-6">Select Ticket Package</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {TICKET_OPTIONS.map(opt => (
                       <div 
                         key={opt.price}
                         onClick={() => setSelectedCategory(opt.price as '100' | '200' | '300')}
                         className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedCategory === opt.price ? 'bg-orange-500/10 border-orange-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                       >
                         <div>
                            <div className="text-white font-bold mb-1">{opt.name} <span className="text-orange-400 ml-2">Rs {opt.price}</span></div>
                            <div className="text-xs text-slate-400 mb-1">{opt.description}</div>
                            <div className="text-[10px] text-emerald-400 font-semibold">{opt.facilities}</div>
                         </div>
                         <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCategory === opt.price ? 'border-orange-500 bg-orange-500' : 'border-slate-600'}`}>
                           {selectedCategory === opt.price && <div className="w-2 h-2 bg-slate-900 rounded-full" />}
                         </div>
                       </div>
                    ))}
                  </div>
               </div>
            </div>

            <div className="flex gap-4 pt-6 mt-6 border-t border-slate-800">
               <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition">Cancel</button>
               <button type="submit" className="flex-1 bg-orange-600 text-white font-bold py-2.5 rounded-xl hover:bg-orange-700 transition">Continue to Payment</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl mb-6">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-orange-400 font-bold flex items-center gap-2"><CreditCard className="w-4 h-4" /> EasyPaisa Payment</span>
                  <span className="text-white font-black text-xl">Rs {selectedCategory}</span>
               </div>
               <p className="text-xs text-slate-400">Please transfer the amount to the EasyPaisa account below and provide your transaction details.</p>
               <div className="mt-4 p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-4">
                  <div className="bg-green-500/20 p-3 rounded-full shrink-0">
                    <strong className="text-green-500 font-black tracking-wider text-sm">easypaisa</strong>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold mb-1">Account Name</div>
                    <div className="text-sm text-white font-bold md:tracking-wider">Shawaz Iqbal</div>
                    <div className="text-xs text-slate-500 font-semibold mb-1 mt-2">Account Number</div>
                    <div className="text-sm text-white font-bold tracking-widest">03416000758</div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Sender Account Name</label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-4 py-2 text-sm bg-slate-950 border border-slate-800 text-slate-300 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none"
                    placeholder="Name on EasyPaisa account"
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Transaction ID (TID)</label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-4 py-2 text-sm bg-slate-950 border border-slate-800 text-slate-300 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none"
                    placeholder="e.g. 12345678901"
                  />
               </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-900/50 p-4 rounded-xl flex gap-3 text-amber-500 mt-4">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <p className="text-xs font-medium">Your ticket will be issued once the admin verifies the transaction ID. You will be able to print your ticket pass after verification.</p>
            </div>

            <div className="flex gap-4 pt-6 mt-6 border-t border-slate-800">
               <button type="button" onClick={() => setStep(1)} className="px-6 py-2.5 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition">Back</button>
               <button type="submit" className="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition">Complete Registration</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
