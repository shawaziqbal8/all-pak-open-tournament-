import React from 'react';
import { MatchScore, TeamReg } from '../types';
import { X, Trophy, History, Users, Activity } from 'lucide-react';
import { DateTime } from 'luxon';

interface Props {
  selectedTeam: any;
  setSelectedTeam: (team: any) => void;
  matches: MatchScore[];
}

export default function TeamDetailModal({ selectedTeam, setSelectedTeam, matches }: Props) {
  if (!selectedTeam) return null;

  const teamMatches = matches.filter(m => m.team1 === selectedTeam.teamName || m.team2 === selectedTeam.teamName).sort((a,b) => (b.startTime ? new Date(b.startTime).getTime() : 0) - (a.startTime ? new Date(a.startTime).getTime() : 0));

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-800 bg-slate-800/50">
           <div>
             <h2 className="text-3xl font-black text-white flex items-center gap-3">
               {selectedTeam.teamName}
             </h2>
             <p className="text-orange-500 font-bold uppercase tracking-widest text-xs mt-1">
               {selectedTeam.coach || selectedTeam.captainName} (Captain/Coach) &bull; {selectedTeam.city || 'Shangla'}
             </p>
           </div>
           <button onClick={() => setSelectedTeam(null)} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors self-start border border-slate-700">
             <X className="w-5 h-5" />
           </button>
        </div>
        
        <div className="p-6 md:p-8 overflow-y-auto space-y-8 flex-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl text-center">
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Matches</p>
               <p className="text-3xl font-black text-white">{(selectedTeam.wins || 0) + (selectedTeam.losses || 0)}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-center">
               <p className="text-xs text-green-500 font-bold uppercase tracking-widest mb-1">Wins</p>
               <p className="text-3xl font-black text-green-400">{selectedTeam.wins || 0}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center">
               <p className="text-xs text-red-500 font-bold uppercase tracking-widest mb-1">Losses</p>
               <p className="text-3xl font-black text-red-400">{selectedTeam.losses || 0}</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl text-center">
               <p className="text-xs text-orange-500 font-bold uppercase tracking-widest mb-1">Points</p>
               <p className="text-3xl font-black text-orange-500">{selectedTeam.points || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-orange-500" /> Player Profiles</h3>
                <div className="bg-slate-800/50 border border-slate-800 rounded-xl max-h-60 overflow-y-auto p-2">
                   {selectedTeam.players && selectedTeam.players.length > 0 ? (
                     <div className="divide-y divide-slate-800/50">
                       {selectedTeam.players.map((p: any, i: number) => (
                         <div key={i} className="flex justify-between items-center p-3 text-sm">
                           <span className="font-medium flex items-center gap-2"><div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-mono text-slate-400">{i+1}</div> {p.name || 'Unnamed Player'}</span>
                           {p.jerseyNumber && <span className="font-mono text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded text-xs border border-orange-500/20">#{p.jerseyNumber}</span>}
                         </div>
                       ))}
                     </div>
                   ) : selectedTeam.roster && selectedTeam.roster.length > 0 ? (
                     <div className="divide-y divide-slate-800/50">
                       {selectedTeam.roster.map((p: any, i: number) => (
                         <div key={i} className="flex justify-between items-center p-3 text-sm">
                           <span className="font-medium flex items-center gap-2"><div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-mono text-slate-400">{i+1}</div> {p.playerName || p.name || 'Unnamed Player'}</span>
                           {p.jerseyNumber && <span className="font-mono text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded text-xs border border-orange-500/20">#{p.jerseyNumber}</span>}
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-slate-500 text-sm p-4 text-center italic">Roster details are unavailable.</p>
                   )}
                </div>
             </div>

             <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><History className="w-5 h-5 text-orange-500" /> Match History</h3>
                <div className="space-y-3">
                   {teamMatches.length > 0 ? teamMatches.map(m => {
                     const isTeam1 = m.team1 === selectedTeam.teamName;
                     const opponent = isTeam1 ? m.team2 : m.team1;
                     const mySets = isTeam1 ? m.sets1 : m.sets2;
                     const opSets = isTeam1 ? m.sets2 : m.sets1;
                     const won = mySets > opSets;
                     
                     return (
                       <div key={m.id} className="bg-slate-800/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-sm">
                         <div className="flex flex-col gap-1">
                            <span className="font-bold text-slate-300">vs {opponent}</span>
                            <span className="text-xs text-slate-500">{m.startTime ? DateTime.fromISO(m.startTime).toFormat('LLL dd, HH:mm') : 'Unknown'} &bull; {m.status.toUpperCase()}</span>
                         </div>
                         <div className={`font-black px-3 py-1 rounded border ${m.status === 'finished' ? (won ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-red-500/20 text-red-400 border-red-500/20') : 'bg-slate-700/50 text-slate-400 border-slate-700'}`}>
                           {m.status === 'finished' ? `${mySets} - ${opSets} ${won ? 'W' : 'L'}` : 'TBD'}
                         </div>
                       </div>
                     );
                   }) : (
                     <div className="bg-slate-800/50 border border-slate-800 p-8 rounded-xl text-center">
                        <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">No matches played yet.</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
