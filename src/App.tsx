import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Users, Zap, LayoutDashboard, ClipboardList, Target, ShieldCheck, Trophy, Calendar, PenTool } from 'lucide-react';
import { AppState, MatchScore, TeamReg } from './types';
import Dashboard from './components/Dashboard';
import RegistrationForm from './components/RegistrationForm';
import ScoreTracker from './components/ScoreTracker';
import AdminDashboard from './components/AdminDashboard';
import Leaderboard from './components/Leaderboard';
import Schedule from './components/Schedule';
import Playbook from './components/Playbook';
import { db } from './lib/firebase';
import { collection, onSnapshot, getDocs, setDoc, doc } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scores' | 'register' | 'admin' | 'leaderboard' | 'schedule' | 'playbook'>('dashboard');
  const [usersConnected, setUsersConnected] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [teams, setTeams] = useState<TeamReg[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to same origin
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('users-changed', (count) => {
      setUsersConnected(count);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    // Seed mock teams and matches if none exist
    const seedMockData = async () => {
      try {
        const teamsSnap = await getDocs(collection(db, 'teams'));
        if (teamsSnap.empty) {
          console.log("Seeding mock teams...");
          const mockTeams: TeamReg[] = [
            { id: 't1', teamName: 'Lahore Eagles', captainName: 'Ali Khan', contactDetails: '+923001234567', paymentStatus: 'paid', verified: true, roster: [] },
            { id: 't2', teamName: 'Karachi Falcons', captainName: 'Usman Tariq', contactDetails: '+923011234567', paymentStatus: 'paid', verified: true, roster: [] },
            { id: 't3', teamName: 'Islamabad United', captainName: 'Zain Malik', contactDetails: '+923021234567', paymentStatus: 'paid', verified: true, roster: [] },
            { id: 't4', teamName: 'Peshawar Zalmi', captainName: 'Omar Afridi', contactDetails: '+923031234567', paymentStatus: 'paid', verified: true, roster: [] },
            { id: 't5', teamName: 'Quetta Gladiators', captainName: 'Bilal Ahmed', contactDetails: '+923041234567', paymentStatus: 'paid', verified: true, roster: [] },
            { id: 't6', teamName: 'Multan Sultans', captainName: 'Shahid Mehmood', contactDetails: '+923051234567', paymentStatus: 'paid', verified: true, roster: [] },
            { id: 't7', teamName: 'Faisalabad Wolves', captainName: 'Hassan Raza', contactDetails: '+923061234567', paymentStatus: 'paid', verified: true, roster: [] },
            { id: 't8', teamName: 'Rawalpindi Royals', captainName: 'Kamran Akmal', contactDetails: '+923071234567', paymentStatus: 'paid', verified: true, roster: [] }
          ];
          for (const t of mockTeams) {
            await setDoc(doc(db, 'teams', t.id), t);
          }
        }

        const matchesSnap = await getDocs(collection(db, 'matches'));
        if (matchesSnap.empty) {
          console.log("Seeding mock matches...");
          const today = new Date().toISOString();
          const mockMatches: MatchScore[] = [
            { id: 'm1', team1: 'Lahore Eagles', team2: 'Karachi Falcons', sets1: 1, sets2: 0, points1: 22, points2: 19, status: 'live', startTime: today },
            { id: 'm2', team1: 'Islamabad United', team2: 'Peshawar Zalmi', sets1: 0, sets2: 0, points1: 0, points2: 0, status: 'upcoming', startTime: new Date(Date.now() + 86400000).toISOString() },
            { id: 'm3', team1: 'Quetta Gladiators', team2: 'Multan Sultans', sets1: 3, sets2: 1, points1: 25, points2: 18, status: 'finished', startTime: new Date(Date.now() - 86400000).toISOString() }
          ];
          for (const m of mockMatches) {
            await setDoc(doc(db, 'matches', m.id), m);
          }
        }
      } catch (err) {
        console.error("Error seeding data:", err);
      }
    };
    seedMockData();

    const unsubMatches = onSnapshot(collection(db, 'matches'), (snapshot) => {
      const dbMatches = snapshot.docs.map(doc => doc.data() as MatchScore);
      if (isSubscribed) setMatches(dbMatches.sort((a,b) => (b.startTime ? new Date(b.startTime).getTime() : 0) - (a.startTime ? new Date(a.startTime).getTime() : 0)));
    }, (error) => {
      console.error("Error fetching matches: ", error);
    });
    
    const unsubTeams = onSnapshot(collection(db, 'teams'), (snapshot) => {
      const dbTeams = snapshot.docs.map(doc => doc.data() as TeamReg);
      if (isSubscribed) setTeams(dbTeams);
    }, (error) => {
      console.error("Error fetching teams: ", error);
    });

    return () => {
      isSubscribed = false;
      unsubMatches();
      unsubTeams();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col p-2 md:p-6 text-slate-100">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/10 p-2 border border-orange-500/20 rounded-lg">
            <Trophy className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">All Pakistan Open</h1>
            <p className="text-xs text-orange-500 font-bold tracking-widest uppercase">Volleyball Tournament</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
            <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">Overview</span>
          </button>
          <button onClick={() => setActiveTab('leaderboard')} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${activeTab === 'leaderboard' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
            <Target className="w-4 h-4" /> <span className="hidden sm:inline">Leaderboard</span>
          </button>
          <button onClick={() => setActiveTab('schedule')} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${activeTab === 'schedule' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
            <Calendar className="w-4 h-4" /> <span className="hidden sm:inline">Schedule</span>
          </button>
          <button onClick={() => setActiveTab('scores')} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${activeTab === 'scores' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
            <Zap className="w-4 h-4" /> <span className="hidden sm:inline">Live Scores</span>
          </button>
          <button onClick={() => setActiveTab('playbook')} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${activeTab === 'playbook' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
            <PenTool className="w-4 h-4" /> <span className="hidden sm:inline">Playbook (Sync)</span>
          </button>
          <button onClick={() => setActiveTab('register')} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${activeTab === 'register' ? 'bg-orange-600 text-white' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500/20'}`}>
            <ClipboardList className="w-4 h-4" /> <span className="hidden sm:inline">Register Team</span>
          </button>
          <button onClick={() => setActiveTab('admin')} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${activeTab === 'admin' ? 'bg-red-500/20 text-red-500' : 'text-slate-500 hover:text-red-400'}`}>
            <ShieldCheck className="w-4 h-4" /> <span className="hidden sm:inline">Admin</span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm hidden lg:flex">
          <div className="flex items-center gap-2 text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></span>
            {isConnected ? 'Live' : 'Offline'}
          </div>
          <div className="flex items-center gap-2 text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-slate-200">{usersConnected} Fan{usersConnected !== 1 ? 's' : ''} Online</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto max-w-7xl">
        {activeTab === 'dashboard' && <Dashboard matches={matches} teams={teams} />}
        {activeTab === 'leaderboard' && <Leaderboard matches={matches} teams={teams} />}
        {activeTab === 'schedule' && <Schedule matches={matches} />}
        {activeTab === 'scores' && <ScoreTracker matches={matches} socket={socketRef.current} />}
        {activeTab === 'playbook' && <Playbook socket={socketRef.current} usersConnected={usersConnected} />}
        {activeTab === 'register' && <RegistrationForm socket={socketRef.current} />}
        {activeTab === 'admin' && <AdminDashboard matches={matches} teams={teams} socket={socketRef.current} />}
      </main>
      
      <footer className="mt-12 py-6 border-t border-slate-800 text-center text-xs text-slate-500">
        All Pakistan Open Volleyball Tournament Official Portal &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
