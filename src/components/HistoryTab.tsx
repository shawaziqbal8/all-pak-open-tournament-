import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trophy, Calendar, MapPin, Users, Award, Play } from 'lucide-react';

interface TournamentHistoryItem {
  id: string;
  year: number;
  winner: string;
  runnerUp: string;
  mvp: string;
  location: string;
  totalTeams: number;
}

export default function HistoryTab() {
  const [history, setHistory] = useState<TournamentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'tournamentHistory'), (snapshot) => {
      const items: TournamentHistoryItem[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as TournamentHistoryItem);
      });
      items.sort((a, b) => b.year - a.year);
      setHistory(items);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const seedHistory = async () => {
    const defaultData: Omit<TournamentHistoryItem, 'id'>[] = [
      { year: 2025, winner: 'Bisham Tigers', runnerUp: 'KPK Eagles', mvp: 'Ali Khan', location: 'Bisham Main Court', totalTeams: 12 },
      { year: 2024, winner: 'Swat Spikers', runnerUp: 'Bisham Tigers', mvp: 'Zaman Shah', location: 'Swat Complex', totalTeams: 16 },
      { year: 2023, winner: 'Peshawar Hawks', runnerUp: 'Mardan Falcons', mvp: 'Ahmed Ali', location: 'Peshawar Sports Board', totalTeams: 14 }
    ];

    try {
      for (const item of defaultData) {
        await setDoc(doc(db, 'tournamentHistory', `history_${item.year}`), item);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading history...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Tournament History
            </h2>
            <p className="text-sm text-slate-400">Explore the legacy of the annual All Pakistan Open Volleyball tournaments.</p>
          </div>
          {history.length === 0 && (
            <button 
              onClick={seedHistory}
              className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Play className="w-4 h-4" /> Seed Sample History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-950/50 rounded-lg border border-slate-800/50">
            No history records found in the database.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {history.map(item => (
              <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-lg p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Award className="w-16 h-16 text-orange-500" />
                </div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-2xl font-black text-orange-500">{item.year}</span>
                  <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded">
                    <Users className="w-3 h-3" />
                    <span>{item.totalTeams || 0} Teams</span>
                  </div>
                </div>
                
                <div className="space-y-3 relative z-10">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Champion</p>
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                      {item.winner || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Runner Up</p>
                    <p className="text-sm font-medium text-slate-300">
                      {item.runnerUp || 'Unknown'}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">MVP</p>
                      <p className="text-xs text-slate-300">{item.mvp || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Host City</p>
                      <p className="text-xs text-slate-300 flex items-center justify-end gap-1">
                        <MapPin className="w-3 h-3" /> {item.location || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
