import React, { useState, useEffect } from 'react';
import { MatchScore, TeamReg } from '../types';
import { Activity, Calendar, Trophy, Users, BanknotesIcon as Banknotes, ShieldCheck, DollarSign } from 'lucide-react';

interface DashboardProps {
  matches: MatchScore[];
  teams: TeamReg[];
}

export default function Dashboard({ matches, teams }: DashboardProps) {
  const [showAd, setShowAd] = useState(true);

  const liveGames = matches.filter(m => m.status === 'live').length;
  const upcomingGames = matches.filter(m => m.status === 'upcoming').length;
  
  const verifiedTeams = teams.filter(t => t.verified).length;
  const fundsRaised = verifiedTeams * 5000;

  return (
    <div className="space-y-8">
      {showAd && (
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 p-4 rounded-xl flex items-center justify-between animate-in fade-in zoom-in duration-500">
          <div>
            <h3 className="font-black text-orange-400">⚡ SPONSOR MESSAGE</h3>
            <p className="text-sm text-orange-200">Get 20% off high-performance Volleyball gear at SportsHub using code: APOV2026</p>
          </div>
          <button onClick={() => setShowAd(false)} className="text-orange-400 hover:text-white px-3 py-1 bg-black/20 rounded-lg text-xs font-bold uppercase transition-colors">Close</button>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-black text-white mb-6">Tournament Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between group hover:border-slate-700 transition-colors">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Registered Teams</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-white">{teams.length}</p>
                <p className="text-xs text-green-500 font-bold">({verifiedTeams} verified)</p>
              </div>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between group hover:border-slate-700 transition-colors">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Funds Raised</p>
              <p className="text-3xl font-black text-white">Rs. {fundsRaised.toLocaleString()}</p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-xl text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between relative overflow-hidden group hover:border-orange-500/50 transition-colors">
            {liveGames > 0 && <div className="absolute top-0 right-0 w-2 h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse"></div>}
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Live Matches</p>
              <p className="text-3xl font-black text-white">{liveGames}</p>
            </div>
            <div className={`p-3 rounded-xl transition-colors ${liveGames > 0 ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300'}`}>
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between group hover:border-slate-700 transition-colors">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Upcoming Games</p>
              <p className="text-3xl font-black text-white">{upcomingGames}</p>
            </div>
            <div className="bg-orange-500/10 p-3 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl">
         <h3 className="text-xl font-bold text-white mb-4">Official Rules & Guidelines</h3>
         <div className="prose prose-invert prose-sm max-w-none text-slate-400">
           <ul className="space-y-2">
             <li>All matches will be played best of 3 sets for preliminary rounds, and best of 5 for semi-finals and finals.</li>
             <li>Sets are played to 25 points with a minimum 2-point lead. Deciding sets are played to 15 points.</li>
             <li>Captains must check in at the official's desk at least 30 minutes before the scheduled start time.</li>
             <li>Substitutions are limited to 6 per set per team.</li>
             <li>Entry fee of Rs. 5000 is strictly non-refundable and must be paid to secure the bracket spot.</li>
           </ul>
         </div>
      </div>
    </div>
  );
}
