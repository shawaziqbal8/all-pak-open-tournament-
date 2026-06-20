/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Team, Match, NotificationItem, TournamentStats } from './types';
import { TOURNAMENT_DETAILS } from './data';
import { useFirebaseData } from './hooks/useFirebaseData';

import Banner from './components/Banner';
import Leaderboard from './components/Leaderboard';
import LiveBrackets from './components/LiveBrackets';
import RegistrationForm from './components/RegistrationForm';
import NotificationsCenter from './components/NotificationsCenter';
import AdminPanel from './components/AdminPanel';
import TicketPortal from './components/TicketPortal';
import InfoModal from './components/InfoModal';
import NotificationSetup from './components/NotificationSetup';

import { Trophy, Activity, BadgePercent, Bell, Settings, Award, Users, Info, Flame, ShieldAlert, Award as MedalIcon, Sun, Moon, Ticket } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'standings' | 'live' | 'register' | 'comms' | 'admin' | 'tickets'>('standings');
  const [isLightMode, setIsLightMode] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const { teams, matches, notifications, tickets, stats, isLoaded, addTeam, updateTeam, removeTeam, addMatch, updateMatch, addNotification, updateStats, addTicket, updateTicket } = useFirebaseData();

  const prevNotificationsRef = useRef<NotificationItem[]>([]);

  useEffect(() => {
    // Request permission on first click anywhere in the app to comply with browser policies
    const handleFirstInteraction = () => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }
      window.removeEventListener('click', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    return () => window.removeEventListener('click', handleFirstInteraction);
  }, []);

  useEffect(() => {
    // Only fire notifications if data has loaded and we have prior state
    // to avoid firing all notifications at once on initial load.
    if (!isLoaded || prevNotificationsRef.current.length === 0) {
       prevNotificationsRef.current = notifications;
       return;
    }
    
    if (notifications.length > prevNotificationsRef.current.length) {
       // Assuming newer notifications are either prepended or appended, 
       // but in Firebase they are fetched and we can find the ones not in prev.
       const newItems = notifications.filter(n => !prevNotificationsRef.current.find(pn => pn.id === n.id));
       
       if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
         newItems.forEach(item => {
           // Provide a small delay between multiple notifications just in case
           setTimeout(() => {
             new Notification(item.title, {
               body: item.message,
               icon: '/favicon.ico' // fallback to standard icon
             });
           }, 200);
         });
       }
    }
    
    prevNotificationsRef.current = notifications;
  }, [notifications, isLoaded]);

  if (!isLoaded) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-orange-500 font-bold text-sm">Loading Tournament Setup...</div>;
  }

  // Handle live score point updates and potential set switches
  const handleUpdateMatchScore = (
    matchId: string, 
    teamAScore: number, 
    teamBScore: number, 
    setScores: {teamA: number, teamB: number}[], 
    currentSetPoints: {teamA: number, teamB: number}, 
    status: 'scheduled' | 'live' | 'completed',
    winnerId?: string
  ) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    updateMatch(matchId, {
      teamAScore,
      teamBScore,
      setScores,
      currentSetPoints,
      status,
      winnerId
    });

    if (status === 'completed' && winnerId) {
      handleCompleteMatchRankings(match.teamAId, match.teamBId, winnerId, setScores);
      advanceBracketWinner(matchId, winnerId);
    }
  };

  const advanceBracketWinner = (matchId: string, winnerId: string) => {
    // Auto-advance logic for structured brackets (assuming indices 0-6 represent quarters -> semis -> finals)
    const sortedMatches = [...matches].sort((a,b) => a.id.localeCompare(b.id));
    const matchIndex = sortedMatches.findIndex(m => m.id === matchId);
    
    if (matchIndex >= 0 && matchIndex <= 3) {
      // Quarter final completed, move to semi
      const targetSemiIndex = 4 + Math.floor(matchIndex / 2);
      if (targetSemiIndex < sortedMatches.length) {
        const targetSemi = sortedMatches[targetSemiIndex];
        const isTeamA = matchIndex % 2 === 0;
        updateMatch(targetSemi.id, {
          [isTeamA ? 'teamAId' : 'teamBId']: winnerId
        });
      }
    } else if (matchIndex === 4 || matchIndex === 5) {
      // Semi final completed, move to final
      if (6 < sortedMatches.length) {
        const targetFinal = sortedMatches[6];
        const isTeamA = matchIndex === 4;
        updateMatch(targetFinal.id, {
          [isTeamA ? 'teamAId' : 'teamBId']: winnerId
        });
      }
    }
  };

  // Re-calculate rankings points once match completes
  const handleCompleteMatchRankings = (teamAId: string, teamBId: string, winnerId: string, setScores: {teamA: number, teamB: number}[]) => {
    const teamA = teams.find(t => t.id === teamAId);
    const teamB = teams.find(t => t.id === teamBId);

    if (teamA) {
      const isWinner = winnerId === teamAId;
      const wonSetsCount = setScores.filter(s => s.teamA > s.teamB).length;
      const lostSetsCount = setScores.filter(s => s.teamB > s.teamA).length;

      updateTeam(teamA.id, {
        won: (teamA.won || 0) + (isWinner ? 1 : 0),
        lost: (teamA.lost || 0) + (!isWinner ? 1 : 0),
        setsWon: (teamA.setsWon || 0) + wonSetsCount,
        setsLost: (teamA.setsLost || 0) + lostSetsCount,
        points: (teamA.points || 0) + (isWinner ? 3 : 0)
      });
    }

    if (teamB) {
      const isWinner = winnerId === teamBId;
      const wonSetsCount = setScores.filter(s => s.teamB > s.teamA).length;
      const lostSetsCount = setScores.filter(s => s.teamA > s.teamB).length;

      updateTeam(teamB.id, {
        won: (teamB.won || 0) + (isWinner ? 1 : 0),
        lost: (teamB.lost || 0) + (!isWinner ? 1 : 0),
        setsWon: (teamB.setsWon || 0) + wonSetsCount,
        setsLost: (teamB.setsLost || 0) + lostSetsCount,
        points: (teamB.points || 0) + (isWinner ? 3 : 0)
      });
    }

    // Update overall metrics
    updateStats({
      ...stats,
      completedMatches: stats.completedMatches + 1,
      activeMatches: Math.max(0, stats.activeMatches - 1)
    });
  };

  // General administrator parameter override
  const handleUpdateMatchAll = (matchId: string, params: Partial<Match>) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    updateMatch(matchId, params);

    // Re-evaluate stats if match is toggled to live
    if (params.status === 'live' && match.status !== 'live') {
      updateStats({ ...stats, activeMatches: stats.activeMatches + 1 });
    }

    // If completed manually from admin pane
    if (params.status === 'completed' && match.status !== 'completed' && params.winnerId) {
      handleCompleteMatchRankings(match.teamAId, match.teamBId, params.winnerId, params.setScores || match.setScores);
      advanceBracketWinner(matchId, params.winnerId);
    }
  };

  // Handle Team Payment Status verification checks
  const handleUpdateTeamPayment = (teamId: string, status: 'paid' | 'pending' | 'unpaid') => {
    updateTeam(teamId, { paymentStatus: status });

    // Update financial raised totals
    if (status === 'paid') {
      updateStats({
        ...stats,
        totalFundsRaised: stats.totalFundsRaised + TOURNAMENT_DETAILS.entryFee
      });
    } else {
      updateStats({
        ...stats,
        totalFundsRaised: Math.max(0, stats.totalFundsRaised - TOURNAMENT_DETAILS.entryFee)
      });
    }
  };

  // Add Custom scheduler slot compiled
  const handleAddCustomMatch = (newMatch: Match) => {
    addMatch(newMatch);
    handleTriggerNotification('New Match Scheduled', `Match scheduled for ${newMatch.time}`, 'push');
  };

  // Register New Club from the step checkout wizard
  const handleRegisterTeam = (newTeam: Team) => {
    addTeam(newTeam);

    // Recalculate metrics
    updateStats({
      ...stats,
      totalTeams: stats.totalTeams + 1,
      // Total funds are only updated when verified by admin now!
    });
    
    handleTriggerNotification('New Team Registration', `Welcome ${newTeam.name} to the tournament!`, 'push');
  };

  // Dynamic system-wide trigger for push & emails dispatcher alerts
  const handleTriggerNotification = (title: string, message: string, type: 'push' | 'email' = 'push', recipient: string = 'All Participants') => {
    const newItem: NotificationItem = {
      id: `n_dyn_${Date.now()}_${Math.floor(Math.random()*100)}`,
      type,
      title,
      message,
      recipient,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: true
    };

    addNotification(newItem);
  };

  // Clear system alert log boards
  const handleClearLogs = () => {
    // Not supported securely from frontend in this demo
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-600/30 selection:text-orange-200 ${isLightMode ? 'light-theme' : ''}`} id="main-root-workspace">
      
      {/* Top Universal Nav Header strip */}
      <header className="bg-slate-900/90 border-b border-slate-850 sticky top-0 z-50 backdrop-blur" id="navigation-header-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo / Title */}
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-orange-500 shadow-md flex items-center justify-center text-white scale-105 font-bold">
                🏆
              </span>
              <div>
                <span className="font-extrabold text-sm md:text-base tracking-tight text-white uppercase block leading-none">
                  BISHAM VOLLEYBALL
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Official Pakistan Digital Hub
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="flex items-center gap-1">
              {[
                { id: 'standings', label: 'Standings', icon: Trophy },
                { id: 'live', label: 'Live Court', icon: Activity, badge: stats.activeMatches > 0 },
                { id: 'register', label: 'Register Team', icon: Award },
                { id: 'tickets', label: 'Tickets', icon: Ticket },
                { id: 'comms', label: 'Inbox & Alerts', icon: Bell },
                { id: 'admin', label: 'Admin Room', icon: Settings }
              ].map((tb) => {
                const Icon = tb.icon;
                const isActive = activeTab === tb.id;

                return (
                  <button
                    key={tb.id}
                    onClick={() => setActiveTab(tb.id as any)}
                    className={`relative py-2 px-3.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${isActive ? 'bg-orange-600/20 border border-orange-500/40 text-orange-400 shadow-inner' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-orange-400' : 'text-slate-500'}`} />
                    <span className="hidden sm:inline-block">{tb.label}</span>
                    {tb.badge && (
                      <span className="w-2 h-2 rounded-full bg-red-500 block absolute top-1 right-1 animate-ping" />
                    )}
                  </button>
                );
              })}

              <div className="w-px h-6 bg-slate-800 mx-2" />
              <button
                onClick={() => setIsInfoModalOpen(true)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                title="Tournament Rules & Info"
              >
                <Info className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsLightMode(!isLightMode)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                title="Toggle High-Contrast Daylight Mode"
              >
                {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Info Modal Component */}
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />

      {/* Main Container workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="viewport-workspace-panel">
        
        {/* Universal Tournament Banner component */}
        <Banner stats={stats} />

        {/* Tab Switched Layout Content panels */}
        <div className="mt-4">
          
          {activeTab === 'standings' && (
            <Leaderboard 
              teams={teams} 
              stats={stats} 
            />
          )}

          {activeTab === 'live' && (
            <LiveBrackets 
              matches={matches} 
              teams={teams} 
              updateMatchScore={handleUpdateMatchScore}
              triggerPushNotification={(title, msg) => handleTriggerNotification(title, msg, 'push')}
            />
          )}

          {activeTab === 'register' && (
            <RegistrationForm 
              teams={teams}
              onRegisterTeam={handleRegisterTeam}
              triggerNotification={handleTriggerNotification}
            />
          )}

          {activeTab === 'tickets' && (
            <TicketPortal 
              tickets={tickets} 
              onRegisterTicket={(t) => {
                 addTicket(t);
                 handleTriggerNotification('New Ticket Bought', `${t.name} requested a Rs ${t.category} ticket!`, 'push');
              }} 
            />
          )}

          {activeTab === 'comms' && (
            <NotificationsCenter 
              notifications={notifications}
              onClearLogs={handleClearLogs}
              onSendSimulationAlert={(title, msg, type) => handleTriggerNotification(title, msg, type)}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPanel 
              matches={matches}
              teams={teams}
              tickets={tickets}
              stats={stats}
              updateStats={updateStats}
              updateTeam={updateTeam}
              updateTicket={updateTicket}
              removeTeam={removeTeam}
              onUpdateMatchAll={handleUpdateMatchAll}
              onUpdateTeamPayment={handleUpdateTeamPayment}
              onAddCustomMatch={handleAddCustomMatch}
              onSendSimulationAlert={(title, msg, type, recipient) => handleTriggerNotification(title, msg, type, recipient)}
            />
          )}

        </div>

        <NotificationSetup />

      </main>

      {/* Footer Branding Strip */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 mt-16" id="digital-footer-branding">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-400 flex items-center justify-center gap-1.5 leading-none">
            📍 Khursheed Khan Volleyball Ground, Taja Maira, Bisham, Shangla.
          </p>
          <p className="text-[10px] text-slate-500">
            © 2026 All Pakistan Open Volleyball Tournament. Maintained by Raham Iqbal Khan, Bakht Zeb & Hamid Anjum • Powered by Fawad Group of Companies (FGC).
          </p>
        </div>
      </footer>

    </div>
  );
}
