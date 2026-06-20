/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { printHtml } from '../utils/print';
import { Team, TournamentStats } from '../types';
import { Search, Trophy, TrendingUp, Users, DollarSign, Activity, CheckCircle2, Download, X, Scale } from 'lucide-react';
import TeamPerformanceModal from './TeamPerformanceModal';

interface LeaderboardProps {
  teams: Team[];
  stats: TournamentStats;
}

export default function Leaderboard({ teams, stats }: LeaderboardProps) {
  const [teamSearch, setTeamSearch] = useState('');
  const [playerSearch, setPlayerSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [performanceTeam, setPerformanceTeam] = useState<Team | null>(null);

  // Only show verified paid teams on the public leaderboard
  const verifiedTeams = teams.filter(t => t.paymentStatus === 'paid');

  // Sort teams based on Points (3 per win, 0 per loss), Sets Won ratio, then Name
  const sortedTeams = [...verifiedTeams].sort((a, b) => {
    const pointsA = (a.points || 0);
    const pointsB = (b.points || 0);
    if (pointsB !== pointsA) return pointsB - pointsA;

    const setsRatioA = (a.setsWon || 0) - (a.setsLost || 0);
    const setsRatioB = (b.setsWon || 0) - (b.setsLost || 0);
    if (setsRatioB !== setsRatioA) return setsRatioB - setsRatioA;

    return a.name.localeCompare(b.name);
  });

  // Filter based on searches
  const filteredTeams = sortedTeams.filter(team =>
    team.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
    team.city.toLowerCase().includes(teamSearch.toLowerCase())
  );

  // Search through all players from verified teams
  const allPlayersWithTeams = verifiedTeams.flatMap(t => 
    t.players.map(p => ({
      ...p,
      teamName: t.name,
      teamCity: t.city,
      teamColor: t.primaryColor
    }))
  );

  const filteredPlayers = playerSearch 
    ? allPlayersWithTeams.filter(p => p.name.toLowerCase().includes(playerSearch.toLowerCase()))
    : [];

  const toggleCompare = (teamId: string) => {
    setCompareIds(prev => {
      if (prev.includes(teamId)) return prev.filter(id => id !== teamId);
      if (prev.length >= 2) return prev; // max 2
      return [...prev, teamId];
    });
  };

  const compareTeams = teams.filter(t => compareIds.includes(t.id));

  // Export helper
  const handleExportCSV = () => {
    const headers = ['Rank', 'Club Name', 'Coach', 'District/City', 'Played', 'Won', 'Lost', 'Sets Won', 'Sets Lost', 'Points'];
    const rows = sortedTeams.map((t, idx) => [
      idx + 1,
      `"${t.name}"`,
      `"${t.coach}"`,
      `"${t.city}"`,
      (t.won || 0) + (t.lost || 0),
      t.won || 0,
      t.lost || 0,
      t.setsWon || 0,
      t.setsLost || 0,
      t.points || 0
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'All_Pakistan_Volleyball_Standings.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Color helper
  const getColorClasses = (color: string) => {
    switch(color) {
      case 'emerald': return 'bg-emerald-500 text-white';
      case 'blue': return 'bg-blue-500 text-white';
      case 'red': return 'bg-red-500 text-white';
      case 'indigo': return 'bg-indigo-500 text-white';
      case 'purple': return 'bg-purple-500 text-white';
      case 'orange': return 'bg-orange-500 text-white';
      case 'teal': return 'bg-teal-500 text-white';
      case 'cyan': return 'bg-cyan-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="space-y-8" id="leaderboard-analytics-view">
      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex items-center gap-4 hover:border-orange-500/20 transition-all">
          <div className="p-3 rounded-xl bg-orange-600/10 text-orange-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Registered Clubs</span>
            <p className="text-3xl font-black text-orange-500 font-mono leading-none mt-1">{stats.totalTeams}</p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex items-center gap-4 hover:border-orange-500/20 transition-all">
          <div className="p-3 rounded-xl bg-rose-955/20 text-rose-450 bg-rose-600/10">
            <Activity className="w-6 h-6 animate-pulse text-rose-500" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Matches Complete</span>
            <p className="text-2xl font-black text-white font-mono leading-none mt-1">
              {stats.completedMatches} <span className="text-[10px] font-normal text-slate-500 font-sans block mt-0.5">Finished</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex items-center gap-4 hover:border-orange-500/20 transition-all">
          <div className="p-3 rounded-xl bg-amber-600/10 text-amber-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Est. Attendance</span>
            <p className="text-2xl font-black text-slate-200 font-mono leading-none mt-1">{stats.totalSpectatorsSimulated}</p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex items-center gap-4 hover:border-orange-500/20 transition-all">
          <div className="p-3 rounded-xl bg-slate-800 text-slate-250">
            <DollarSign className="w-6 h-6 border rounded-full border-slate-600 flex items-center justify-center text-[13px] font-bold" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Raised Funds</span>
            <p className="text-xl font-black text-white font-mono leading-none mt-1">
              Rs. {stats.totalFundsRaised}
            </p>
          </div>
        </div>
      </div>

      {/* Standings Table with Team Filter */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-850 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Tournament Leaderboard & Standings
            </h2>
            <p className="text-xs text-slate-500">Live rankings calculated by sets ratio (Wins = 3pts)</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filter by Team or City..."
                className="w-full pl-9 pr-4 py-2 border border-slate-800 bg-slate-950 text-white rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none placeholder-slate-600"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
              />
            </div>
            <button
              onClick={handleExportCSV}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 hover:border-slate-600 transition-all text-xs font-bold"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-850">
              <tr>
                <th className="px-6 py-3.5">Rank</th>
                <th className="px-6 py-3.5">Club / Team</th>
                <th className="px-6 py-3.5 text-center">Played</th>
                <th className="px-6 py-3.5 text-center border-l border-slate-850/50">Won</th>
                <th className="px-6 py-3.5 text-center">Lost</th>
                <th className="px-6 py-3.5 text-center border-l border-slate-850/50">Sets (W - L)</th>
                <th className="px-6 py-3.5 text-center bg-slate-950/40">Points</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-center" title="Select 2 Teams to Compare">
                  <Scale className="w-4 h-4 inline-block text-slate-500" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredTeams.map((team, idx) => {
                const rank = idx + 1;
                const matchesPlayed = (team.won || 0) + (team.lost || 0);

                return (
                  <tr 
                    key={team.id} 
                    className="hover:bg-slate-800/20 transition-colors cursor-pointer group"
                    onClick={() => setSelectedTeam(team)}
                  >
                    {/* Rank */}
                    <td className="px-6 py-4 font-black font-mono text-white text-sm group-hover:text-orange-400">
                      {rank === 1 ? '🏆' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : String(rank).padStart(2, '0')}
                    </td>

                    {/* Team Profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {team.logoUrl ? (
                           <div className="w-8 h-8 rounded shrink-0 bg-slate-900 border border-slate-700 overflow-hidden shadow-inner flex items-center justify-center">
                             <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                           </div>
                        ) : (
                           <span className={`w-8 h-8 rounded flex items-center justify-center font-bold text-[12px] uppercase shadow-inner shrink-0 ${getColorClasses(team.primaryColor)}`}>
                             {team.name[0]}
                           </span>
                        )}
                        <div>
                          <p 
                            className="font-bold text-white flex items-center gap-1.5 group-hover:underline hover:text-orange-400 cursor-help"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPerformanceTeam(team);
                            }}
                            title="View Graphical Analytics"
                          >
                            {team.name}
                            {team.id === 't7' && <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold px-1 rounded-sm text-[8px] uppercase no-underline">Hosts</span>}
                          </p>
                          <p className="text-[10px] text-slate-500">Coach: {team.coach} • {team.city}</p>
                        </div>
                      </div>
                    </td>

                    {/* Played */}
                    <td className="px-6 py-4 text-center font-mono font-bold text-slate-300">{matchesPlayed}</td>

                    {/* Won */}
                    <td className="px-6 py-4 text-center font-mono font-bold text-orange-400 border-l border-slate-850/30">{team.won || 0}</td>

                    {/* Lost */}
                    <td className="px-6 py-4 text-center font-mono font-bold text-slate-500">{team.lost || 0}</td>

                    {/* Sets ratio */}
                    <td className="px-6 py-4 text-center font-mono text-slate-400 border-l border-slate-850/30">
                      {(team.setsWon || 0)} - {(team.setsLost || 0)}
                    </td>

                    {/* Points */}
                    <td className="px-6 py-4 text-center font-mono font-black text-orange-400 bg-slate-950/45 text-sm">
                      {team.points || 0}
                    </td>

                    {/* Registration status */}
                    <td className="px-6 py-4">
                      {team.paymentStatus === 'paid' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-400 bg-orange-600/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-orange-500 shrink-0" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-800 border border-slate-700/50 px-2.5 py-0.5 rounded-full animate-pulse">
                          ⚠️ Unpaid Fee
                        </span>
                      )}
                    </td>

                    {/* Compare */}
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleCompare(team.id)}
                        disabled={!compareIds.includes(team.id) && compareIds.length >= 2}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${compareIds.includes(team.id) ? 'bg-orange-500 border-orange-500 text-slate-950' : 'bg-slate-900 border-slate-700 text-transparent hover:border-orange-500/50'} ${(!compareIds.includes(team.id) && compareIds.length >= 2) ? 'opacity-50 cursor-not-allowed hidden' : 'cursor-pointer'}`}
                      >
                        {compareIds.includes(team.id) && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredTeams.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-550 text-sm">
                    No registered teams found matching "{teamSearch}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Secondary Row: Quick Player Registration Lookup & Graphical Performance Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Responsive Performance Stats Chart */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-850 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Set Difference Analysis</h3>
            <p className="text-[11px] text-slate-500 mb-4">Total performance representation based on sets win/loss margin status.</p>
          </div>

          <div className="flex items-end justify-center h-48 gap-4 px-2 pt-4">
            {teams.slice(0, 6).map((t) => {
              const diff = (t.setsWon || 0) - (t.setsLost || 0);
              // Calculate height: base at 50%, range -4 to +4 sets, map to 0 to 100%
              const ratio = Math.max(0.1, Math.min(1, 0.5 + (diff / 8)));
              const heightPercent = `${ratio * 100}%`;
              const isPositive = diff >= 0;

              return (
                <div key={t.id} className="flex-1 flex flex-col items-center h-36 justify-end relative group">
                  {/* Tooltip */}
                  <div className="absolute opacity-0 group-hover:opacity-100 -top-8 bg-slate-950 text-white border border-slate-800 rounded-lg px-2 py-0.5 text-[9px] whitespace-nowrap transition-opacity shadow-md pointer-events-none z-10 font-mono">
                    Sets Diff: {diff > 0 ? `+${diff}` : diff}
                  </div>

                  <div 
                    className={`w-full rounded-t-lg transition-all duration-500 hover:brightness-110 ${isPositive ? 'bg-gradient-to-t from-orange-600 to-orange-400 shadow-[0_-2px_6px_rgba(234,88,12,0.2)]' : 'bg-gradient-to-t from-slate-800 to-slate-700 shadow-[0_-2px_6px_rgba(255,255,255,0.05)]'}`}
                    style={{ height: heightPercent }}
                  />
                  <span className="text-[9px] font-mono text-slate-500 mt-2 truncate w-full text-center group-hover:text-slate-300 transition-colors">
                    {t.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-6 text-[10px] text-slate-500 mt-4 border-t border-slate-850 pt-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600" /> Positive Sets Margin
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-750" /> Negative Sets Margin
            </span>
          </div>
        </div>

        {/* Player Roster Fast Finder Section */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-850 flex flex-col">
          <h3 className="text-sm font-bold text-white mb-1">Roster Fast-Finder</h3>
          <p className="text-[11px] text-slate-500 mb-4">Instantly lookup details of any registered volleyball athlete.</p>

          <div className="relative mb-4">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Type player name (e.g. 'Sher Ali', 'Zeeshan')..."
              className="w-full pl-9 pr-4 py-2 border border-slate-800 bg-slate-950 text-white rounded-xl text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none placeholder-slate-650"
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto max-h-[160px] divide-y divide-slate-850 border border-slate-850 rounded-xl p-2 bg-slate-950/30">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-xs border-b border-slate-850/50">
                  <div>
                    <span className="font-bold text-white">{p.name}</span>
                    <p className="text-[10px] text-slate-500">Position/Role: <strong className="text-slate-400">{p.role}</strong></p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase ${getColorClasses(p.teamColor)}`}>
                      {p.teamName}
                    </span>
                    <p className="text-[9px] text-slate-500 mt-0.5">{p.teamCity}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs flex flex-col items-center justify-center h-full">
                <Users className="w-6 h-6 text-slate-700 mb-2" />
                {playerSearch ? 'No players match your search.' : 'Search players to check registration and roles.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Profile Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 text-slate-300">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
             {/* Header */}
            <div className={`p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 ${getColorClasses(selectedTeam.primaryColor).replace('text-white', '')} bg-opacity-10 relative overflow-hidden`}>
               <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/90 pointer-events-none" />
               <div className="relative z-10 flex items-center gap-4">
                 {selectedTeam.logoUrl ? (
                    <div className="w-16 h-16 rounded-xl shrink-0 bg-slate-950 border-2 border-slate-700 overflow-hidden shadow-lg flex items-center justify-center">
                      <img src={selectedTeam.logoUrl} alt={selectedTeam.name} className="w-full h-full object-cover" />
                    </div>
                 ) : (
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-black text-2xl uppercase shadow-lg shrink-0 ${getColorClasses(selectedTeam.primaryColor)}`}>
                      {selectedTeam.name[0]}
                    </div>
                 )}
                 <div>
                   <h2 className="text-2xl font-black text-white leading-tight">{selectedTeam.name}</h2>
                   <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                     <Users className="w-4 h-4" /> {selectedTeam.city}
                   </p>
                 </div>
               </div>
               
               <div className="relative z-10 flex items-center gap-3">
                 <button
                   onClick={() => {
                     const printContent = `
                       <div style="font-family: sans-serif; padding: 20px; border: 2px solid #000; max-width: 400px; margin: 0 auto; text-align: center;">
                         <h1 style="margin-bottom: 5px; text-transform: uppercase;">${selectedTeam.name}</h1>
                         <h3 style="margin-top: 0; color: #555;">${selectedTeam.city}</h3>
                         <div style="margin: 20px 0;">
                           <p><strong>Coach:</strong> ${selectedTeam.coach}</p>
                           <p><strong>Contact:</strong> ${selectedTeam.contactNumber}</p>
                         </div>
                         <div style="text-align: left; background: #eee; padding: 10px; margin-bottom: 20px;">
                           <h4 style="margin: 0 0 10px 0;">Team Roster</h4>
                           <ul style="margin: 0; padding-left: 20px;">
                             ${selectedTeam.players.map(p => `<li>${p.name} (${p.role})</li>`).join('')}
                           </ul>
                         </div>
                         <p style="font-size: 12px; font-weight: bold; margin:0;">OFFICIAL TEAM PASS</p>
                         <p style="font-size: 10px; color: #999; margin-top:5px;">${selectedTeam.id}</p>
                       </div>
                     `;
                     printHtml(`Print Club Pass - ${selectedTeam.name}`, printContent);
                   }}
                   className="py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-orange-500/20"
                 >
                   <Trophy className="w-4 h-4" /> Print Official Pass
                 </button>
                 <button 
                   onClick={() => setSelectedTeam(null)}
                   className="p-2 text-slate-400 hover:text-white bg-slate-950/50 hover:bg-slate-950 rounded-full transition-colors cursor-pointer shrink-0"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                 <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                    <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Played</span>
                    <span className="text-xl font-mono text-white font-black">{(selectedTeam.won || 0) + (selectedTeam.lost || 0)}</span>
                 </div>
                 <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                    <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Won</span>
                    <span className="text-xl font-mono text-orange-500 font-black">{selectedTeam.won || 0}</span>
                 </div>
                 <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                    <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Coach</span>
                    <span className="text-sm font-bold text-slate-300 block truncate">{selectedTeam.coach}</span>
                 </div>
                 <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                    <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Points</span>
                    <span className="text-xl font-mono text-orange-500 font-black">{selectedTeam.points || 0}</span>
                 </div>
              </div>

              <h3 className="text-sm font-bold border-b border-slate-800 pb-2 mb-4 text-white">Official Roster ({selectedTeam.players.length} Players)</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedTeam.players.map((plyr, idx) => (
                  <div key={plyr.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center gap-3">
                     {plyr.photoUrl ? (
                        <div className="w-12 h-12 rounded bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                           <img src={plyr.photoUrl} alt={plyr.name} className="w-full h-full object-cover" />
                        </div>
                     ) : (
                        <div className={`w-12 h-12 rounded flex items-center justify-center font-bold text-sm uppercase shrink-0 ${getColorClasses(selectedTeam.primaryColor)}`}>
                           {plyr.name.substring(0, 2)}
                        </div>
                     )}
                     <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">{plyr.name}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{plyr.role}</p>
                     </div>
                     <span className="text-[10px] font-mono text-slate-600 font-black">#{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Banner for Compare selection */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 z-[90] w-[90%] max-w-lg">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 font-bold flex items-center justify-center text-orange-500">
               <Scale className="w-5 h-5" />
            </div>
            <div>
               <h4 className="text-sm text-white font-bold text-center md:text-left">{compareIds.length}/2 Teams Selected</h4>
               <p className="text-[10px] text-slate-400">Select teams from the table to compare side-by-side</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCompareIds([])}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Clear
            </button>
            <button 
              disabled={compareIds.length !== 2}
              onClick={() => setShowCompareModal(true)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${compareIds.length === 2 ? 'bg-orange-500 hover:bg-orange-600 text-slate-950 cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'}`}
            >
              Compare
            </button>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && compareTeams.length === 2 && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 text-slate-300">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-orange-500/10 shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
               <h2 className="text-lg font-black text-white flex items-center gap-2">
                 <Scale className="w-5 h-5 text-orange-500" /> Head-to-Head Comparison
               </h2>
               <button 
                 onClick={() => {
                    setShowCompareModal(false);
                    setCompareIds([]);
                 }}
                 className="p-2 text-slate-400 hover:text-white bg-slate-950/50 hover:bg-slate-950 rounded-full transition-colors cursor-pointer"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
               <div className="grid grid-cols-3 gap-4 items-center border-b border-slate-800 pb-8 mb-8">
                  {/* Team A */}
                  <div className="flex flex-col items-center text-center">
                     {compareTeams[0].logoUrl ? (
                        <div className="w-20 h-20 md:w-24 md:h-24 mb-4 rounded-2xl shrink-0 bg-slate-950 border-2 border-slate-700 overflow-hidden shadow-lg flex items-center justify-center">
                          <img src={compareTeams[0].logoUrl} alt={compareTeams[0].name} className="w-full h-full object-cover" />
                        </div>
                     ) : (
                        <div className={`w-20 h-20 md:w-24 md:h-24 mb-4 rounded-2xl flex items-center justify-center font-black text-3xl md:text-4xl uppercase shadow-lg shrink-0 ${getColorClasses(compareTeams[0].primaryColor)}`}>
                          {compareTeams[0].name[0]}
                        </div>
                     )}
                     <h3 className="text-xl md:text-2xl font-black text-white w-full">{compareTeams[0].name}</h3>
                     <p className="text-xs md:text-sm text-slate-400 mt-1">{compareTeams[0].city}</p>
                  </div>

                  <div className="text-center font-black text-2xl md:text-4xl italic text-slate-800 px-4">VS</div>

                  {/* Team B */}
                  <div className="flex flex-col items-center text-center">
                     {compareTeams[1].logoUrl ? (
                        <div className="w-20 h-20 md:w-24 md:h-24 mb-4 rounded-2xl shrink-0 bg-slate-950 border-2 border-slate-700 overflow-hidden shadow-lg flex items-center justify-center">
                          <img src={compareTeams[1].logoUrl} alt={compareTeams[1].name} className="w-full h-full object-cover" />
                        </div>
                     ) : (
                        <div className={`w-20 h-20 md:w-24 md:h-24 mb-4 rounded-2xl flex items-center justify-center font-black text-3xl md:text-4xl uppercase shadow-lg shrink-0 ${getColorClasses(compareTeams[1].primaryColor)}`}>
                          {compareTeams[1].name[0]}
                        </div>
                     )}
                     <h3 className="text-xl md:text-2xl font-black text-white w-full">{compareTeams[1].name}</h3>
                     <p className="text-xs md:text-sm text-slate-400 mt-1">{compareTeams[1].city}</p>
                  </div>
               </div>

               {/* Stats comparison */}
               <div className="space-y-2 max-w-2xl mx-auto">
                 {[
                   { label: 'Total Points', a: compareTeams[0].points || 0, b: compareTeams[1].points || 0 },
                   { label: 'Matches Won', a: compareTeams[0].won || 0, b: compareTeams[1].won || 0 },
                   { label: 'Matches Lost', a: compareTeams[0].lost || 0, b: compareTeams[1].lost || 0 },
                   { label: 'Sets Won', a: compareTeams[0].setsWon || 0, b: compareTeams[1].setsWon || 0 },
                   { label: 'Sets Ratio', a: `${compareTeams[0].setsWon || 0} / ${compareTeams[0].setsLost || 0}`, b: `${compareTeams[1].setsWon || 0} / ${compareTeams[1].setsLost || 0}` },
                   { label: 'Roster Size', a: `${compareTeams[0].players.length} Players`, b: `${compareTeams[1].players.length} Players` },
                 ].map((stat, i) => {
                   const aVal = typeof stat.a === 'number' ? stat.a : parseFloat(stat.a.toString().split(' ')[0]);
                   const bVal = typeof stat.b === 'number' ? stat.b : parseFloat(stat.b.toString().split(' ')[0]);
                   // Basic highlighting except for 'Matches Lost' where lower is better
                   let aHighlight = aVal > bVal;
                   let bHighlight = bVal > aVal;
                   if (stat.label === 'Matches Lost') {
                     aHighlight = aVal < bVal;
                     bHighlight = bVal < aVal;
                   }
                   
                   return (
                     <div key={i} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-850 transition-colors hover:border-slate-700">
                       <div className={`flex-1 text-center font-mono font-bold text-sm md:text-base ${aHighlight ? 'text-orange-400 text-shadow-glow' : 'text-slate-400'}`}>{stat.a}</div>
                       <div className="w-24 md:w-32 text-center text-[9px] md:text-[10px] uppercase font-bold text-slate-500 break-words">{stat.label}</div>
                       <div className={`flex-1 text-center font-mono font-bold text-sm md:text-base ${bHighlight ? 'text-orange-400 text-shadow-glow' : 'text-slate-400'}`}>{stat.b}</div>
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Modal */}
      <TeamPerformanceModal 
        team={performanceTeam} 
        onClose={() => setPerformanceTeam(null)} 
      />
    </div>
  );
}
