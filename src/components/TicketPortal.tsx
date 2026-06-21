import React, { useState } from 'react';
import { MatchScore } from '../types';
import { Ticket, Calendar, CheckCircle2 } from 'lucide-react';

interface TicketPortalProps {
  matches: MatchScore[];
}

export default function TicketPortal({ matches }: TicketPortalProps) {
  const [selectedMatch, setSelectedMatch] = useState<MatchScore | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const upcomingMatches = matches.filter(m => m.status === 'upcoming');

  const handlePurchase = () => {
    setIsProcessing(true);
    // Mock payment delay
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedMatch(null);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-white mb-2">Ticket Portal</h2>
        <p className="text-sm text-slate-400">Buy tickets for upcoming matches to secure your seat in the arena.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="space-y-4 lg:col-span-3">
          <h3 className="text-lg font-bold text-slate-200">Upcoming Live Matches</h3>
          {upcomingMatches.length === 0 ? (
            <div className="text-slate-500 text-sm bg-slate-900 border border-slate-800 p-6 rounded-xl text-center">
              No upcoming matches available for ticketing at this moment.
            </div>
          ) : (
            upcomingMatches.map(match => (
              <div 
                key={match.id} 
                className={`bg-slate-900 border ${selectedMatch?.id === match.id ? 'border-orange-500' : 'border-slate-800'} p-5 rounded-xl cursor-pointer hover:border-orange-500/50 transition-colors`}
                onClick={() => {
                  setSelectedMatch(match);
                  setSuccess(false);
                }}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded">Standard Access</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
                    <Calendar className="w-3 h-3" />
                    {match.startTime ? new Date(match.startTime).toLocaleDateString() : 'Date TBA'}
                  </div>
                </div>
                <div className="font-black text-white text-xl mb-1">{match.team1} vs {match.team2}</div>
                <div className="text-sm text-slate-500 mt-2 flex justify-between items-end">
                   <span>General Admission</span>
                   <span className="font-bold text-green-400 text-lg">$15.00</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl sticky top-6">
            <h3 className="text-xl font-bold text-white mb-4">Checkout</h3>
            {!selectedMatch ? (
              <div className="text-sm text-slate-500 pb-4 text-center py-10">
                <Ticket className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                Select a match to continue with payment.
              </div>
            ) : success ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
                <p className="text-green-500 font-bold text-lg">Payment Successful!</p>
                <p className="text-slate-400 text-sm text-center">Your e-ticket has been sent to your registered email address.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Selected Event</p>
                  <p className="font-black text-white mb-1">{selectedMatch.team1}</p>
                  <p className="text-slate-500 text-xs italic mb-1">versus</p>
                  <p className="font-black text-white">{selectedMatch.team2}</p>
                  <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {selectedMatch.startTime ? new Date(selectedMatch.startTime).toLocaleString() : 'Date/Time TBA'}
                  </p>
                </div>
                
                <div className="space-y-3 pb-4 border-b border-slate-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">1x Standard Pass</span>
                    <span className="text-white">$15.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Taxes & Fees</span>
                    <span className="text-white">$2.50</span>
                  </div>
                </div>
                
                <div className="flex justify-between font-black text-xl">
                  <span className="text-white">Total</span>
                  <span className="text-green-400">$17.50</span>
                </div>

                <div className="pt-2 space-y-4">
                   <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-400 uppercase">Card Number (Mock)</label>
                     <input type="text" placeholder="**** **** **** ****" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-orange-500 text-sm transition-colors" />
                   </div>
                   <div className="flex gap-4">
                     <div className="space-y-1 flex-1">
                       <label className="text-xs font-bold text-slate-400 uppercase">Expiry</label>
                       <input type="text" placeholder="MM/YY" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-orange-500 text-sm transition-colors" />
                     </div>
                     <div className="space-y-1 flex-1">
                       <label className="text-xs font-bold text-slate-400 uppercase">CVC</label>
                       <input type="text" placeholder="***" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-orange-500 text-sm transition-colors" />
                     </div>
                   </div>
                </div>

                <button 
                  onClick={handlePurchase}
                  disabled={isProcessing}
                  className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors mt-2 flex items-center justify-center gap-2 text-lg shadow-lg"
                >
                  {isProcessing ? 'Processing Payment...' : (
                    <><Ticket className="w-5 h-5" /> Pay $17.50</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
