import React, { useState, useEffect } from 'react';
import { MatchScore, TeamReg } from '../types';
import { Activity, Calendar, Trophy, Users, BanknotesIcon as Banknotes, ShieldCheck, DollarSign, FileText, X, Clock, Zap, Target } from 'lucide-react';

interface DashboardProps {
  matches: MatchScore[];
  teams: TeamReg[];
  setActiveTab?: (tab: 'dashboard' | 'scores' | 'register' | 'status' | 'admin' | 'leaderboard' | 'schedule' | 'playbook' | 'tickets' | 'venue' | 'highlights' | 'faq') => void;
}

export default function Dashboard({ matches, teams, setActiveTab }: DashboardProps) {
  const [rulesOpen, setRulesOpen] = useState(false);
  const isLoading = matches.length === 0 && teams.length === 0;

  const liveGames = matches.filter(m => m.status === 'live').length;
  const upcomingGames = matches.filter(m => m.status === 'upcoming').length;
  
  const verifiedTeams = teams.filter(t => t.verified).length;
  const fundsRaised = verifiedTeams * 5000;

  // Analytics Aggregation
  const teamStats: Record<string, { pointsScored: number, setsWon: number, setsPlayed: number }> = {};

  matches.forEach(m => {
    if (m.status !== 'upcoming') {
      if (!teamStats[m.team1]) teamStats[m.team1] = { pointsScored: 0, setsWon: 0, setsPlayed: 0 };
      if (!teamStats[m.team2]) teamStats[m.team2] = { pointsScored: 0, setsWon: 0, setsPlayed: 0 };

      teamStats[m.team1].pointsScored += m.points1 || 0;
      teamStats[m.team1].setsWon += m.sets1 || 0;
      teamStats[m.team1].setsPlayed += (m.sets1 || 0) + (m.sets2 || 0);

      teamStats[m.team2].pointsScored += m.points2 || 0;
      teamStats[m.team2].setsWon += m.sets2 || 0;
      teamStats[m.team2].setsPlayed += (m.sets1 || 0) + (m.sets2 || 0);
    }
  });

  let topScoringTeam = { name: '-', points: 0 };
  let topSetWinTeam = { name: '-', percentage: 0 };

  Object.entries(teamStats).forEach(([teamName, stats]) => {
    if (stats.pointsScored > topScoringTeam.points) {
      topScoringTeam = { name: teamName, points: stats.pointsScored };
    }
    
    if (stats.setsPlayed > 0) {
      const percentage = (stats.setsWon / stats.setsPlayed) * 100;
      if (percentage > topSetWinTeam.percentage) {
        topSetWinTeam = { name: teamName, percentage };
      } else if (percentage === topSetWinTeam.percentage && percentage > 0) {
        // Tie breaker could be sets won or simply let it be
      }
    }
  });

  if (topSetWinTeam.percentage === 0 && topScoringTeam.points === 0) {
    topScoringTeam.name = 'N/A';
    topSetWinTeam.name = 'N/A';
  }

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
      
      {setActiveTab && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('register')}
            className="bg-orange-600 hover:bg-orange-500 text-white p-6 rounded-xl flex items-center justify-between group transition-all shadow-lg hover:shadow-orange-500/20"
          >
            <div className="text-left">
              <h3 className="text-2xl font-black mb-1 flex items-center gap-2"><Target className="w-6 h-6" /> Register Your Team</h3>
              <p className="text-orange-200 text-sm font-medium">Secure your spot in the bracket</p>
            </div>
            <div className="bg-white/10 p-3 rounded-full group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('tickets')}
            className="bg-slate-800 hover:bg-slate-700 text-white p-6 rounded-xl flex items-center justify-between group transition-all shadow-lg hover:shadow-slate-700/50 border border-slate-700"
          >
            <div className="text-left">
              <h3 className="text-2xl font-black mb-1 flex items-center gap-2"><Zap className="w-6 h-6 text-orange-500" /> Buy Spectator Tickets</h3>
              <p className="text-slate-400 text-sm font-medium">Get tickets for the main event</p>
            </div>
            <div className="bg-orange-500/10 text-orange-500 p-3 rounded-full group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
          </button>
        </div>
      )}

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

      <div>
        <h2 className="text-2xl font-black text-white mb-6">Top Tournament Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between group hover:border-slate-700 transition-colors">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Most Points Scored</p>
              <p className="text-3xl font-black text-white">{topScoringTeam.name}</p>
              <p className="text-sm text-green-500 font-bold mt-1">{topScoringTeam.points} pts accumulated</p>
            </div>
            <div className="bg-orange-500/10 p-4 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between group hover:border-slate-700 transition-colors">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Highest Set Win Percentage</p>
              <p className="text-3xl font-black text-white">{topSetWinTeam.name}</p>
              <p className="text-sm text-blue-500 font-bold mt-1">{topSetWinTeam.percentage.toFixed(1)}% win rate</p>
            </div>
            <div className="bg-blue-500/10 p-4 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Target className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-black text-white mb-6">Registered Teams Profiles</h2>
        {teams.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center">
            <p className="text-slate-500">No teams registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <div key={team.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-all group overflow-hidden" tabIndex={0}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange-500 transition-colors">{team.teamName}</h3>
                    <p className="text-sm text-slate-400">Capt: {team.captainName}</p>
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded border ${team.verified ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                    {team.verified ? 'Verified' : 'Pending'}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-800">
                  <details className="cursor-pointer group/details">
                    <summary className="text-sm font-bold text-slate-300 hover:text-white transition-colors flex items-center justify-between outline-none">
                      View Player Roster ({team.roster?.length || 0})
                       <span className="text-slate-500 group-open/details:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="mt-4 space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                       {team.roster && team.roster.length > 0 ? team.roster.map((player: any, i: number) => (
                         <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-slate-800/50 last:border-0">
                           <span className="text-slate-300 flex items-center gap-2">
                             <div className="w-5 h-5 rounded bg-slate-800 text-slate-500 flex items-center justify-center text-[10px]">{i + 1}</div>
                             {player.name || player.playerName || 'Unknown'}
                           </span>
                           {player.jerseyNumber && <span className="text-orange-500 font-mono text-xs bg-orange-500/10 px-1.5 rounded">#{player.jerseyNumber}</span>}
                         </div>
                       )) : (
                         <div className="text-sm text-slate-500 italic pb-2">No players listed.</div>
                       )}
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}
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
                 <p className="leading-relaxed">Each team may register up to 14 players. Only players listed on the official roster verified before the tournament starts are eligible. New players cannot be added after the registration deadline. Photo ID may be requested during check-in.</p>
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
