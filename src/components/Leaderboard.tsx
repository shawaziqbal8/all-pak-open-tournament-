import React from 'react';
import { MatchScore, TeamReg } from '../types';

export default function Leaderboard({ matches, teams }: { matches: MatchScore[], teams: TeamReg[] }) {
  // Simple calculation for volleyball: 
  // Points logic: win 3-0/3-1 = 3pts, win 3-2 = 2pts, loss 2-3 = 1pt. (Or just generic logic based on wins for now)
  
  const standings = teams.map(team => {
    let wins = 0;
    let losses = 0;
    let points = 0;
    let setsWon = 0;
    let setsLost = 0;

    matches.forEach(m => {
      if (m.status === 'finished') {
        if (m.team1 === team.teamName || m.team2 === team.teamName) {
          const isTeam1 = m.team1 === team.teamName;
          const mySets = isTeam1 ? m.sets1 : m.sets2;
          const opSets = isTeam1 ? m.sets2 : m.sets1;

          setsWon += mySets || 0;
          setsLost += opSets || 0;

          if (mySets > opSets) {
            wins++;
            points += (mySets - opSets > 1) ? 3 : 2; // simplified point system
          } else if (opSets > mySets) {
            losses++;
            points += (opSets - mySets > 1) ? 0 : 1; 
          }
        }
      }
    });

    return { ...team, wins, losses, points, setsWon, setsLost };
  });

  standings.sort((a, b) => b.points - a.points || (b.setsWon - b.setsLost) - (a.setsWon - a.setsLost));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-white">Tournament Standings</h2>
      
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Pos</th>
                <th className="px-6 py-4">Club</th>
                <th className="px-6 py-4 text-center">W</th>
                <th className="px-6 py-4 text-center">L</th>
                <th className="px-6 py-4 text-center">SW</th>
                <th className="px-6 py-4 text-center">SL</th>
                <th className="px-6 py-4 text-right">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {standings.map((team, index) => (
                <tr key={team.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-500">{index + 1}</td>
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                    {team.teamName}
                    {index === 0 && <span className="px-2 py-0.5 bg-orange-500/20 text-orange-500 text-[10px] uppercase rounded-full">Leaders</span>}
                  </td>
                  <td className="px-6 py-4 text-center text-green-400 font-bold">{team.wins}</td>
                  <td className="px-6 py-4 text-center text-red-400 font-bold">{team.losses}</td>
                  <td className="px-6 py-4 text-center text-slate-400">{team.setsWon}</td>
                  <td className="px-6 py-4 text-center text-slate-400">{team.setsLost}</td>
                  <td className="px-6 py-4 text-right font-black text-white text-lg">{team.points}</td>
                </tr>
              ))}
              {standings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No teams have registered or played yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
