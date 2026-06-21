import React, { useState, useEffect } from 'react';
import { MatchScore, TeamReg } from '../types';
import { Activity, Calendar, Trophy, Users, BanknotesIcon as Banknotes, ShieldCheck, DollarSign, FileText, X, Clock } from 'lucide-react';

interface DashboardProps {
  matches: MatchScore[];
  teams: TeamReg[];
}

export default function Dashboard({ matches, teams }: DashboardProps) {
  const [rulesOpen, setRulesOpen] = useState(false);
  const isLoading = matches.length === 0 && teams.length === 0;

  const liveGames = matches.filter(m => m.status === 'live').length;
  const upcomingGames = matches.filter(m => m.status === 'upcoming').length;
  
  const verifiedTeams = teams.filter(t => t.verified).length;
  const fundsRaised = verifiedTeams * 5000;

  const targetDate = new Date('2026-07-02T00:00:00').getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-orange-600 border border-orange-500 p-6 rounded-xl relative overflow-hidden shadow-lg mb-8">
        <div className="absolute top-0 right-0 p-4 opacity-20 translate-x-4 -translate-y-4">
          <Clock className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Tournament Countdown</h2>
            <p className="text-orange-200 font-medium tracking-wide">Starting 2 July</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-center">
            <div className="bg-black/20 backdrop-blur rounded-xl p-3 min-w-[70px]">
              <p className="text-3xl font-black text-white">{timeLeft.days}</p>
              <p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">Days</p>
            </div>
            <div className="bg-black/20 backdrop-blur rounded-xl p-3 min-w-[70px]">
              <p className="text-3xl font-black text-white">{timeLeft.hours}</p>
              <p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">Hours</p>
            </div>
            <div className="bg-black/20 backdrop-blur rounded-xl p-3 min-w-[70px]">
              <p className="text-3xl font-black text-white">{timeLeft.minutes}</p>
              <p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">Mins</p>
            </div>
            <div className="bg-black/20 backdrop-blur rounded-xl p-3 min-w-[70px]">
               <p className="text-3xl font-black text-white">{timeLeft.seconds}</p>
               <p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">Secs</p>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-black text-white mb-6">Tournament Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between group hover:border-slate-700 transition-colors">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Registered Teams</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-white">{isLoading ? '-' : teams.length}</p>
                {!isLoading && <p className="text-xs text-green-500 font-bold">({verifiedTeams} verified)</p>}
              </div>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between group hover:border-slate-700 transition-colors">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Funds Raised</p>
              <p className="text-3xl font-black text-white">{isLoading ? '-' : `Rs. ${fundsRaised.toLocaleString()}`}</p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-xl text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between relative overflow-hidden group hover:border-orange-500/50 transition-colors">
            {liveGames > 0 && <div className="absolute top-0 right-0 w-2 h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse"></div>}
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Live Matches</p>
              <p className="text-3xl font-black text-white">{isLoading ? '-' : liveGames}</p>
            </div>
            <div className={`p-3 rounded-xl transition-colors ${liveGames > 0 ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300'}`}>
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between group hover:border-slate-700 transition-colors">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Upcoming Games</p>
              <p className="text-3xl font-black text-white">{isLoading ? '-' : upcomingGames}</p>
            </div>
            <div className="bg-orange-500/10 p-3 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl flex items-center justify-between">
         <div>
           <h3 className="text-xl font-bold text-white mb-2">Official Rules & Guidelines</h3>
           <p className="text-slate-400 text-sm">Review the tournament format, rules, and conduct regulations.</p>
         </div>
         <button onClick={() => setRulesOpen(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">
           <FileText className="w-5 h-5 text-orange-500" />
           View Tournament Rules
         </button>
      </div>

      {rulesOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 max-w-2xl w-full rounded-2xl p-6 md:p-8 relative max-h-[80vh] overflow-y-auto">
            <button 
              onClick={() => setRulesOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
               <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-orange-500" /> Tournament Rules
            </h2>
            <div className="space-y-6 text-sm text-slate-300">
               <div>
                 <h3 className="text-orange-500 font-bold text-lg mb-2">1. Format & Timing</h3>
                 <p className="leading-relaxed">Matches consist of best-of-3 sets. Each set is played to 25 points, win by 2. Deciding set (if needed) is played to 15 points. Teams must arrive 15 minutes before scheduled match time; failure to do so results in a forfeit. Timeouts are limited to 2 per set.</p>
               </div>
               <div>
                 <h3 className="text-orange-500 font-bold text-lg mb-2">2. Roster & Eligibility</h3>
                 <p className="leading-relaxed">Each team may register up to 12 players. Only players listed on the official roster verified before the tournament starts are eligible. New players cannot be added after the registration deadline. Photo ID may be requested during check-in.</p>
               </div>
               <div>
                 <h3 className="text-orange-500 font-bold text-lg mb-2">3. Conduct & Sportsmanship</h3>
                 <p className="leading-relaxed">Sportsmanship is paramount. Unsportsmanlike conduct, abuse toward referees or staff, or physical altercations will result in immediate disqualification of the entire team without refund. Decision of the official umpires is entirely final.</p>
               </div>
               <div>
                 <h3 className="text-orange-500 font-bold text-lg mb-2">4. Uniforms</h3>
                 <p className="leading-relaxed">Teams must wear matching colored jerseys with visible numbers on the front and back. Libero must wear a contrasting color jersey. Appropriate non-marking athletic footwear is strictly required.</p>
               </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-800 text-right">
              <button 
                onClick={() => setRulesOpen(false)}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-8 rounded-xl transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
