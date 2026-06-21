import React, { useState, useEffect } from 'react';
import { MatchScore } from '../types';
import { Calendar as CalendarIcon, Clock, MapPin, Bell, BellRing } from 'lucide-react';
import { DateTime } from 'luxon';

export default function Schedule({ matches }: { matches: MatchScore[] }) {
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setAlertsEnabled(true);
    }
  }, []);

  const handleSubscribe = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }

    if (Notification.permission === 'granted') {
      alert('You are already subscribed to match alerts!');
      setAlertsEnabled(true);
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
         setAlertsEnabled(true);
         new Notification('Match Alerts Enabled!', {
            body: 'You will receive game reminders before scheduled matches begin.',
         });
      }
    } else {
      alert('You previously denied notifications. Please enable them in your browser settings.');
    }
  };

  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const pastMatches = matches.filter(m => m.status === 'finished');

  return (
    <div className="space-y-10">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-black text-white">Upcoming Matches</h2>
          <button 
            onClick={handleSubscribe} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${alertsEnabled ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            {alertsEnabled ? <BellRing className="w-4 h-4 animate-pulse" /> : <Bell className="w-4 h-4" />}
            {alertsEnabled ? 'Alerts Enabled' : 'Subscribe to Match Alerts'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingMatches.length === 0 ? (
             <div className="col-span-full bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-slate-500">
               No upcoming matches scheduled.
             </div>
          ) : upcomingMatches.map(match => (
            <div key={match.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-orange-500 text-sm font-bold bg-orange-500/10 px-2.5 py-1 rounded-md">
                  <CalendarIcon className="w-4 h-4" /> 
                  {match.startTime ? DateTime.fromISO(match.startTime).toFormat('ccc, MMM dd') : 'TBA'}
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <Clock className="w-4 h-4" />
                  {match.startTime ? DateTime.fromISO(match.startTime).toFormat('h:mm a') : 'TBA'}
                </div>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="font-bold text-lg text-slate-200">{match.team1}</span>
                <span className="text-slate-600 text-sm font-black italic px-4">VS</span>
                <span className="font-bold text-lg text-slate-200">{match.team2}</span>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800/50 flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="w-3 h-3" /> Center Court
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-400 mb-6">Recent Results</h2>
        <div className="space-y-3">
           {pastMatches.slice(0, 5).map(match => (
              <div key={match.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between opacity-80">
                 <div className="w-1/3 text-right pr-4 font-medium text-slate-300">{match.team1}</div>
                 <div className="flex gap-4 font-black text-xl text-white bg-slate-800 px-4 py-1.5 rounded-lg">
                   <span className={match.sets1 > match.sets2 ? 'text-orange-500' : ''}>{match.sets1 || 0}</span>
                   <span className="text-slate-600">-</span>
                   <span className={match.sets2 > match.sets1 ? 'text-orange-500' : ''}>{match.sets2 || 0}</span>
                 </div>
                 <div className="w-1/3 text-left pl-4 font-medium text-slate-300">{match.team2}</div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
}
