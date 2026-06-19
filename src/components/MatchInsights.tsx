import React, { useMemo, useState } from 'react';
import { Team, Match } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Activity, Sparkles, Loader2 } from 'lucide-react';

interface MatchInsightsProps {
  teams: Team[];
  matches: Match[];
}

export default function MatchInsights({ teams, matches }: MatchInsightsProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    setIsAiLoading(true);
    setAiResponse("");
    try {
      const res = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, teams, matches }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResponse(data.insight);
      } else {
        setAiResponse("Failed to fetch insight. Ensure Gemini API key is set.");
      }
    } catch (err) {
      setAiResponse("Error communicating with AI.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const chartData = useMemo(() => {
    return teams.map(team => {
      const teamMatches = matches.filter(m => 
        (m.teamAId === team.id || m.teamBId === team.id) && m.status === 'completed'
      );
      
      const totalMatches = teamMatches.length;
      let wins = 0;
      let totalSetsWon = 0;
      let totalSetsLost = 0;

      teamMatches.forEach(m => {
        const isTeamA = m.teamAId === team.id;
        const won = (m.winnerId === team.id);
        if (won) wins++;
        
        const setsWon = isTeamA ? m.teamAScore : m.teamBScore;
        const setsLost = isTeamA ? m.teamBScore : m.teamAScore;
        totalSetsWon += setsWon;
        totalSetsLost += setsLost;
      });

      const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
      const avgSetsWon = totalMatches > 0 ? totalSetsWon / totalMatches : 0;
      const setWinRatio = (totalSetsWon + totalSetsLost) > 0 ? (totalSetsWon / (totalSetsWon + totalSetsLost)) * 100 : 0;

      return {
        name: team.name,
        winRate: Math.round(winRate),
        avgSetsWon: Number(avgSetsWon.toFixed(1)),
        setWinRatio: Math.round(setWinRatio),
        totalMatches
      };
    }).filter(d => d.totalMatches > 0); // Only show teams that played
  }, [teams, matches]);

  if (chartData.length === 0) {
    return (
      <div className="bg-slate-950 border border-slate-850 rounded-xl p-6 h-full min-h-[300px] flex flex-col items-center justify-center text-center space-y-3">
        <Activity className="w-8 h-8 text-slate-700" />
        <p className="text-sm text-slate-500 font-semibold">Not enough match data yet</p>
        <p className="text-[10px] text-slate-600">Complete some matches to generate performance insights</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col h-full shadow-md min-h-[350px]">
      <h4 className="text-xs font-black text-orange-500 uppercase flex items-center gap-2 mb-2 tracking-wider">
        <Activity className="w-4 h-4" /> Team Performance Insights
      </h4>
      
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
            <Radar name="Win Rate %" dataKey="winRate" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
            <Radar name="Set Win Ratio %" dataKey="setWinRatio" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }}
              itemStyle={{ color: '#f1f5f9' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-4 mt-1 text-[10px] text-slate-400 font-medium">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-orange-500 opacity-70"></div>
          <span>Match Win Rate (%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-500 opacity-70"></div>
          <span>Set Win Ratio (%)</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800">
         <h5 className="text-[10px] font-black uppercase text-purple-400 mb-2 flex items-center gap-1.5">
           <Sparkles className="w-3.5 h-3.5" /> AI Fast Insights
         </h5>
         <form onSubmit={handleAskAI} className="flex gap-2">
           <input
             type="text"
             value={aiPrompt}
             onChange={(e) => setAiPrompt(e.target.value)}
             placeholder="E.g. Which team should be seeded highest based on avg score?"
             className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500"
           />
           <button 
             type="submit" 
             disabled={isAiLoading}
             className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded px-3 py-1.5 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
           >
             {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Ask'}
           </button>
         </form>
         {aiResponse && (
           <div className="mt-3 bg-purple-500/10 border border-purple-500/20 p-3 rounded text-[11px] text-purple-200 leading-relaxed font-medium">
             {aiResponse}
           </div>
         )}
      </div>
    </div>
  );
}
