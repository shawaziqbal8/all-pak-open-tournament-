import React, { useState } from 'react';
import { MatchScore, TeamReg } from '../types';
import { Socket } from 'socket.io-client';
import { CheckCircle2, ChevronRight, MessageCircle, Send, ShieldAlert, XCircle, Plus, Calendar as CalendarIcon, Clock, Edit2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

export default function AdminDashboard({ matches, teams, socket }: { matches: MatchScore[], teams: TeamReg[], socket: Socket | null }) {
  const [activeTab, setActiveTab] = useState<'registrations' | 'bracket' | 'notifications' | 'analytics'>('registrations');
  const [notificationMsg, setNotificationMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Schedule state
  const [newMatchTeam1, setNewMatchTeam1] = useState('');
  const [newMatchTeam2, setNewMatchTeam2] = useState('');
  const [newMatchDate, setNewMatchDate] = useState('');

  const pendingTeams = teams.filter(t => !t.verified);
  const verifiedTeams = teams.filter(t => t.verified);

  const handleVerify = async (teamId: string, verified: boolean) => {
    try {
      await updateDoc(doc(db, 'teams', teamId), { verified });
    } catch(e) {
      console.error(e);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationMsg) return;
    setIsSending(true);
    try {
      await fetch('/api/whatsapp/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: notificationMsg })
      });
      setNotificationMsg('');
      alert('Notification sent to all verified teams!');
    } catch(e) {
      alert('Failed to send notification.');
    } finally {
      setIsSending(false);
    }
  };

  const handleScheduleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatchTeam1 || !newMatchTeam2 || !newMatchDate) return;
    if (newMatchTeam1 === newMatchTeam2) {
       alert('Teams must be different.');
       return;
    }
    
    const id = 'm' + Math.random().toString(36).substring(2, 9);
    const newMatch: MatchScore = {
      id,
      team1: newMatchTeam1,
      team2: newMatchTeam2,
      sets1: 0,
      sets2: 0,
      points1: 0,
      points2: 0,
      status: 'upcoming',
      startTime: new Date(newMatchDate).toISOString()
    };

    try {
      await setDoc(doc(db, 'matches', id), newMatch);
      setNewMatchTeam1('');
      setNewMatchTeam2('');
      setNewMatchDate('');
      alert('Match scheduled successfully!');
    } catch(err) {
      console.error(err);
      alert('Failed to schedule match.');
    }
  };

  const handleWhatsAppContact = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getTeamContact = (teamName: string) => {
    const team = teams.find(t => t.teamName === teamName);
    return team ? team.contactDetails : '';
  };

  const notifyMatchScheduled = (match: MatchScore, team: 1 | 2) => {
    const contact = getTeamContact(team === 1 ? match.team1 : match.team2);
    const time = match.startTime ? new Date(match.startTime).toLocaleString() : 'TBD';
    const msg = `Hi! Your upcoming match is scheduled: ${match.team1} vs ${match.team2} at ${time}. Please be on time!`;
    
    if (contact) handleWhatsAppContact(contact, msg);
  };

  // Analytics
  const totalMatches = matches.length;
  const completedMatches = matches.filter(m => m.status === 'finished').length;
  const totalSets = matches.reduce((acc, m) => acc + (m.sets1 || 0) + (m.sets2 || 0), 0);
  const totalPoints = matches.reduce((acc, m) => acc + (m.points1 || 0) + (m.points2 || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        <button onClick={() => setActiveTab('registrations')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'registrations' ? 'bg-red-500/20 text-red-500' : 'text-slate-400 hover:text-slate-200'}`}>
          Registrations ({pendingTeams.length} Pending)
        </button>
        <button onClick={() => setActiveTab('bracket')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'bracket' ? 'bg-red-500/20 text-red-500' : 'text-slate-400 hover:text-slate-200'}`}>
          Schedule Matches
        </button>
        <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'analytics' ? 'bg-red-500/20 text-red-500' : 'text-slate-400 hover:text-slate-200'}`}>
          Analytics
        </button>
        <button onClick={() => setActiveTab('notifications')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'notifications' ? 'bg-red-500/20 text-red-500' : 'text-slate-400 hover:text-slate-200'}`}>
          <MessageCircle className="w-4 h-4" /> Broadcasts
        </button>
      </div>

      {activeTab === 'registrations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-300 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-500" /> Pending Approval
            </h3>
            {pendingTeams.length === 0 ? (
              <div className="text-slate-500 text-sm bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">No pending teams.</div>
            ) : pendingTeams.map(team => (
              <div key={team.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 bg-orange-500/10 text-orange-500 text-xs font-bold rounded-bl-lg">Pending</div>
                <h4 className="font-bold text-lg">{team.teamName}</h4>
                <div className="text-sm text-slate-400 space-y-1">
                  <p>Captain: {team.captainName}</p>
                  <p>Contact: {team.contactDetails}</p>
                  <p>Roster: {team.roster?.length || 0} players</p>
                  <p>Status: {team.paymentStatus}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleVerify(team.id, true)} className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-500 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => handleWhatsAppContact(team.contactDetails, `Hi ${team.captainName}, your registration for ${team.teamName} is pending. Please complete the remaining steps.`)} className="px-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 rounded-lg flex items-center justify-center transition-colors tooltip" aria-label="WhatsApp Captain">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-300">Verified Teams</h3>
            {verifiedTeams.length === 0 ? (
              <div className="text-slate-500 text-sm bg-slate-900/50 border border-slate-800 p-4 rounded-xl text-center">No teams verified yet.</div>
            ) : verifiedTeams.map(team => (
              <div key={team.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex justify-between items-center group">
                <div>
                  <h4 className="font-bold text-slate-200">{team.teamName}</h4>
                  <p className="text-xs text-slate-500">Contact: {team.contactDetails}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleWhatsAppContact(team.contactDetails, `Hi ${team.captainName}, your team ${team.teamName} is verified for the upcoming tournament!`)} className="text-slate-500 hover:text-green-500 p-2 opacity-0 group-hover:opacity-100 transition-all">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleVerify(team.id, false)} className="text-slate-500 hover:text-red-400 p-2">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bracket' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Schedule New Match</h3>
              <p className="text-sm text-slate-400">Add an upcoming match to the tournament schedule.</p>
            </div>
            
            <form onSubmit={handleScheduleMatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Team 1</label>
                <select value={newMatchTeam1} onChange={(e) => setNewMatchTeam1(e.target.value)} required
                   className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 outline-none focus:border-red-500 transition-colors">
                   <option value="">Select Team...</option>
                   {verifiedTeams.map(t => <option key={t.id} value={t.teamName}>{t.teamName}</option>)}
                </select>
              </div>
              <div className="flex justify-center text-slate-600 font-black italic">VS</div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Team 2</label>
                <select value={newMatchTeam2} onChange={(e) => setNewMatchTeam2(e.target.value)} required
                   className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 outline-none focus:border-red-500 transition-colors">
                   <option value="">Select Team...</option>
                   {verifiedTeams.map(t => <option key={t.id} value={t.teamName}>{t.teamName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Date & Time</label>
                <input type="datetime-local" value={newMatchDate} onChange={(e) => setNewMatchDate(e.target.value)} required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 outline-none hover:border-red-500 transition-colors" />
              </div>
              
              <button type="submit" disabled={verifiedTeams.length < 2} className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors mt-4 flex justify-center items-center gap-2">
                <Plus className="w-5 h-5" /> Schedule Match
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-300">Matches Scheduled</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {matches.sort((a,b) => {
                 if (a.status !== b.status) {
                    if (a.status === 'live') return -1;
                    if (b.status === 'live') return 1;
                    if (a.status === 'upcoming') return -1;
                    return 1;
                 }
                 return new Date(b.startTime || 0).getTime() - new Date(a.startTime || 0).getTime();
              }).map(match => (
                <div key={match.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden flex flex-col items-center">
                  <div className={`absolute top-0 right-0 p-1 px-3 text-[10px] font-bold rounded-bl-lg uppercase tracking-wider ${
                    match.status === 'live' ? 'bg-red-500/20 text-red-500' :
                    match.status === 'finished' ? 'bg-slate-800 text-slate-400' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {match.status}
                  </div>
                  <div className="font-bold text-slate-200 text-lg w-full text-center mt-2">{match.team1}</div>
                  <div className="text-xs text-slate-500 italic my-1">vs</div>
                  <div className="font-bold text-slate-200 text-lg w-full text-center mb-2">{match.team2}</div>
                  
                  <div className="text-xs text-slate-400 flex items-center justify-between mt-2 w-full pt-2 border-t border-slate-800/50">
                     <span className="flex items-center gap-2">
                       <CalendarIcon className="w-3 h-3" /> {match.startTime ? new Date(match.startTime).toLocaleString() : 'TBD'}
                     </span>
                     {match.status === 'upcoming' && (
                       <div className="flex items-center gap-2">
                         <button onClick={() => notifyMatchScheduled(match, 1)} className="text-green-500 hover:text-green-400 flex items-center gap-1 font-bold">
                           <MessageCircle className="w-3 h-3" /> T1
                         </button>
                         <button onClick={() => notifyMatchScheduled(match, 2)} className="text-green-500 hover:text-green-400 flex items-center gap-1 font-bold">
                           <MessageCircle className="w-3 h-3" /> T2
                         </button>
                       </div>
                     )}
                  </div>
                </div>
              ))}
              {matches.length === 0 && <p className="text-slate-500 text-sm">No matches in the system.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-6">Performance Analytics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-center">
              <p className="text-slate-500 text-sm font-bold uppercase mb-2">Total Matches</p>
              <p className="text-4xl font-black text-white">{totalMatches}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-center">
              <p className="text-slate-500 text-sm font-bold uppercase mb-2">Matches Completed</p>
              <p className="text-4xl font-black text-white">{completedMatches}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-center">
              <p className="text-slate-500 text-sm font-bold uppercase mb-2">Total Sets Played</p>
              <p className="text-4xl font-black text-white">{totalSets}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-center">
              <p className="text-slate-500 text-sm font-bold uppercase mb-2">Total Points Scored</p>
              <p className="text-4xl font-black text-white">{totalPoints}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
             <h3 className="text-lg font-bold text-slate-300 mb-4">Insights</h3>
             <p className="text-slate-400 text-sm leading-relaxed">
                <span className="font-bold text-orange-500">Average sets per match:</span> {totalMatches ? (totalSets/totalMatches).toFixed(1) : 0}<br />
                <span className="font-bold text-orange-500">Average points per match:</span> {totalMatches ? (totalPoints/totalMatches).toFixed(1) : 0}
             </p>
             <p className="text-slate-500 text-xs mt-4 border-t border-slate-800 pt-4">Advanced analytics charts will populate here as the tournament progresses past the group stages.</p>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
           <div>
              <h2 className="text-xl font-bold text-white mb-2">WhatsApp Broadcast</h2>
              <p className="text-slate-400 text-sm">Send schedule updates or rules to all verified team captains.</p>
           </div>
           
           <div className="space-y-4">
             <textarea 
               value={notificationMsg}
               onChange={(e) => setNotificationMsg(e.target.value)}
               placeholder="Write your broadcast message here..."
               className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 outline-none focus:border-green-500 transition-colors resize-none"
             />
             <div className="flex justify-between items-center">
               <span className="text-xs text-slate-500">Will be sent to {verifiedTeams.length} contacts</span>
               <button 
                 onClick={handleSendNotification}
                 disabled={isSending || !notificationMsg || verifiedTeams.length === 0}
                 className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                 <Send className="w-4 h-4" /> {isSending ? 'Sending...' : 'Send Broadcast'}
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
