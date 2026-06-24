import React, { useState, useEffect } from 'react';
import { MatchScore, TeamReg } from '../types';
import { Activity, Calendar, Trophy, Users, Banknote, ShieldCheck, DollarSign, FileText, X, Clock, Zap, Target, MapPin, LayoutDashboard } from 'lucide-react';

interface DashboardProps {
  matches: MatchScore[];
  teams: TeamReg[];
  setActiveTab?: (tab: 'dashboard' | 'scores' | 'register' | 'status' | 'admin' | 'leaderboard' | 'schedule' | 'playbook' | 'tickets' | 'venue' | 'highlights' | 'faq') => void;
}

export default function Dashboard({ matches, teams, setActiveTab }: DashboardProps) {
  const [rulesOpen, setRulesOpen] = useState(false);
  const isLoading = matches.length === 0 && teams.length === 0;

  const liveGames = matches.filter(m => m.status === 'live').length;
  const upcomingGames = matches.filter(m => m.status === 'published').length;
  
  const verifiedTeamsList = teams.filter(t => t.isVerified);
  const verifiedTeams = verifiedTeamsList.length;
  const fundsRaised = verifiedTeams * 5000;

  // Analytics Aggregation
  const teamStats: Record<string, { pointsScored: number, setsWon: number, setsPlayed: number }> = {};

  matches.forEach(m => {
    if (m.status !== 'published') {
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
      <div className="bg-gradient-to-br from-orange-600 to-red-600 border border-orange-500/50 p-8 rounded-2xl relative overflow-hidden shadow-2xl mb-12">
        <div className="absolute top-0 right-0 p-4 opacity-10 translate-x-8 -translate-y-8 pointer-events-none">
          <Clock className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">Tournament Countdown</h2>
            <p className="text-orange-200 font-bold tracking-[0.2em] uppercase text-sm md:text-base">Starting 2 July</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-center justify-start lg:justify-end">
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[80px] shadow-inner">
              <p className="text-4xl font-black text-white">{timeLeft.days}</p>
              <p className="text-[10px] font-black text-orange-200/80 uppercase tracking-widest mt-1">Days</p>
            </div>
            <div className="text-white/30 text-4xl font-black">:</div>
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[80px] shadow-inner">
              <p className="text-4xl font-black text-white">{timeLeft.hours}</p>
              <p className="text-[10px] font-black text-orange-200/80 uppercase tracking-widest mt-1">Hours</p>
            </div>
            <div className="text-white/30 text-4xl font-black">:</div>
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[80px] shadow-inner">
              <p className="text-4xl font-black text-white">{timeLeft.minutes}</p>
              <p className="text-[10px] font-black text-orange-200/80 uppercase tracking-widest mt-1">Mins</p>
            </div>
            <div className="text-white/30 text-4xl font-black">:</div>
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[80px] shadow-inner">
               <p className="text-4xl font-black text-white">{timeLeft.seconds}</p>
               <p className="text-[10px] font-black text-orange-200/80 uppercase tracking-widest mt-1">Secs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tournament Information Portal Box */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/80 p-8 rounded-2xl shadow-xl mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none scale-150 translate-x-12 -translate-y-12">
          <Trophy className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10">
          <div className="text-center md:text-left mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
              <span className="text-orange-500">🏆</span> All Pakistan Open Volleyball Tournament
            </h1>
            <p className="text-slate-400 font-medium tracking-wide">Registration is now officially open! Join or register your club to claim the title.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl flex items-start gap-4 hover:border-orange-500/30 transition-colors">
              <div className="bg-orange-500/10 p-3 rounded-lg text-orange-500 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-1">Venue</h4>
                <p className="text-white font-medium text-sm leading-relaxed">Khursheed Khan Volleyball Ground,<br/>Taja Maira, Bisham, Shangla.</p>
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl flex items-start gap-4 hover:border-orange-500/30 transition-colors">
              <div className="bg-orange-500/10 p-3 rounded-lg text-orange-500 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-1">Starting Date</h4>
                <p className="text-white font-medium text-lg">2 July</p>
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl flex items-start gap-4 hover:border-orange-500/30 transition-colors">
              <div className="bg-orange-500/10 p-3 rounded-lg text-orange-500 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-1">Chief Organizers</h4>
                <p className="text-white font-medium">Raham Iqbal Khan &<br/>Bakht Zeb</p>
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl flex items-start gap-4 hover:border-orange-500/30 transition-colors">
              <div className="bg-orange-500/10 p-3 rounded-lg text-orange-500 shrink-0">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-1">Sponsored By</h4>
                <p className="text-white font-medium">FGC<br/><span className="text-sm text-slate-400 normal-case tracking-normal font-normal">(Fawad Group of Companies)</span></p>
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl flex items-start gap-4 hover:border-orange-500/30 transition-colors">
              <div className="bg-orange-500/10 p-3 rounded-lg text-orange-500 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-1">Contact</h4>
                <p className="text-white font-medium text-lg">0306-0888584</p>
              </div>
            </div>
            
            {setActiveTab && (
              <div className="flex items-center justify-center p-2">
                <button 
                  onClick={() => setActiveTab('register')}
                  className="w-full h-full min-h-[80px] bg-white hover:bg-slate-200 text-slate-900 font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border border-white"
                >
                  Register Now <Zap className="w-5 h-5 text-orange-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {setActiveTab && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button 
            onClick={() => setActiveTab('register')}
            className="bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 border border-orange-500/50 text-white p-8 rounded-2xl flex items-center justify-between group transition-all shadow-xl shadow-orange-500/20"
          >
            <div className="text-left">
              <h3 className="text-3xl font-black mb-2 flex items-center gap-3"><Target className="w-8 h-8" /> Register Team</h3>
              <p className="text-orange-100 font-medium tracking-wide">Secure your spot in the bracket</p>
            </div>
            <div className="bg-black/20 p-4 rounded-full group-hover:scale-110 group-hover:rotate-6 transition-transform border border-white/10 shadow-inner">
              <Users className="w-8 h-8" />
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('tickets')}
            className="bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-700 text-white p-8 rounded-2xl flex items-center justify-between group transition-all shadow-xl hover:shadow-slate-700/50"
          >
            <div className="text-left">
              <h3 className="text-3xl font-black mb-2 flex items-center gap-3"><Zap className="w-8 h-8 text-orange-500" /> Buy Tickets</h3>
              <p className="text-slate-400 font-medium tracking-wide">Get tickets for the main event</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-full group-hover:scale-110 group-hover:-rotate-6 transition-transform border border-slate-800 shadow-inner text-orange-500">
              <DollarSign className="w-8 h-8" />
            </div>
          </button>
        </div>
      )}

      <div className="mb-12">
        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2"><LayoutDashboard className="w-6 h-6 text-orange-500" /> Tournament Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-colors shadow-lg">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Registered Teams</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-white">{isLoading ? '-' : verifiedTeamsList.length}</p>
                {!isLoading && <p className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full">{verifiedTeams} verified</p>}
              </div>
            </div>
            <div className="bg-blue-500/10 p-4 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-inner">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-colors shadow-lg">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Funds Raised</p>
              <p className="text-4xl font-black text-white tracking-tight">{isLoading ? '-' : `Rs ${fundsRaised.toLocaleString()}`}</p>
            </div>
            <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors shadow-inner">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-orange-500/50 transition-colors shadow-lg">
            {liveGames > 0 && <div className="absolute top-0 right-0 w-2 h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse"></div>}
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Live Matches</p>
              <p className="text-4xl font-black text-white">{isLoading ? '-' : liveGames}</p>
            </div>
            <div className={`p-4 rounded-2xl transition-colors shadow-inner ${liveGames > 0 ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300'}`}>
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-colors shadow-lg">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Upcoming Games</p>
              <p className="text-4xl font-black text-white">{isLoading ? '-' : upcomingGames}</p>
            </div>
            <div className="bg-orange-500/10 p-4 rounded-2xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors shadow-inner">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2"><Trophy className="w-6 h-6 text-orange-500" /> Top Tournament Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-colors shadow-lg">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Most Points Scored</p>
              <p className="text-4xl font-black text-white truncate max-w-[200px]" title={topScoringTeam.name}>{topScoringTeam.name}</p>
              <p className="text-sm text-emerald-400 font-bold mt-2 flex items-center gap-1"><Zap className="w-4 h-4" /> {topScoringTeam.points} pts accumulated</p>
            </div>
            <div className="bg-orange-500/10 p-5 rounded-2xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors shadow-inner">
              <Zap className="w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-colors shadow-lg">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Highest Win Percentage</p>
              <p className="text-4xl font-black text-white truncate max-w-[200px]" title={topSetWinTeam.name}>{topSetWinTeam.name}</p>
              <p className="text-sm text-blue-400 font-bold mt-2 flex items-center gap-1"><Target className="w-4 h-4" /> {topSetWinTeam.percentage.toFixed(1)}% win rate</p>
            </div>
            <div className="bg-blue-500/10 p-5 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-inner">
              <Target className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2"><Users className="w-6 h-6 text-orange-500" /> Registered Teams Profiles</h2>
        {verifiedTeamsList.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center shadow-lg">
            <p className="text-slate-500">No teams registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verifiedTeamsList.map(team => (
              <div key={team.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all group overflow-hidden shadow-lg relative" tabIndex={0}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h3 className="text-xl font-black text-white mb-1 group-hover:text-orange-400 transition-colors">{team.teamName}</h3>
                    <p className="text-sm text-slate-400 flex items-center gap-2">
                       <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Capt</span> {team.captainName}
                    </p>
                  </div>
                  <div className={`text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded bg-slate-950 border ${team.isVerified ? 'text-emerald-400 border-emerald-500/30' : 'text-orange-400 border-orange-500/30'}`}>
                    {team.isVerified ? 'Verified' : 'Pending'}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-800 relative z-10">
                  <details className="cursor-pointer group/details [&_summary::-webkit-details-marker]:hidden">
                     <summary className="text-sm font-bold text-slate-300 hover:text-white transition-colors flex items-center justify-between outline-none bg-slate-950 p-3 rounded-xl border border-slate-800">
                      Roster ({team.roster?.length || 0})
                       <span className="text-slate-500 group-open/details:rotate-180 transition-transform">▼</span>
                     </summary>
                     <div className="mt-2 space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-2 bg-slate-950/50 p-2 rounded-xl">
                       {team.roster && team.roster.length > 0 ? team.roster.map((player: any, i: number) => (
                         <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
                           <span className="text-slate-300 flex items-center gap-3">
                             <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-bold">{i + 1}</div>
                             {player.name || player.playerName || 'Unknown'}
                           </span>
                           {player.jerseyNumber && <span className="text-orange-400 font-mono text-xs bg-orange-500/10 px-2 py-0.5 rounded font-bold border border-orange-500/20">#{player.jerseyNumber}</span>}
                         </div>
                       )) : (
                         <div className="text-sm text-slate-500 italic p-2 text-center">No players listed.</div>
                       )}
                     </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <FileText className="w-48 h-48" />
         </div>
         <div className="relative z-10 text-center sm:text-left mb-6 sm:mb-0">
           <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Official Rules & Guidelines</h3>
           <p className="text-slate-400 text-sm max-w-md">Review the tournament format, rules, and conduct regulations to ensure your team is well-prepared and fully compliant.</p>
         </div>
         <button onClick={() => setRulesOpen(true)} className="relative z-10 flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-200 font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 shrink-0 w-full sm:w-auto">
           <FileText className="w-5 h-5 text-orange-600" />
           View Official Rules
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
