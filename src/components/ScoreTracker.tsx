import React from 'react';
import { MatchScore } from '../types';
import { Socket } from 'socket.io-client';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface ScoreTrackerProps {
  matches: MatchScore[];
  socket: Socket | null;
}

export default function ScoreTracker({ matches, socket }: ScoreTrackerProps) {
  const handleScoreUpdate = async (matchId: string, updates: Partial<MatchScore>) => {
    try {
      await updateDoc(doc(db, 'matches', matchId), updates);
    } catch (e) {
      console.error('Failed to update score', e);
    }
  };

  const incrementPoint = (match: MatchScore, team: 1 | 2) => {
    if (team === 1) {
       handleScoreUpdate(match.id, { points1: (match.points1 || 0) + 1 });
    } else {
       handleScoreUpdate(match.id, { points2: (match.points2 || 0) + 1 });
    }
  };

  const decrementPoint = (match: MatchScore, team: 1 | 2) => {
    if (team === 1) {
       handleScoreUpdate(match.id, { points1: Math.max(0, (match.points1 || 0) - 1) });
    } else {
       handleScoreUpdate(match.id, { points2: Math.max(0, (match.points2 || 0) - 1) });
    }
  };

  const incrementSet = (match: MatchScore, team: 1 | 2) => {
    if (team === 1) {
       handleScoreUpdate(match.id, { sets1: (match.sets1 || 0) + 1, points1: 0, points2: 0 });
    } else {
       handleScoreUpdate(match.id, { sets2: (match.sets2 || 0) + 1, points1: 0, points2: 0 });
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black text-white">Live Score Tracker</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {matches.map((match) => (
          <div key={match.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg relative">
            {match.status === 'live' && (
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 animate-pulse"></div>
            )}
            <div className={`px-4 py-2 text-center text-[10px] font-black uppercase tracking-widest ${match.status === 'live' ? 'bg-red-500/10 text-red-500 border-b border-red-500/20' : match.status === 'finished' ? 'bg-slate-800 border-b border-slate-700 text-slate-400' : 'bg-blue-500/10 text-blue-500 border-b border-blue-500/20'}`}>
              <span className="flex items-center justify-center gap-2">
                {match.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>}
                {match.status}
              </span>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-6">
                {/* Team 1 */}
                <div className="text-right">
                  <p className="font-bold text-lg md:text-xl text-slate-100 leading-tight mb-2 truncate">{match.team1}</p>
                  <p className="text-sm font-bold text-slate-500">SETS: <span className="text-orange-500 text-lg">{match.sets1 || 0}</span></p>
                </div>
                
                {/* Points logic */}
                <div className="flex justify-center items-center gap-4 bg-slate-950 px-6 py-4 rounded-xl border border-slate-800/80">
                  <span className={`text-4xl md:text-5xl font-black tabular-nums ${match.status === 'live' ? 'text-white' : 'text-slate-400'}`}>
                    {match.points1 || 0}
                  </span>
                  <span className="text-slate-600 font-bold">:</span>
                  <span className={`text-4xl md:text-5xl font-black tabular-nums ${match.status === 'live' ? 'text-white' : 'text-slate-400'}`}>
                    {match.points2 || 0}
                  </span>
                </div>
                
                {/* Team 2 */}
                <div className="text-left">
                  <p className="font-bold text-lg md:text-xl text-slate-100 leading-tight mb-2 truncate">{match.team2}</p>
                  <p className="text-sm font-bold text-slate-500">SETS: <span className="text-orange-500 text-lg">{match.sets2 || 0}</span></p>
                </div>
              </div>

              {match.status === 'live' && (
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest mb-4">Official Ref Controls</p>
                  
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                    {/* Team 1 controls */}
                    <div className="space-y-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => decrementPoint(match, 1)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold">-</button>
                        <button onClick={() => incrementPoint(match, 1)} className="flex-1 max-w-[100px] h-10 flex items-center justify-center gap-1 rounded-lg bg-red-600/20 text-red-500 hover:bg-red-500 hover:text-white font-bold transition-colors">
                          +1 PT
                        </button>
                      </div>
                      <div className="flex justify-end">
                        <button onClick={() => incrementSet(match, 1)} className="text-xs font-bold text-slate-500 hover:text-orange-400 uppercase py-1 px-2 border border-slate-800 hover:border-orange-500/30 rounded flex items-center gap-1">
                          Win Set
                        </button>
                      </div>
                    </div>
                    
                    <div className="w-px h-full bg-slate-800"></div>

                    {/* Team 2 controls */}
                    <div className="space-y-3">
                      <div className="flex justify-start gap-2">
                        <button onClick={() => incrementPoint(match, 2)} className="flex-1 max-w-[100px] h-10 flex items-center justify-center gap-1 rounded-lg bg-red-600/20 text-red-500 hover:bg-red-500 hover:text-white font-bold transition-colors">
                          +1 PT
                        </button>
                        <button onClick={() => decrementPoint(match, 2)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold">-</button>
                      </div>
                      <div className="flex justify-start">
                        <button onClick={() => incrementSet(match, 2)} className="text-xs font-bold text-slate-500 hover:text-orange-400 uppercase py-1 px-2 border border-slate-800 hover:border-orange-500/30 rounded flex items-center gap-1">
                          Win Set
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
