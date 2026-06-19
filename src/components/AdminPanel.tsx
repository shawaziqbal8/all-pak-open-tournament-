/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Match, Team, RoundType, MatchStatus, TournamentStats } from '../types';
import { Settings, Check, UserCheck, ShieldAlert, Award, Calendar, RefreshCw, Plus, CreditCard, Send, Megaphone } from 'lucide-react';
import MatchInsights from './MatchInsights';

interface AdminPanelProps {
  matches: Match[];
  teams: Team[];
  stats: TournamentStats;
  updateStats: (newStats: TournamentStats) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  removeTeam: (teamId: string) => void;
  onUpdateMatchAll: (matchId: string, updatedParams: Partial<Match>) => void;
  onUpdateTeamPayment: (teamId: string, status: 'paid' | 'pending' | 'unpaid') => void;
  onAddCustomMatch: (newMatch: Match) => void;
  onSendSimulationAlert: (title: string, message: string, type: 'push' | 'email', recipient?: string) => void;
}

export default function AdminPanel({
  matches,
  teams,
  stats,
  updateStats,
  updateTeam,
  removeTeam,
  onUpdateMatchAll,
  onUpdateTeamPayment,
  onAddCustomMatch,
  onSendSimulationAlert
}: AdminPanelProps) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  
  // Custom match form states
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [round, setRound] = useState<RoundType>('quarters');
  const [status, setStatus] = useState<MatchStatus>('scheduled');
  const [time, setTime] = useState('');
  const [court, setCourt] = useState('Court A - Khursheed Khan Ground');
  const [verifyingTeam, setVerifyingTeam] = useState<Team | null>(null);

  // Advertisement form
  const [adMessage, setAdMessage] = useState(stats.featuredAdvertisement || '');
  const [adLink, setAdLink] = useState(stats.featuredAdvertisementLink || '');
  const [adMediaUrl, setAdMediaUrl] = useState(stats.featuredAdvertisementMediaUrl || '');
  const [adMediaType, setAdMediaType] = useState<'image'|'video'|'none'>(stats.featuredAdvertisementMediaType || 'none');

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large! Please select a file smaller than 10MB to sync securely.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAdMediaUrl(reader.result as string);
      setAdMediaType(file.type.startsWith('video/') ? 'video' : 'image');
    };
    reader.readAsDataURL(file);
  };

  const handleAdminVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === '1234' || adminPin === 'admin') {
      setIsAdminLoggedIn(true);
      setAdminPin('');
      return;
    }
    
    try {
      const resp = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pin: adminPin })
      });
      const data = await resp.json();
      
      if (data.success) {
        setIsAdminLoggedIn(true);
        setAdminPin('');
      } else {
        alert(data.message || 'Incorrect Admin Pass PIN! Use demo PIN: "1234", or click Bypass.');
      }
    } catch (err) {
      alert('Error verifying PIN. Please try again.');
    }
  };

  const handleAddMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamAId || !teamBId) {
      alert('Please select both competing clubs.');
      return;
    }
    if (teamAId === teamBId) {
      alert('Competing clubs must be distinct.');
      return;
    }

    const newMatchObj: Match = {
      id: `m_custom_${Date.now()}`,
      teamAId,
      teamBId,
      teamAScore: 0,
      teamBScore: 0,
      setScores: [],
      currentSetPoints: { teamA: 0, teamB: 0 },
      currentSetIndex: 0,
      round,
      status,
      scheduledTime: time || '02 July, 12:00 PM',
      court
    };

    onAddCustomMatch(newMatchObj);
    
    // reset
    setTeamAId('');
    setTeamBId('');
    setTime('');

    onSendSimulationAlert(
      '🏐 Bracket Slot Scheduled!',
      `A new match slot has been scheduled between ${teams.find(t=>t.id===teamAId)?.name} and ${teams.find(t=>t.id===teamBId)?.name} for round: ${round}. Check Brackets!`,
      'push'
    );
  };

  // Helper points incrementors for manual admins
  const handleScorePointChange = (matchId: string, scorer: 'A' | 'B', action: 'up' | 'down') => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const currentPts = { ...match.currentSetPoints };
    if (scorer === 'A') {
      currentPts.teamA = Math.max(0, currentPts.teamA + (action === 'up' ? 1 : -1));
    } else {
      currentPts.teamB = Math.max(0, currentPts.teamB + (action === 'up' ? 1 : -1));
    }

    onUpdateMatchAll(matchId, { currentSetPoints: currentPts });
  };

  const handleSetWinsChange = (matchId: string, team: 'A' | 'B', val: number) => {
    onUpdateMatchAll(matchId, {
      [team === 'A' ? 'teamAScore' : 'teamBScore']: val
    });
  };

  // Switch status
  const handleStatusToggle = (matchId: string, nextStatus: MatchStatus) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    let params: Partial<Match> = { status: nextStatus };
    
    if (nextStatus === 'live') {
      // De-activate other live matches to avoid duplicates
      matches.forEach(m => {
        if (m.status === 'live' && m.id !== matchId) {
          onUpdateMatchAll(m.id, { status: 'scheduled' });
        }
      });
      params.currentSetPoints = { teamA: 0, teamB: 0 };
    } else if (nextStatus === 'completed') {
      // Guess winner
      params.winnerId = match.teamAScore > match.teamBScore ? match.teamAId : match.teamBId;
    }

    onUpdateMatchAll(matchId, params);
  };

  const handleSaveAdvertisement = (e: React.FormEvent) => {
    e.preventDefault();
    updateStats({ 
      ...stats, 
      featuredAdvertisement: adMessage, 
      featuredAdvertisementLink: adLink,
      featuredAdvertisementMediaUrl: adMediaUrl,
      featuredAdvertisementMediaType: adMediaType
    });
    onSendSimulationAlert(
      '📣 New Sponsor Advertisement Live',
      `Sponsor ad has been successfully broadcast to all active clients.`,
      'push'
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 md:p-8 text-slate-300" id="admin-management-portal">
      
      {!isAdminLoggedIn ? (
        <div className="max-w-md mx-auto py-8 text-center space-y-6">
          <div className="w-14 h-14 bg-orange-500/10 text-orange-400 rounded-full flex items-center justify-center mx-auto border border-orange-500/25 shadow-md animate-pulse">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-black text-white">Admin Control Gatekeeper</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Only verified organizers Raham Iqbal Khan, Bakht Zeb & Hamid Anjum authorized below. Access requires pin authorization.
            </p>
          </div>

          <form onSubmit={handleAdminVerify} className="space-y-3.5 max-w-xs mx-auto">
            <input
               type="password"
               placeholder="Enter SECURE Pass PIN"
               className="w-full text-center px-4 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm font-semibold focus:ring-1 focus:ring-orange-500 outline-none font-mono"
               value={adminPin}
               onChange={(e) => setAdminPin(e.target.value)}
            />
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs rounded-xl cursor-pointer transition-all"
              >
                Verify Admin ➔
              </button>
            </div>
          </form>

          <p className="text-[10px] text-slate-500">
            * Organiser Note: Demo system bypass is enabled for review testing. Live administrators configure PIN securely.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Admin Header controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-850 pb-4">
            <div>
              <span className="text-[9px] font-black uppercase text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-lg tracking-widest block w-fit mb-1 animate-pulse">
                ORGANIZER CONTROL ROOM ACTIVE
              </span>
              <h3 className="text-base font-black text-white">Bisham Volleyball Organizer Desk</h3>
              <p className="text-xs text-slate-400">Real-time match adjustment console and lineup verification tables.</p>
            </div>

            <button
              onClick={() => setIsAdminLoggedIn(false)}
              className="py-1.5 px-3 border border-slate-800 rounded-lg text-xs text-slate-450 hover:bg-slate-850 hover:text-white cursor-pointer transition-all"
            >
              Lock Dashboard
            </button>
          </div>

          {/* Core Panel grid: Matches Modifiers and Add Match */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Column A: Match score and status Modifier (Takes 2 columns) */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-orange-500 animate-spin" />
                Live Scores & Status Override Console
              </h4>

              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {matches.map((m) => {
                  const tA = teams.find(t => t.id === m.teamAId);
                  const tB = teams.find(t => t.id === m.teamBId);

                  return (
                    <div key={m.id} className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3 shadow-md">
                      {/* Match header details */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-850 pb-2">
                        <span className="font-mono bg-slate-900 text-orange-400 px-1.5 py-0.5 border border-slate-800 rounded font-bold">{m.round.toUpperCase()}</span>
                        <span className="font-semibold">{m.scheduledTime} • {m.court.split(' - ')[0]}</span>
                      </div>

                      {/* Score control actions */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-2">
                          {/* Team A controls */}
                          <div className="flex items-center gap-3.5">
                            <span className="text-xs font-black text-white w-32 truncate">{tA?.name || 'TBD'}</span>
                            <div className="flex items-center gap-1 bg-slate-900 border border-slate-850 p-0.5 rounded-lg">
                              <button
                                onClick={() => handleScorePointChange(m.id, 'A', 'down')}
                                className="w-6 h-6 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-orange-400 rounded-md font-bold text-xs cursor-pointer transition-all"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-mono font-black text-xs text-white">{m.currentSetPoints.teamA}</span>
                              <button
                                onClick={() => handleScorePointChange(m.id, 'A', 'up')}
                                className="w-6 h-6 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-orange-400 rounded-md font-bold text-xs cursor-pointer transition-all"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Sets Win:</span>
                            <select
                              className="text-xs py-0.5 px-1 pb-1 bg-slate-900 text-slate-300 border border-slate-800 rounded outline-none cursor-pointer focus:ring-1 focus:ring-orange-500"
                              value={m.teamAScore}
                              onChange={(e) => handleSetWinsChange(m.id, 'A', parseInt(e.target.value))}
                            >
                              {[0, 1, 2].map(v => <option key={`vA-${v}`} value={v}>{v}</option>)}
                            </select>
                          </div>

                          {/* Team B controls */}
                          <div className="flex items-center gap-3.5">
                            <span className="text-xs font-black text-white w-32 truncate">{tB?.name || 'TBD'}</span>
                            <div className="flex items-center gap-1 bg-slate-900 border border-slate-850 p-0.5 rounded-lg">
                              <button
                                onClick={() => handleScorePointChange(m.id, 'B', 'down')}
                                className="w-6 h-6 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-orange-400 rounded-md font-bold text-xs cursor-pointer transition-all"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-mono font-black text-xs text-white">{m.currentSetPoints.teamB}</span>
                              <button
                                onClick={() => handleScorePointChange(m.id, 'B', 'up')}
                                className="w-6 h-6 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-orange-400 rounded-md font-bold text-xs cursor-pointer transition-all"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Sets Win:</span>
                            <select
                              className="text-xs py-0.5 px-1 pb-1 bg-slate-900 text-slate-300 border border-slate-800 rounded outline-none cursor-pointer focus:ring-1 focus:ring-orange-500"
                              value={m.teamBScore}
                              onChange={(e) => handleSetWinsChange(m.id, 'B', parseInt(e.target.value))}
                            >
                              {[0, 1, 2].map(v => <option key={`vB-${v}`} value={v}>{v}</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Status controllers */}
                        <div className="flex flex-col gap-1.5 md:items-end">
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold block">Match State Status</span>
                          <div className="flex gap-1.5 bg-slate-900 p-0.5 border border-slate-850 rounded-lg">
                            <button
                              onClick={() => handleStatusToggle(m.id, 'scheduled')}
                              className={`px-2 py-1 text-[9px] font-black rounded-md cursor-pointer transition-all ${m.status === 'scheduled' ? 'bg-slate-850 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                              Schedule
                            </button>
                            <button
                              onClick={() => handleStatusToggle(m.id, 'live')}
                              className={`px-2 py-1 text-[9px] font-black rounded-md cursor-pointer transition-all ${m.status === 'live' ? 'bg-orange-500 text-slate-950 animate-pulse' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                              LIVE
                            </button>
                            <button
                              onClick={() => handleStatusToggle(m.id, 'completed')}
                              className={`px-2 py-1 text-[9px] font-black rounded-md cursor-pointer transition-all ${m.status === 'completed' ? 'bg-slate-800 text-orange-400 border border-orange-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                              End Match
                            </button>
                          </div>
                          
                          {/* Live Server assignment */}
                          {m.status === 'live' && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[9px] text-slate-500 font-medium">Serving Side:</span>
                              <select
                                className="text-[9px] py-0.5 px-1 bg-slate-900 text-slate-300 border border-slate-800 rounded outline-none cursor-pointer focus:ring-1 focus:ring-orange-500"
                                value={m.liveServer || 'A'}
                                onChange={(e) => onUpdateMatchAll(m.id, { liveServer: e.target.value as any })}
                              >
                                <option value="A">Team A Serving</option>
                                <option value="B">Team B Serving</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column B: Registration scheduler & verification */}
            <div className="space-y-6">
              
              {/* Advertisement / Sponsorship control */}
              <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-4 space-y-3">
                 <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                    <Megaphone className="w-4 h-4 text-amber-500" />
                    Sponsor Advertisement Banner
                 </h4>
                 <form onSubmit={handleSaveAdvertisement} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-amber-400 block">Sponsor Message / Headline</label>
                      <input 
                         type="text" 
                         value={adMessage} 
                         onChange={(e) => setAdMessage(e.target.value)}
                         placeholder="e.g. Sponsored by Fawad Group"
                         className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded outline-none text-xs text-white focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-amber-400 block">External Link (Optional)</label>
                      <input 
                         type="url" 
                         value={adLink} 
                         onChange={(e) => setAdLink(e.target.value)}
                         placeholder="https://"
                         className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded outline-none text-xs text-white focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-amber-400 block">Media URL (Video Link / Fallback)</label>
                      <input 
                         type="url" 
                         value={adMediaUrl} 
                         onChange={(e) => {
                             setAdMediaUrl(e.target.value);
                             if (e.target.value.match(/\.(mp4|webm|ogg)$/i) || e.target.value.includes('youtube')) setAdMediaType('video');
                             else if (e.target.value) setAdMediaType('image');
                             else setAdMediaType('none');
                         }}
                         placeholder="https://... (mp4, youtube, or raw image)"
                         className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded outline-none text-xs text-white focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-amber-400 block">Upload Image/Video (Max 10MB)</label>
                      <input 
                         type="file" 
                         accept="image/*,video/mp4,video/webm"
                         onChange={handleMediaUpload}
                         className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-400 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-slate-800 file:text-amber-500 hover:file:bg-slate-700"
                      />
                    </div>
                    <button type="submit" className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded text-xs transition-colors cursor-pointer">
                      Publish Advertisement
                    </button>
                 </form>
              </div>

              {/* Add Custom Match slot Form */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-4.5 space-y-4">
                <h4 className="text-xs font-black text-orange-500 flex items-center gap-1 uppercase tracking-wider">
                  <Plus className="w-4 h-4 text-orange-500" />
                  Scheduler: Slot Compilers
                </h4>

                <form onSubmit={handleAddMatchSubmit} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Team A competing</label>
                    <select
                      className="w-full px-2.5 py-2.5 bg-slate-900 text-white border border-slate-800 rounded-xl outline-none cursor-pointer focus:ring-1 focus:ring-orange-500"
                      value={teamAId}
                      onChange={(e) => setTeamAId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Team --</option>
                      {teams.map(t => <option key={`schA-${t.id}`} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Team B competing</label>
                    <select
                      className="w-full px-2.5 py-2.5 bg-slate-900 text-white border border-slate-800 rounded-xl outline-none cursor-pointer focus:ring-1 focus:ring-orange-500"
                      value={teamBId}
                      onChange={(e) => setTeamBId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Team --</option>
                      {teams.map(t => <option key={`schB-${t.id}`} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Round Type</label>
                      <select
                        className="w-full px-2.5 py-2 bg-slate-900 text-white border border-slate-800 rounded-xl outline-none text-[10px] cursor-pointer focus:ring-1 focus:ring-orange-500"
                        value={round}
                        onChange={(e) => setRound(e.target.value as any)}
                      >
                        <option value="quarters">Quarter Finals</option>
                        <option value="semis">Semi Finals</option>
                        <option value="finals">Grand Finals</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Initial State</label>
                      <select
                        className="w-full px-2.5 py-2 bg-slate-900 text-white border border-slate-800 rounded-xl outline-none text-[10px] cursor-pointer focus:ring-1 focus:ring-orange-500"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="live">Live Now</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-orange-450 block">Date / Timing Slot</label>
                    <input
                      type="text"
                      placeholder="e.g. 02 July, 04:00 PM"
                      className="w-full px-2.5 py-2.5 bg-slate-900 text-white border border-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-orange-500"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black rounded-xl transition-all cursor-pointer"
                  >
                    Lock Bracket Match Slot
                  </button>
                </form>
              </div>

              {/* Verified Club Payments Roster */}
              <div className="bg-slate-950 rounded-xl border border-slate-850 p-4 space-y-3">
                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1">
                  <UserCheck className="w-4 h-4 text-orange-500" />
                  Team Management & Verification
                </h4>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {teams.map((t) => (
                    <div key={`adm-t-${t.id}`} className="flex items-center justify-between text-xs bg-slate-900 border border-slate-850 p-3 rounded-lg hover:border-slate-700 transition-colors">
                      <div className="min-w-0 flex-1 mr-2">
                        <span className="font-bold text-white block truncate text-sm">{t.name}</span>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Coach: {t.coach}</span>
                      </div>

                      <button
                        onClick={() => setVerifyingTeam(t)}
                        className={`text-[9px] font-black px-3 py-1.5 border rounded-lg cursor-pointer transition-all shrink-0 flex items-center gap-1.5 ${t.paymentStatus === 'paid' ? 'bg-orange-500 text-slate-950 border-orange-500/15' : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'}`}
                      >
                        <Settings className="w-3.5 h-3.5" />
                        {t.paymentStatus === 'paid' ? 'Manage' : 'Manage / Verify'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        
          <div className="mt-8 h-[400px]">
            <MatchInsights teams={teams} matches={matches} />
          </div>

        </div>
      )}

      {/* Verification Modal */}
      {verifyingTeam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 text-slate-300">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-500" /> Payment Verification
              </h2>
              <button 
                onClick={() => setVerifyingTeam(null)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold">Team Name</label>
                  <input
                    type="text"
                    value={verifyingTeam.name}
                    onChange={(e) => setVerifyingTeam({...verifyingTeam, name: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded outline-none text-white text-sm focus:border-orange-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div className="space-y-1">
                     <label className="text-[10px] text-slate-500 uppercase font-bold">Coach</label>
                     <input
                       type="text"
                       value={verifyingTeam.coach}
                       onChange={(e) => setVerifyingTeam({...verifyingTeam, coach: e.target.value})}
                       className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded outline-none text-white text-sm focus:border-orange-500"
                     />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] text-slate-500 uppercase font-bold">City</label>
                     <input
                       type="text"
                       value={verifyingTeam.city}
                       onChange={(e) => setVerifyingTeam({...verifyingTeam, city: e.target.value})}
                       className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded outline-none text-white text-sm focus:border-orange-500"
                     />
                   </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                     updateTeam(verifyingTeam.id, {
                        name: verifyingTeam.name,
                        coach: verifyingTeam.coach,
                        city: verifyingTeam.city
                     });
                     alert("Team details updated!");
                  }}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] rounded"
                >
                  Save Team Details
                </button>
                <button
                  onClick={() => {
                     if(window.confirm('Are you sure you want to delete this team completely?')) {
                        removeTeam(verifyingTeam.id);
                        setVerifyingTeam(null);
                     }
                  }}
                  className="py-1.5 px-3 bg-red-500/20 hover:bg-red-500/40 text-red-500 border border-red-500/30 font-bold text-[10px] rounded"
                >
                  Delete Team
                </button>
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Method</span>
                    <span className="text-white font-medium">{verifyingTeam.paymentDetails?.method || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Amount</span>
                    <span className="text-orange-400 font-mono font-bold">Rs. {verifyingTeam.paymentDetails?.amount || 0}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Account Name</span>
                    <span className="text-white">{verifyingTeam.paymentDetails?.accountName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Transaction ID</span>
                    <span className="text-white font-mono">{verifyingTeam.paymentDetails?.transactionId || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment Screenshot Proof</h4>
                {verifyingTeam.paymentDetails?.receiptUrl ? (
                  <div className="w-full h-48 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
                    <img src={verifyingTeam.paymentDetails.receiptUrl} alt="Payment Proof" className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-full h-24 bg-slate-950 rounded-xl border border-slate-800 border-dashed flex flex-col items-center justify-center text-slate-600 space-y-1">
                    <span className="text-sm font-semibold">No Image Uploaded</span>
                    <span className="text-[10px]">Verify via WhatsApp directly instead or reject.</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setVerifyingTeam(null)}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const nextStatus = verifyingTeam.paymentStatus === 'paid' ? 'pending' : 'paid';
                    onUpdateTeamPayment(verifyingTeam.id, nextStatus);
                    onSendSimulationAlert(
                      '💳 Payment Verified',
                      `Simulated Alert: Payment status for club "${verifyingTeam.name}" has been marked to: ${nextStatus.toUpperCase()} by Administrator.`,
                      'push'
                    );
                    setVerifyingTeam(null);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-black transition-colors ${verifyingTeam.paymentStatus === 'paid' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-slate-950'}`}
                >
                  {verifyingTeam.paymentStatus === 'paid' ? 'Revoke Verification' : 'Approve & Mark Paid'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
