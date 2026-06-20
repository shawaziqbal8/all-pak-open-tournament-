import React from 'react';
import { X, Trophy, Activity, TrendingUp } from 'lucide-react';
import { Team } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface TeamPerformanceModalProps {
  team: Team | null;
  onClose: () => void;
}

export default function TeamPerformanceModal({ team, onClose }: TeamPerformanceModalProps) {
  if (!team) return null;

  // Mocked performance data based on team stats for the graph
  // In a real app, this would be computed from past matches
  const performanceData = [
    { match: 'M1', points: Math.floor(Math.random() * 25) + 15, avgScore: parseInt((team.points / Math.max(team.won + team.lost, 1)).toFixed(1)) + Math.floor(Math.random() * 5) },
    { match: 'M2', points: Math.floor(Math.random() * 25) + 15, avgScore: parseInt((team.points / Math.max(team.won + team.lost, 1)).toFixed(1)) - Math.floor(Math.random() * 3) },
    { match: 'M3', points: Math.floor(Math.random() * 25) + 15, avgScore: parseInt((team.points / Math.max(team.won + team.lost, 1)).toFixed(1)) + Math.floor(Math.random() * 4) },
    { match: 'M4', points: Math.floor(Math.random() * 25) + 15, avgScore: parseInt((team.points / Math.max(team.won + team.lost, 1)).toFixed(1)) },
    { match: 'M5', points: Math.floor(Math.random() * 25) + 15, avgScore: parseInt((team.points / Math.max(team.won + team.lost, 1)).toFixed(1)) + 2 },
  ];

  const totalMatches = team.won + team.lost;
  const winRate = totalMatches > 0 ? Math.round((team.won / totalMatches) * 100) : 0;
  const avgSetsWon = totalMatches > 0 ? (team.setsWon / totalMatches).toFixed(1) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden shadow-2xl relative">
        <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
              {team.name}
            </h2>
            <p className="text-slate-400 text-sm mt-1">{team.city} &middot; Performance Analytics</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-500 mb-2" />
              <p className="text-2xl font-bold text-white">{winRate}%</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Win Rate</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-500 mb-2" />
              <p className="text-2xl font-bold text-white">{team.points}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Points</p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center">
              <Activity className="w-6 h-6 text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-white">{avgSetsWon}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Avg Sets Won</p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" />
              Win-Loss Performance Trends
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="match" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="points" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} activeDot={{ r: 6 }} name="Points Scored" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Average Score per Set
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="match" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: '#1e293b', opacity: 0.4 }}
                  />
                  <Bar dataKey="avgScore" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Set Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
