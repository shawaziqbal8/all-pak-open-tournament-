/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Match, Team } from '../types';
import { Calendar, MapPin, Play, Award, Zap, Award as TrophyIcon, RefreshCw } from 'lucide-react';

interface LiveBracketsProps {
  matches: Match[];
  teams: Team[];
  updateMatchScore: (matchId: string, teamAScore: number, teamBScore: number, setScores: {teamA: number, teamB: number}[], currentSetPoints: {teamA: number, teamB: number}, status: 'scheduled' | 'live' | 'completed', winnerId?: string) => void;
  triggerPushNotification: (title: string, message: string) => void;
}

const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const difference = targetDate.getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft(null);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return <div className="text-orange-500 font-bold text-lg animate-pulse">It's Match Day!</div>;

  return (
    <div className="flex items-center gap-4 text-center">
      <div className="flex flex-col items-center bg-slate-950 px-4 py-3 border border-slate-800 rounded-xl">
        <span className="text-3xl font-mono font-black text-white">{timeLeft.days}</span>
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Days</span>
      </div>
      <div className="flex flex-col items-center bg-slate-950 px-4 py-3 border border-slate-800 rounded-xl">
        <span className="text-3xl font-mono font-black text-white">{timeLeft.hours}</span>
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Hours</span>
      </div>
      <div className="flex flex-col items-center bg-slate-950 px-4 py-3 border border-slate-800 rounded-xl">
        <span className="text-3xl font-mono font-black text-white">{timeLeft.minutes}</span>
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Mins</span>
      </div>
      <div className="flex flex-col items-center bg-slate-950 px-4 py-3 border border-slate-800 rounded-xl">
        <span className="text-3xl font-mono font-black text-orange-400">{timeLeft.seconds}</span>
        <span className="text-[10px] text-orange-500 uppercase font-bold tracking-widest mt-1">Secs</span>
      </div>
    </div>
  );
};

export default function LiveBrackets({ matches, teams, updateMatchScore, triggerPushNotification }: LiveBracketsProps) {
  const [activeTab, setActiveTab] = useState<'round' | 'tree'>('round');
  const [activeRound, setActiveRound] = useState<'quarters' | 'semis' | 'finals'>('quarters');
  
  // Simulation states
  const [simulatingMatchId, setSimulatingMatchId] = useState<string | null>(null);
  const [playByPlayMessage, setPlayByPlayMessage] = useState<string>('Ready for rally action!');
  const [server, setServer] = useState<'A' | 'B'>('A');

  const getTeam = (id: string): Team | undefined => teams.find(t => t.id === id);

  // Filter matches by round
  const roundMatches = matches.filter(m => m.round === activeRound);

  // Active live match if any
  const liveMatch = matches.find(m => m.status === 'live');

  // Serve Rally Simulation
  useEffect(() => {
    if (!simulatingMatchId || !liveMatch) return;

    const matchToSim = matches.find(m => m.id === simulatingMatchId);
    if (!matchToSim || matchToSim.status !== 'live') {
      setSimulatingMatchId(null);
      return;
    }

    const playLogs = [
      "🔥 Incredible Smash backcourt by {Captain}!",
      "⚡ Lightning fast Serve-Ace by {Spiker}!",
      "🛡️ Spectacular Block defense at the net!",
      "🏐 Brilliant Libero dig rescues a critical rally!",
      "💨 Unforced error - serve hits the net mesh!",
      "🎯 Perfectly placed set setup by {Setter} leads to point!",
      "💥 Powerful spike flies completely out of bounds!"
    ];

    const interval = setInterval(() => {
      // Pick random point scorer
      const scorer = Math.random() > 0.48 ? 'A' : 'B';
      const scoringTeam = scorer === 'A' ? getTeam(liveMatch.teamAId) : getTeam(liveMatch.teamBId);
      const losingTeam = scorer === 'A' ? getTeam(liveMatch.teamBId) : getTeam(liveMatch.teamAId);
      
      if (!scoringTeam || !losingTeam) return;

      // Increment points
      let nextPointsA = liveMatch.currentSetPoints.teamA + (scorer === 'A' ? 1 : 0);
      let nextPointsB = liveMatch.currentSetPoints.teamB + (scorer === 'B' ? 1 : 0);

      const captain = scoringTeam.players.find(p => p.role === 'Captain')?.name || 'Captain';
      const spiker = scoringTeam.players.find(p => p.role === 'Spiker')?.name || 'Spiker';
      const setter = scoringTeam.players.find(p => p.role === 'Setter')?.name || 'Setter';

      // Pick a log line and replace placeholders
      let randomLog = playLogs[Math.floor(Math.random() * playLogs.length)]
        .replace('{Captain}', captain)
        .replace('{Spiker}', spiker)
        .replace('{Setter}', setter);

      // Determine Server Change
      if (scorer !== server) {
        setServer(scorer);
        randomLog += ` (${scoringTeam.name} serves next!)`;
      }

      setPlayByPlayMessage(randomLog);

      // Check current set win (standard 25, tie breaker set 3 of 15, must win by 2)
      const targetPoints = liveMatch.currentSetIndex === 2 ? 15 : 25;
      
      let nextSetScores = [...liveMatch.setScores];
      let nextSetIndex = liveMatch.currentSetIndex;
      let nextScoreA = liveMatch.teamAScore;
      let nextScoreB = liveMatch.teamBScore;
      let nextStatus = liveMatch.status;
      let winnerId: string | undefined = undefined;

      if ((nextPointsA >= targetPoints || nextPointsB >= targetPoints) && Math.abs(nextPointsA - nextPointsB) >= 2) {
        // We have a set winner!
        const setWinner = nextPointsA > nextPointsB ? 'A' : 'B';
        
        // Add to set scores log
        nextSetScores.push({ teamA: nextPointsA, teamB: nextPointsB });
        
        // Reset rally points for next sets
        nextPointsA = 0;
        nextPointsB = 0;

        if (setWinner === 'A') {
          nextScoreA += 1;
        } else {
          nextScoreB += 1;
        }

        // Check if overall match won (Best of 3 sets, first to 2 wins)
        if (nextScoreA === 2) {
          nextStatus = 'completed';
          winnerId = liveMatch.teamAId;
          triggerPushNotification(
            '🏆 MATCH OVER - ' + scoringTeam.name + ' WINS!',
            `${scoringTeam.name} defeats ${losingTeam.name} (${nextScoreA}-${nextScoreB}). What a match at Khursheed Khan Ground!`
          );
          setSimulatingMatchId(null);
          setPlayByPlayMessage(`Match concluded! ${scoringTeam.name} wins total match!`);
        } else if (nextScoreB === 2) {
          nextStatus = 'completed';
          winnerId = liveMatch.teamBId;
          triggerPushNotification(
            '🏆 MATCH OVER - ' + scoringTeam.name + ' WINS!',
            `${scoringTeam.name} defeats ${losingTeam.name} (${nextScoreB}-${nextScoreA}). What a match at Khursheed Khan Ground!`
          );
          setSimulatingMatchId(null);
          setPlayByPlayMessage(`Match concluded! ${scoringTeam.name} wins total match!`);
        } else {
          // Next set begins
          nextSetIndex += 1;
          const setNumber = nextSetIndex + 1;
          triggerPushNotification(
            `🏐 Set ${setNumber - 1} Concluded!`,
            `${scoringTeam.name} wins Set ${setNumber - 1}. Starting Set ${setNumber} now!`
          );
        }
      }

      // Update state in main app data
      updateMatchScore(
        liveMatch.id,
        nextScoreA,
        nextScoreB,
        nextSetScores,
        { teamA: nextPointsA, teamB: nextPointsB },
        nextStatus,
        winnerId
      );

    }, 2800);

    return () => clearInterval(interval);
  }, [simulatingMatchId, liveMatch, server, matches, updateMatchScore, triggerPushNotification]);

  // Handle color helper
  const getColorClasses = (color: string) => {
    switch(color) {
      case 'emerald': return 'bg-emerald-500 text-white border-emerald-600';
      case 'blue': return 'bg-blue-500 text-white border-blue-650';
      case 'red': return 'bg-red-500 text-white border-red-600';
      case 'indigo': return 'bg-indigo-500 text-white border-indigo-600';
      case 'purple': return 'bg-purple-500 text-white border-purple-650';
      case 'orange': return 'bg-orange-500 text-white border-orange-600';
      case 'teal': return 'bg-teal-500 text-white border-teal-600';
      case 'cyan': return 'bg-cyan-500 text-white border-cyan-600';
      default: return 'bg-slate-500 text-white border-slate-600';
    }
  };

  return (
    <div className="space-y-8" id="live-bracket-view">
      
      {/* 1. Center Court Live Scoreboard */}
      {liveMatch ? (
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden" id="scoreboard-livedrive">
          <div className="absolute top-0 right-0 p-3 bg-red-600/20 text-red-500 text-[9px] border-b border-l border-slate-800 font-bold tracking-widest uppercase rounded-bl-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-505 bg-red-500 block animate-ping" /> LIVE SCOREBOARD
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 mt-2">
            {/* Team A Profile */}
            <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-2">
              <span className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-2 shadow-md ${getColorClasses(getTeam(liveMatch.teamAId)?.primaryColor || 'slate')}`}>
                {getTeam(liveMatch.teamAId)?.name[0]}
              </span>
              <div>
                <h4 className="font-black text-white text-base leading-snug">{getTeam(liveMatch.teamAId)?.name}</h4>
                <p className="text-xs text-orange-400/90">Coach: {getTeam(liveMatch.teamAId)?.coach}</p>
                {liveMatch.liveServer === 'A' && (
                  <span className="inline-block mt-1 bg-orange-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider animate-bounce">
                    🏐 SERVING
                  </span>
                )}
              </div>
            </div>

            {/* Scores Center Frame */}
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-850 text-center">
              <div className="text-[10px] text-slate-550 uppercase tracking-widest font-black mb-1.5">
                {liveMatch.currentSetIndex === 2 ? 'Set 3 (TIE-BREAKER)' : `Set ${liveMatch.currentSetIndex + 1}`}
              </div>
              
              <div className="flex items-center justify-center gap-6">
                {/* Rally score A */}
                <span className="text-4xl font-mono font-black text-white tracking-widest">
                  {liveMatch.currentSetPoints.teamA}
                </span>
                <span className="text-xl font-bold text-slate-700">:</span>
                {/* Rally score B */}
                <span className="text-4xl font-mono font-black text-orange-400 tracking-widest">
                  {liveMatch.currentSetPoints.teamB}
                </span>
              </div>

              {/* Set Records Line */}
              <div className="mt-3 flex gap-2 items-center justify-center text-xs text-slate-400">
                <span className="font-bold text-slate-550">Sets:</span>
                <span className="bg-orange-500/20 text-orange-400 font-bold px-1.5 py-0.5 rounded border border-orange-500/10">
                  {liveMatch.teamAScore} Wins
                </span>
                <span className="text-slate-650">-</span>
                <span className="bg-slate-850 text-slate-300 font-bold px-1.5 py-0.5 rounded border border-slate-800">
                  {liveMatch.teamBScore} Wins
                </span>
              </div>

              {/* Historic sets scores if any */}
              {liveMatch.setScores.length > 0 && (
                <div className="mt-2 text-[10px] text-slate-500 font-mono">
                  Prev Sets: {liveMatch.setScores.map((s, i) => `[S${i+1}: ${s.teamA}-${s.teamB}]`).join(' ')}
                </div>
              )}
            </div>

            {/* Team B Profile */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
              <span className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-2 shadow-md ${getColorClasses(getTeam(liveMatch.teamBId)?.primaryColor || 'slate')}`}>
                {getTeam(liveMatch.teamBId)?.name[0]}
              </span>
              <div>
                <h4 className="font-black text-white text-base leading-snug">{getTeam(liveMatch.teamBId)?.name}</h4>
                <p className="text-xs text-orange-400/90">Coach: {getTeam(liveMatch.teamBId)?.coach}</p>
                {liveMatch.liveServer === 'B' && (
                  <span className="inline-block mt-1 bg-orange-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider animate-bounce">
                    🏐 SERVING
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-850 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Play log overlay */}
            <div className="flex items-center gap-2 text-slate-300 italic min-h-[22px]">
              <Zap className="w-4 h-4 text-orange-500 shrink-0 animate-pulse" />
              <span>{playByPlayMessage}</span>
            </div>

            {/* Simulator Toggler */}
            <button
              onClick={() => {
                if (simulatingMatchId) {
                  setSimulatingMatchId(null);
                  setPlayByPlayMessage('Rally simulation paused.');
                } else {
                  setSimulatingMatchId(liveMatch.id);
                  setPlayByPlayMessage('Simulation active! Rally begun on center court...');
                }
              }}
              className={`px-4 py-2 font-bold tracking-tight rounded-xl flex items-center gap-2 transition-all cursor-pointer ${simulatingMatchId ? 'bg-red-650 hover:bg-red-750 text-white' : 'bg-orange-500 hover:bg-orange-600 text-slate-950 font-black'}`}
              id="rally-sim-toggle"
            >
              <RefreshCw className={`w-4 h-4 ${simulatingMatchId ? 'animate-spin' : ''}`} />
              {simulatingMatchId ? 'Pause Volleys' : 'Simulate Live Rally'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-805 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center mb-4">
             <Calendar className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Next Match Begins On July 2nd, 2026</h3>
          <p className="text-sm text-slate-400 max-w-lg mx-auto mb-6">
            There are no live matches on the court right now. Preparations are underway for the grand opening ceremony and the first preliminary matches.
          </p>
          <CountdownTimer targetDate={new Date("2026-07-02T00:00:00")} />
        </div>
      )}

      {/* 2. Visual Navigation and Brackets View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('round')}
              className={`px-4 py-2 font-bold text-xs rounded-xl transition-colors cursor-pointer ${activeTab === 'round' ? 'bg-orange-600/20 text-orange-450 border border-orange-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              Match Schedule List
            </button>
            <button
              onClick={() => setActiveTab('tree')}
              className={`px-4 py-2 font-bold text-xs rounded-xl transition-colors cursor-pointer ${activeTab === 'tree' ? 'bg-orange-600/20 text-orange-450 border border-orange-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              Visual Bracket Tree
            </button>
          </div>

          {activeTab === 'round' && (
            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
              {['quarters', 'semis', 'finals'].map((rnd) => (
                <button
                  key={rnd}
                  onClick={() => setActiveRound(rnd as any)}
                  className={`px-3 py-1.5 font-bold text-[10px] uppercase rounded-lg transition-colors cursor-pointer ${activeRound === rnd ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30' : 'text-slate-500 hover:text-slate-200'}`}
                >
                  {rnd}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab 1: Match list categorized by active round */}
        {activeTab === 'round' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roundMatches.map((m) => {
              const teamA = getTeam(m.teamAId);
              const teamB = getTeam(m.teamBId);

              return (
                <div key={m.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between hover:border-orange-500/20 transition-all">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-3 border-b border-slate-850 pb-2 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{m.scheduledTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-550" />
                        <span className="truncate max-w-[140px] uppercase">{m.court.split('-')[0]}</span>
                      </div>
                    </div>

                    {/* Team Rows */}
                    <div className="space-y-3.5 py-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] uppercase ${teamA ? getColorClasses(teamA.primaryColor) : 'bg-slate-800 text-slate-500'}`}>
                            {teamA ? teamA.name[0] : '?'}
                          </span>
                          <span className={`text-xs font-bold leading-none ${m.winnerId === m.teamAId ? 'text-white font-extrabold pr-1.5 border-r border-slate-800' : 'text-slate-400'}`}>
                            {teamA ? teamA.name : 'TBD Team'}
                          </span>
                          {m.winnerId === m.teamAId && <TrophyIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-300 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-850">
                          {m.status === 'completed' ? m.teamAScore : (m.status === 'live' ? m.currentSetPoints.teamA : '-')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] uppercase ${teamB ? getColorClasses(teamB.primaryColor) : 'bg-slate-800 text-slate-500'}`}>
                            {teamB ? teamB.name[0] : '?'}
                          </span>
                          <span className={`text-xs font-bold leading-none ${m.winnerId === m.teamBId ? 'text-white font-extrabold pr-1.5 border-r border-slate-800' : 'text-slate-400'}`}>
                            {teamB ? teamB.name : 'TBD Team'}
                          </span>
                          {m.winnerId === m.teamBId && <TrophyIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-300 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-850">
                          {m.status === 'completed' ? m.teamBScore : (m.status === 'live' ? m.currentSetPoints.teamB : '-')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-[10px]">
                    <div>
                      {m.status === 'completed' ? (
                        <span className="text-orange-450 font-bold bg-orange-600/10 border border-orange-500/20 px-2 py-0.5 rounded-xl">Completed Match</span>
                      ) : (m.status === 'live' ? (
                        <span className="text-red-500 font-bold bg-rose-600/10 border border-red-500/20 px-2 py-0.5 rounded-xl animate-pulse">🔴 Live Court</span>
                      ) : (
                        <span className="text-slate-400 font-bold bg-slate-950 px-2 py-0.5 rounded-xl border border-slate-850">Scheduled slot</span>
                      ))}
                    </div>

                    {m.status === 'completed' && m.setScores.length > 0 && (
                      <span className="font-mono text-slate-500">
                        Scores: {m.setScores.map(s => `${s.teamA}-${s.teamB}`).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Beautiful Visual Tree Bracket Representing 8 Teams Flow */}
        {activeTab === 'tree' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 overflow-x-auto">
            <div className="min-w-[700px] flex items-center justify-between relative py-6">
              
              {/* Column 1: Quarter Finals */}
              <div className="flex flex-col gap-8 justify-between w-52 shrink-0">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest text-center border-b border-slate-850 pb-1.5 font-mono">Quarter Finals</span>
                
                {[0, 1, 2, 3].map((idx) => {
                  const m = matches[idx];
                  const teamA = m ? getTeam(m.teamAId) : null;
                  const teamB = m ? getTeam(m.teamBId) : null;

                  return (
                    <div key={`tree-q-${idx}`} className="bg-slate-950 hover:bg-slate-900/40 border border-slate-850 rounded-xl p-2.5 text-xs relative flex flex-col justify-center space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`truncate w-32 font-semibold ${m?.winnerId === m?.teamAId ? 'text-white font-bold' : 'text-slate-550'}`}>
                          {teamA ? teamA.name.split(' ')[0] + ' ' + (teamA.name.split(' ')[1] || '') : 'TBD'}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-slate-400 pr-1">{m?.status === 'completed' ? m.teamAScore : '-'}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-850/65 pt-1">
                        <span className={`truncate w-32 font-semibold ${m?.winnerId === m?.teamBId ? 'text-white font-bold' : 'text-slate-550'}`}>
                          {teamB ? teamB.name.split(' ')[0] + ' ' + (teamB.name.split(' ')[1] || '') : 'TBD'}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-slate-400 pr-1">{m?.status === 'completed' ? m.teamBScore : '-'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Connector columns lines can be drawn virtually */}
              <div className="w-12 h-64 border-y-2 border-r-2 border-slate-850 rounded-r-lg shrink-0 flex items-center justify-end text-slate-500">
                <span className="text-[9px] -mr-8 font-extrabold font-mono text-orange-450 py-1 px-1.5 bg-slate-900 border border-slate-800 rounded z-10">Semis</span>
              </div>

              {/* Column 2: Semi Finals */}
              <div className="flex flex-col gap-28 justify-center w-52 shrink-0">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest text-center border-b border-slate-850 pb-1.5 font-mono">Semi Finals</span>

                {[4, 5].map((idx) => {
                  const m = matches[idx];
                  const teamA = m ? getTeam(m.teamAId) : null;
                  const teamB = m ? getTeam(m.teamBId) : null;

                  return (
                    <div key={`tree-s-${idx}`} className="bg-slate-950 border border-slate-805 rounded-xl p-2.5 text-xs flex flex-col justify-center space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`truncate w-32 font-semibold ${m?.winnerId === m?.teamAId ? 'text-white font-bold' : 'text-slate-550'}`}>
                          {teamA ? teamA.name : 'Winner Q1'}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-slate-400 pr-1">{m?.status === 'completed' ? m.teamAScore : '-'}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-850 pt-1">
                        <span className={`truncate w-32 font-semibold ${m?.winnerId === m?.teamBId ? 'text-white font-bold' : 'text-slate-550'}`}>
                          {teamB ? teamB.name : 'Winner Q2'}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-slate-400 pr-1">{m?.status === 'completed' ? m.teamBScore : '-'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Connecting lines column */}
              <div className="w-12 h-36 border-y-2 border-r-2 border-slate-850 rounded-r-lg shrink-0 flex items-center justify-end text-slate-500">
                <span className="text-[9px] -mr-8 font-extrabold font-mono text-orange-400 py-1 px-1.5 bg-slate-900 border border-slate-800 rounded z-10">Final</span>
              </div>

              {/* Column 3: Finals Table */}
              <div className="flex flex-col gap-2 justify-center w-52 shrink-0">
                <span className="text-[10px] font-extrabold text-slate-550 uppercase tracking-widest text-center border-b border-slate-850 pb-1.5 font-mono">Trophy Final Match</span>

                {(() => {
                  const m = matches[6];
                  const teamA = m ? getTeam(m.teamAId) : null;
                  const teamB = m ? getTeam(m.teamBId) : null;

                  return (
                    <div className="bg-gradient-to-br from-orange-950/20 to-slate-950 border border-orange-500/30 rounded-xl p-3 text-xs flex flex-col justify-center space-y-2.5 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className={`truncate w-32 font-black ${m?.winnerId === m?.teamAId ? 'text-orange-450 font-black' : 'text-slate-500'}`}>
                          🥇 {teamA ? teamA.name : 'Semi Winner 1'}
                        </span>
                        <span className="font-mono text-xs font-bold text-orange-450 bg-orange-600/20 px-1.5 py-0.5 border border-orange-500/20 rounded">{m?.status === 'completed' ? m.teamAScore : '-'}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-850 pt-2">
                        <span className={`truncate w-32 font-black ${m?.winnerId === m?.teamBId ? 'text-orange-450 font-black' : 'text-slate-500'}`}>
                          🥈 {teamB ? teamB.name : 'Semi Winner 2'}
                        </span>
                        <span className="font-mono text-xs font-bold text-orange-450 bg-orange-600/20 px-1.5 py-0.5 border border-orange-500/20 rounded">{m?.status === 'completed' ? m.teamBScore : '-'}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
