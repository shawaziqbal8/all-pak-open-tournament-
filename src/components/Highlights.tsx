import React from 'react';
import { MatchScore } from '../types';
import { FileText, Trophy, Clock, Target } from 'lucide-react';
import { DateTime } from 'luxon';

export default function Highlights({ matches }: { matches: MatchScore[] }) {
  const completedMatches = matches.filter(m => m.status === 'finished');

  if (completedMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-xl">
        <FileText className="w-12 h-12 text-slate-600 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Highlights Yet</h3>
        <p className="text-slate-400">Match summaries will appear here once games are completed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white mb-2">Match Highlights</h2>
        <p className="text-sm text-slate-400">Key moments and summaries from completed matches.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {completedMatches.map((match) => {
          const isTeam1Winner = match.sets1 > match.sets2;
          const winner = isTeam1Winner ? match.team1 : match.team2;
          const loser = isTeam1Winner ? match.team2 : match.team1;
          const winSets = isTeam1Winner ? match.sets1 : match.sets2;
          const loseSets = isTeam1Winner ? match.sets2 : match.sets1;
          const totalPoints = match.points1 + match.points2;

          return (
            <div key={match.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 transition-colors hover:border-orange-500/50 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-orange-500" />
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Final Score</span>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                {winner} defeats {loser} in a thrilling {winSets}-{loseSets} victory
              </h3>
              
              <p className="text-sm text-slate-400 flex-grow mb-6">
                In a highly competitive matchup, {winner} secured a decisive win over {loser}. 
                The teams battled through multiple sets, with {winner} ultimately taking the match {winSets} sets to {loseSets}. 
                A total of {totalPoints} points were scored throughout the game, showcasing incredible defensive and offensive plays.
              </p>
              
              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 mt-auto">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Played</p>
                  <p className="text-sm text-slate-200">{match.startTime ? DateTime.fromISO(match.startTime).toRelative() : 'Recently'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Total Points</p>
                  <p className="text-sm text-slate-200">{totalPoints} Pts</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
