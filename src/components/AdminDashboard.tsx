import React, { useState } from 'react';
import { MatchScore, TeamReg } from '../types';
import { Socket } from 'socket.io-client';
import { CheckCircle2, ChevronRight, MessageCircle, Send, ShieldAlert, XCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function AdminDashboard({ matches, teams, socket }: { matches: MatchScore[], teams: TeamReg[], socket: Socket | null }) {
  const [activeTab, setActiveTab] = useState<'registrations' | 'bracket' | 'notifications'>('registrations');
  const [notificationMsg, setNotificationMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 border-b border-slate-800 pb-4">
        <button onClick={() => setActiveTab('registrations')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'registrations' ? 'bg-red-500/20 text-red-500' : 'text-slate-400 hover:text-slate-200'}`}>
          Registrations ({pendingTeams.length} Pending)
        </button>
        <button onClick={() => setActiveTab('bracket')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'bracket' ? 'bg-red-500/20 text-red-500' : 'text-slate-400 hover:text-slate-200'}`}>
          Manage Bracket
        </button>
        <button onClick={() => setActiveTab('notifications')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'notifications' ? 'bg-red-500/20 text-red-500' : 'text-slate-400 hover:text-slate-200'}`}>
          <MessageCircle className="w-4 h-4" /> WhatsApp Broadcasts
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
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-300">Verified Teams</h3>
            {verifiedTeams.map(team => (
              <div key={team.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-200">{team.teamName}</h4>
                  <p className="text-xs text-slate-500">Contact: {team.contactDetails}</p>
                </div>
                <button onClick={() => handleVerify(team.id, false)} className="text-slate-500 hover:text-red-400 p-2">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bracket' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-center">
            <p className="text-slate-500">Bracket management system is coming soon. Use "Live Scores" to manage ongoing matches.</p>
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
