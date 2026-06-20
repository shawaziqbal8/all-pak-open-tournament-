/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Team, Player, PaymentStatus, PaymentDetails } from '../types';
import { TOURNAMENT_DETAILS } from '../data';
import { User, Phone, MapPin, Plus, Trash2, CreditCard, ShieldCheck, CheckCircle2, Ticket, Printer } from 'lucide-react';

interface RegistrationFormProps {
  onRegisterTeam: (newTeam: Team) => void;
  triggerNotification: (title: string, message: string, type: 'push' | 'email', recipient: string) => void;
}

export default function RegistrationForm({ onRegisterTeam, triggerNotification }: RegistrationFormProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [clubName, setClubName] = useState('');
  const [city, setCity] = useState('');
  const [coach, setCoach] = useState('');
  const [contact, setContact] = useState('');
  const [primaryColor, setPrimaryColor] = useState('emerald');

  // Player roster
  const [players, setPlayers] = useState<Player[]>([
    { id: 'p_init_1', name: '', role: 'Captain' }
  ]);

  // Payment Gateway states
  const [paymentMethod, setPaymentMethod] = useState<'Mobile Gateway' | 'Bank Transfer' | 'Card'>('Card');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Add athlete row
  const handleAddPlayer = () => {
    if (players.length >= 8) {
      alert('Maximum roster is 8 players (6 starters + 2 substitutes).');
      return;
    }
    const roles: Player['role'][] = ['Spiker', 'Setter', 'Libero', 'Blocker', 'All-Rounder'];
    const nextRole = roles[(players.length - 1) % roles.length];
    setPlayers([...players, { id: `p_new_${Date.now()}_${players.length}`, name: '', role: nextRole }]);
  };

  // Remove athlete row
  const handleRemovePlayer = (idx: number) => {
    if (players.length === 1) return;
    setPlayers(players.filter((_, i) => i !== idx));
  };

  // Edit athlete name
  const handlePlayerNameChange = (idx: number, name: string) => {
    const next = [...players];
    next[idx].name = name;
    setPlayers(next);
  };

  // Edit athlete role
  const handlePlayerRoleChange = (idx: number, role: Player['role']) => {
    const next = [...players];
    next[idx].role = role;
    setPlayers(next);
  };

  // Step 1 Validation
  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName || !city || !coach || !contact) {
      alert('Please fill out all club profile details.');
      return;
    }
    setStep(2);
  };

  // Step 2 Validation
  const handleNextStep3 = () => {
    const emptyNames = players.some(p => !p.name.trim());
    if (emptyNames) {
      alert('Please fill in the names for all players in your lineup.');
      return;
    }
    if (players.length < 4) {
      alert('A minimum of 4 registered players is required to enter the bracket.');
      return;
    }
    setStep(3);
  };

  // Handle Checkout Simulator
  const handleProcessCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'Card') {
      if (!cardNo || !cardExpiry || !cardCvc || !accountName) {
        alert('Please complete all card details to authorize transactions.');
        return;
      }
    } else {
      if (!accountName || !transactionId) {
        alert('Please enter your account billing name and the mobile 11-digit Transaction ID/TID.');
        return;
      }
    }

    setIsProcessingPayment(true);

    // Simulate standard card verification overlay delay
    setTimeout(() => {
      setIsProcessingPayment(false);
      
      const simulatedTId = paymentMethod === 'Card' ? `TXN${Math.floor(Math.random() * 899999 + 100000)}` : transactionId;
      const finalDetails: PaymentDetails = {
        method: paymentMethod,
        accountName,
        accountNumber: accountNumber || 'Mobile Gateway',
        transactionId: simulatedTId,
        amount: TOURNAMENT_DETAILS.entryFee,
        timestamp: new Date().toLocaleString()
      };

      const newTeam: Team = {
        id: `t_user_${Date.now()}`,
        name: clubName + ' RFC',
        city,
        coach,
        contactNumber: contact,
        players: players.map((p, idx) => ({ ...p, id: `p_user_${idx}_${Date.now()}` })),
        registrationDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'pending', // Mark as pending until admin verified
        paymentDetails: finalDetails,
        primaryColor,
        secondaryColor: 'slate',
        won: 0,
        lost: 0,
        setsWon: 0,
        setsLost: 0,
        points: 0
      };

      // Set Receipt Info
      setReceiptData({
        clubName: newTeam.name,
        coach,
        amount: TOURNAMENT_DETAILS.entryFee,
        transId: simulatedTId,
        method: paymentMethod,
        timestamp: finalDetails.timestamp,
        regCode: `APV-${Math.floor(Math.random() * 8999 + 1000)}`
      });

      // Register digitally
      onRegisterTeam(newTeam);

      // Trigger automatic simulated emails and push alerts
      triggerNotification(
        '🎉 Registration Successful!',
        `Your club "${newTeam.name}" has registered for the International Open Volleyball Tournament! Bracket matches are compiling.`,
        'push',
        'All Participants'
      );

      triggerNotification(
        '🏆 Tournament Registration Entry Fee Paid',
        `Dear ${coach}, we have verified your payment gateway transaction: ${simulatedTId}. Your cash receipt code is ${simulatedTId}!`,
        'email',
        `${coach.toLowerCase().replace(/\s+/g, '')}@gmail.com`
      );

      setStep(4);
    }, 2200);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl max-w-3xl mx-auto overflow-hidden text-slate-300" id="registration-portal-component">
      
      {/* Visual Step Indicator Tracker */}
      <div className="bg-slate-950 border-b border-slate-850 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <h2 className="text-sm font-black text-white">Enroll Your Club</h2>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {[1, 2, 3, 4].map((s) => (
            <div key={`ind-${s}`} className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${step === s ? 'bg-orange-500 text-slate-950 font-black' : (step > s ? 'bg-orange-550/20 text-orange-400 border border-orange-500/20' : 'bg-slate-900 text-slate-600 border border-slate-850')}`}>
                {s}
              </span>
              {s < 4 && <span className="text-slate-700">➔</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8">

        {/* STEP 1: Club Profiling */}
        {step === 1 && (
          <form onSubmit={handleNextStep2} className="space-y-6">
            <div>
              <h3 className="text-base font-black text-white mb-1">Step 1: Club Settings & Colors</h3>
              <p className="text-xs text-slate-400 font-medium">Fill out your team's background parameters to start registration.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Club Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shangla Spikers"
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-1 focus:ring-orange-500 outline-none"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Representing District / City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shangla / Peshawar"
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-1 focus:ring-orange-500 outline-none"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Team Coach Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Raham Iqbal Khan"
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-1 focus:ring-orange-500 outline-none"
                    value={coach}
                    onChange={(e) => setCoach(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">WhatsApp / Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0306-0888584"
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-1 focus:ring-orange-500 outline-none"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Select Team Jersey Primary Color Theme</label>
                <div className="flex gap-4 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 w-fit">
                  {['emerald', 'blue', 'red', 'indigo', 'purple', 'orange', 'teal', 'cyan'].map((col) => (
                    <button
                    key={col}
                    type="button"
                    onClick={() => setPrimaryColor(col)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${primaryColor === col ? 'scale-115 border-orange-500 shadow-md' : 'border-transparent shadow-xs'}`}
                  >
                    <span className={`w-6 h-6 rounded-full block ${
                      col === 'emerald' ? 'bg-emerald-500' :
                      col === 'blue' ? 'bg-blue-500' :
                      col === 'red' ? 'bg-red-500' :
                      col === 'indigo' ? 'bg-indigo-500' :
                      col === 'purple' ? 'bg-purple-500' :
                      col === 'orange' ? 'bg-orange-500' :
                      col === 'teal' ? 'bg-teal-500' : 'bg-cyan-500'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
            </div>

            <div className="flex justify-end pt-5 border-t border-slate-850">
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs py-2.5 px-6 rounded-xl transition-all cursor-pointer"
              >
                Assemble Squad Lineup ➔
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Custom Lineup Configurator */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-black text-white mb-1">Step 2: Team Roster Lineup ({players.length} Registered)</h3>
              <p className="text-xs text-slate-400 font-medium">Add the players who will play on court. Minimally 4, maximum of 8 athletes.</p>
            </div>

            <div className="space-y-3.5">
              {players.map((plyr, index) => (
                <div key={plyr.id} className="flex items-center gap-3 bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl">
                  <span className="font-mono text-xs font-black text-slate-500 w-5">#{index + 1}</span>
                  
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Player Full Name"
                      className="w-full px-3 py-2 text-xs bg-slate-900 text-white border border-slate-850 rounded-lg focus:ring-1 focus:ring-orange-500 outline-none"
                      value={plyr.name}
                      onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                    />
                    
                    <select
                      className="w-full px-2.5 py-2 text-xs bg-slate-900 text-slate-300 border border-slate-855 rounded-lg outline-none cursor-pointer focus:ring-1 focus:ring-orange-500"
                      value={plyr.role}
                      onChange={(e) => handlePlayerRoleChange(index, e.target.value as any)}
                    >
                      <option value="Captain">Captain (On-Court Chief)</option>
                      <option value="Spiker">Spiker (Attacking Specialist)</option>
                      <option value="Setter">Setter (Setup Coordinator)</option>
                      <option value="Libero">Libero (Defensive Specialist)</option>
                      <option value="Blocker">Blocker (Wall Specialist)</option>
                      <option value="All-Rounder">All-Rounder</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleRemovePlayer(index)}
                    disabled={players.length === 1}
                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddPlayer}
              className="w-full py-2.5 border-2 border-dashed border-slate-800 rounded-xl text-xs font-black text-slate-400 hover:text-orange-450 hover:border-orange-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Next Athlete Row
            </button>

            <div className="flex justify-between items-center pt-5 border-t border-slate-850">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs hover:underline text-slate-400 cursor-pointer"
              >
                ◀ Back to Club Settings
              </button>

              <button
                onClick={handleNextStep3}
                className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs py-2.5 px-6 rounded-xl transition-all cursor-pointer"
              >
                Proceed to Checkout (Rs. 5,000) ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Secure Checkout Gateway */}
        {step === 3 && (
          <form onSubmit={handleProcessCheckout} className="space-y-6">
            <div>
              <h3 className="text-base font-black text-white mb-1">Step 3: Secure Tournament Fee Payment</h3>
              <p className="text-xs text-slate-400 font-medium">International Open entry fee is $20 (or Rs. 5,000). Payment can be processed globally via Card, or locally via Gateway.</p>
            </div>

            <div className="flex gap-2">
              {['Card', 'Mobile Gateway', 'Bank Transfer'].map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method as any)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${paymentMethod === method ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                >
                  {method}
                </button>
              ))}
            </div>

            {/* Instruction Panel dynamically changed according to local wallets */}
            {paymentMethod === 'Mobile Gateway' && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 space-y-3 text-xs text-orange-400 font-medium">
                <p className="font-black text-[13px] text-white">📱 Local Mobile Account Submission:</p>
                <div className="space-y-1.5">
                  <p>Transfer Rs. 5,000 exactly to our Chief Organizer using the EasyPaisa details below:</p>
                  <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg my-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500/20 p-2 rounded-full">
                        <strong className="text-green-500 font-black tracking-wider text-sm">easypaisa</strong>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-bold">Shawaz Iqbal</p>
                        <p className="text-white text-base font-mono font-black tracking-widest">03416000758</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-500/20 p-2.5 rounded-lg border border-orange-500/30 text-white flex items-start gap-2">
                  <span className="text-lg leading-none">⚠️</span>
                  <p className="leading-relaxed">
                    <strong className="font-black text-orange-400">CRITICAL NEXT STEP:</strong> You MUST share a screenshot of your successful transaction via WhatsApp to <strong className="font-black text-orange-400">03416000758</strong>. Only teams with a verified payment screenshot will be officially added to the tournament standings!
                  </p>
                </div>
                <a 
                  href="https://wa.me/923416000758" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-2 w-full py-2.5 bg-[#25D366] hover:bg-[#1ebd59] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-green-900/20"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.472-1.761-1.645-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  Send Payment Screenshot via WhatsApp
                </a>
              </div>
            )}

            {paymentMethod === 'Bank Transfer' && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 space-y-3 text-xs text-orange-400 font-medium">
                <p className="font-black text-[13px] text-white">🏦 International / Local Bank Transfer:</p>
                <div className="space-y-1.5">
                  <p>Transfer $20 or Rs. 5,000 using the IBAN details below:</p>
                  <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg my-2">
                    <p className="text-slate-400 text-xs font-bold">Bank Name: Standard Chartered</p>
                    <p className="text-slate-400 text-xs font-bold">Account Name: Open Volleyball Tournament</p>
                    <p className="text-white text-base font-mono font-black tracking-widest mt-1">PK34 SCBL 0000 000 1234 5678</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields according to Payment Options */}
            {paymentMethod === 'Card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Name on Card</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-1 focus:ring-orange-500 outline-none"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="0000 0000 0000 0000"
                    className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-1 focus:ring-orange-500 outline-none font-mono"
                    value={cardNo}
                    onChange={(e) => setCardNo(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-1 focus:ring-orange-500 outline-none font-mono"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">CVC</label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-1 focus:ring-orange-500 outline-none font-mono"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Your Sender Account Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Name displayed on account profile"
                      className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-1 focus:ring-orange-500 outline-none"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Sender Account Mobile / IBAN (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 0345-XXXXXXX or PKXX..."
                      className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-1 focus:ring-orange-500 outline-none"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Gateway Transaction ID (TID) / Reference No</label>
                    <input
                      type="text"
                      required
                      placeholder="Transaction receipt ID"
                      className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-1 focus:ring-orange-500 font-mono tracking-wider font-bold outline-none"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                  </div>
              </div>
            )}

            <div className="border-t border-slate-850 pt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs hover:underline text-slate-400 cursor-pointer"
              >
                ◀ Back to Roster Config
              </button>

              <button
                type="submit"
                disabled={isProcessingPayment}
                className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs py-3 px-8 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:bg-slate-800 disabled:text-slate-500"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                {isProcessingPayment 
                  ? 'Verifying Transaction...' 
                  : `Secure Payment [$20 / Rs. 5,000]`}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Checkout Success & Printable Entrance Ticket */}
        {step === 4 && receiptData && (
          <div className="text-center py-4 space-y-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <CheckCircle2 className="w-16 h-16 text-yellow-500 shrink-0" />
              <h3 className="text-xl font-black text-white">Enrollment Pending Verification!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Your registration has been submitted but requires Admin Verification. If paying manually, you MUST send a screenshot of your payment (${receiptData.amount}) to <strong className="text-amber-500 font-bold">03416000758</strong> on WhatsApp.
              </p>
            </div>

            {/* Visual ticket receipt frame (Pending) */}
            <div className="border border-yellow-500/20 rounded-2xl bg-slate-950 text-slate-350 p-5 max-w-sm mx-auto text-left relative overflow-hidden shadow-xl border-dashed">
              <div className="absolute top-0 right-0 w-8 h-8 bg-slate-900 border-l border-b border-yellow-500/20 rounded-bl-full" />
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-slate-900 border-l border-t border-yellow-500/20 rounded-tl-full" />

              <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5 mb-3 text-yellow-500 uppercase tracking-widest text-[9px] font-black">
                <Ticket className="w-4 h-4 text-yellow-500 shrink-0" />
                <span>ENTRY PASS (PENDING)</span>
              </div>

              <div className="space-y-2 text-xs opacity-70">
                <div>
                   <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wide">Registered Club</span>
                   <span className="font-extrabold text-white text-sm">{receiptData.clubName}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                   <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wide">Lead Coach / Sponsor</span>
                      <span className="font-semibold text-slate-300">{receiptData.coach}</span>
                   </div>
                   <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wide">Verification ID</span>
                      <span className="font-mono font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 border border-yellow-500/15 rounded">{receiptData.regCode}</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-slate-850 pt-2.5">
                   <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wide">Amount Paid</span>
                      <span className="font-mono font-bold text-white">Rs. {receiptData.amount}</span>
                   </div>
                   <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wide">Transaction ID (TID)</span>
                      <span className="font-mono font-semibold text-slate-300 break-all">{receiptData.transId}</span>
                   </div>
                </div>

                <div className="text-[9px] text-yellow-500 font-bold pt-2 text-center border-t border-slate-850 border-dashed">
                  Pass will be active and printable ONLY after admin verification.
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <a 
                href="https://wa.me/923416000758" 
                target="_blank" 
                rel="noreferrer"
                className="py-2 px-5 bg-[#25D366] hover:bg-[#1ebd59] text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                Send Screenshot & Verify on WhatsApp (03416000758)
              </a>
              <button
                onClick={() => {
                  setClubName('');
                  setCity('');
                  setCoach('');
                  setContact('');
                  setPlayers([{ id: 'p_init_1', name: '', role: 'Captain' }]);
                  setStep(1);
                }}
                className="py-2 px-5 border border-slate-800 text-slate-400 font-black rounded-xl text-xs cursor-pointer transition-all hover:bg-slate-800 hover:text-white"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
