/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NotificationItem } from '../types';
import { Mail, Bell, Send, CheckCircle, Clock, Smartphone, Inbox, BookOpen, Trash } from 'lucide-react';

interface NotificationsCenterProps {
  notifications: NotificationItem[];
  onClearLogs: () => void;
  onSendSimulationAlert: (title: string, message: string, type: 'push' | 'email') => void;
}

export default function NotificationsCenter({ notifications, onClearLogs, onSendSimulationAlert }: NotificationsCenterProps) {
  const [selectedEmail, setSelectedEmail] = useState<NotificationItem | null>(
    notifications.find(n => n.type === 'email') || null
  );

  const [simAlertTitle, setSimAlertTitle] = useState('');
  const [simAlertMessage, setSimAlertMessage] = useState('');
  const [simAlertType, setSimAlertType] = useState<'push' | 'email'>('push');

  const pushAlerts = notifications.filter(n => n.type === 'push');
  const emailAlerts = notifications.filter(n => n.type === 'email');

  const handleManualSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simAlertTitle || !simAlertMessage) {
      alert('Please fill in alert title and message.');
      return;
    }
    const targetRecipient = simAlertType === 'email' ? 'all_coaches@volleyball.pk' : 'All Participants';
    onSendSimulationAlert(simAlertTitle, simAlertMessage, simAlertType);
    setSimAlertTitle('');
    setSimAlertMessage('');
    alert(`Success: Simulated outbound ${simAlertType} broadcast queued!`);
  };

  return (
    <div className="space-y-8" id="notification-center-panel">
      
      {/* 1. Header with simulation trigger */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500 animate-pulse" />
              Communications HQ
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Monitor real-time push broadcasts and automated outgoing SMTP emails dispatched to registered volleyball clubs.
            </p>
          </div>
          <div className="pt-4">
            <button
              onClick={onClearLogs}
              className="py-1.5 px-3 border border-slate-800 rounded-xl text-[10px] font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Trash className="w-3.5 h-3.5" /> Clear Comm Logs
            </button>
          </div>
        </div>

        {/* Dynamic simulation triggers */}
        <form onSubmit={handleManualSend} className="lg:col-span-2 bg-slate-950/60 border border-slate-850 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-orange-450 uppercase tracking-wider text-[10px]">Dispatch Simulated Alert</label>
            <input
              type="text"
              placeholder="Title (e.g. Schedule Update)"
              className="w-full px-3 py-2 border border-slate-800 bg-slate-900 text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-orange-500"
              value={simAlertTitle}
              onChange={(e) => setSimAlertTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-orange-450 uppercase tracking-wider text-[10px]">Alert Format Type</label>
            <select
              className="w-full px-2 text-xs py-2 border border-slate-800 bg-slate-900 text-slate-300 rounded-lg outline-none cursor-pointer focus:ring-1 focus:ring-orange-500"
              value={simAlertType}
              onChange={(e) => setSimAlertType(e.target.value as any)}
            >
              <option value="push">Push Notification (Match Ticker / Alerts)</option>
              <option value="email">Automated SMTP Email (to Coaches)</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <textarea
              placeholder="Message details..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-800 bg-slate-900 text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-orange-500"
              value={simAlertMessage}
              onChange={(e) => setSimAlertMessage(e.target.value)}
              required
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer ml-auto transition-all"
            >
              <Send className="w-3.5 h-3.5 shrink-0" /> Queue Alert Broadcast
            </button>
          </div>
        </form>
      </div>

      {/* 2. Visual Split layouts for Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Grid: Push Alerts simulation Feed (Smartphone notification visualizer) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-1.5 text-sm font-bold text-white">
            <Smartphone className="w-4 h-4 text-orange-500 font-black" />
            <span>Mobile Push Alerts Feed</span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {pushAlerts.map((p) => (
              <div key={p.id} className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md relative group hover:border-orange-500/25 transition-colors">
                <span className="absolute top-2.5 right-2.5 bg-orange-500/10 text-orange-450 border border-orange-500/10 px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider">
                  Push Alert
                </span>
                
                <h4 className="font-black text-xs text-white max-w-[190px]">{p.title}</h4>
                <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed">{p.message}</p>
                
                <div className="mt-3.5 text-[8px] text-slate-500 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{p.timestamp}</span>
                </div>
              </div>
            ))}

            {pushAlerts.length === 0 && (
              <div className="bg-slate-900 rounded-2xl border border-slate-850 p-8 text-center text-slate-500 text-xs">
                📱 Push logs are empty. Dispatched alerts will populate here.
              </div>
            )}
          </div>
        </div>

        {/* Right Grid: Simulated Email Inbox logs and rich document rendering */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-sm font-bold text-white">
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-orange-500" />
              <span>Simulated Outgoing Email Queue</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-xl max-h-[500px]">
            {/* Email list pane (Left pane on larger screen) */}
            <div className="md:col-span-5 border-r border-slate-850 flex flex-col max-h-[460px] overflow-y-auto">
              <div className="bg-slate-950 px-3 py-2.5 border-b border-slate-850 text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Inbox className="w-3 h-3 text-orange-500" /> Envelope Inbox
              </div>

              <div className="divide-y divide-slate-850">
                {emailAlerts.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEmail(e)}
                    className={`w-full text-left p-3.5 flex flex-col gap-1 transition-colors hover:bg-slate-950 cursor-pointer ${selectedEmail?.id === e.id ? 'bg-orange-500/10 border-l-4 border-orange-500' : ''}`}
                  >
                    <span className="text-[9px] font-mono font-bold text-slate-500 break-all">{e.recipient}</span>
                    <span className="font-extrabold text-[11px] text-white truncate">{e.title}</span>
                    <span className="text-[9px] text-slate-500 block text-right font-mono mt-1">{e.timestamp}</span>
                  </button>
                ))}

                {emailAlerts.length === 0 && (
                  <div className="text-center py-10 text-slate-500 text-[11px]">
                    No simulated outbound mail found.
                  </div>
                )}
              </div>
            </div>

            {/* Email viewer pane */}
            <div className="md:col-span-7 flex flex-col max-h-[460px] overflow-y-auto bg-slate-950/40">
              {selectedEmail ? (
                <div className="p-4 space-y-4">
                  <div className="border-b border-slate-850 pb-3 space-y-1">
                    <span className="text-[9px] font-black text-orange-450 uppercase tracking-widest block bg-orange-650/10 border border-orange-500/10 w-fit px-1.5 py-0.5 rounded-lg">SMTP OUTBOUND METRICS</span>
                    <h3 className="text-xs font-extrabold text-white">{selectedEmail.title}</h3>
                    <p className="text-[10px] text-slate-400">
                      <strong>To:</strong> <span className="font-mono text-slate-300">{selectedEmail.recipient}</span>
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono">
                      <strong>Server Port:</strong> 25 (SSL Enabled) • Auth Verified
                    </p>
                  </div>

                  {/* High quality HTML rendered layout simulator */}
                  <div className="border border-slate-850 rounded-xl p-4 bg-slate-950/70 text-[11px] space-y-3 leading-relaxed text-slate-300 font-sans">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <span className="font-black tracking-wider text-[10px] text-orange-450 uppercase">🏆 ALL PAKISTAN VOLLEYBALL</span>
                      <span className="text-[8px] text-slate-500 font-mono">{selectedEmail.timestamp}</span>
                    </div>

                    <div>
                      <p className="whitespace-pre-line text-xs font-medium text-slate-300">{selectedEmail.message}</p>
                    </div>

                    <div className="bg-slate-900/60 p-2.5 rounded-xl text-[10px] text-slate-400 border border-slate-850">
                      🎖️ Sponsored officially by: <strong className="text-white">FGC Fawad Group</strong>. Contact number: <strong className="text-orange-400">0306-0888584</strong> for event credentials or corrections.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 h-[180px]">
                  <BookOpen className="w-8 h-8 text-slate-700 mb-2 animate-bounce" />
                  Select an outbound email record from the list to display template details.
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
