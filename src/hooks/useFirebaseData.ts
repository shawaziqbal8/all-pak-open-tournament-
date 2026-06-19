import { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Team, Match, NotificationItem, TournamentStats } from '../types';
import { INITIAL_STATS } from '../data';
import { io, Socket } from 'socket.io-client';

export function useFirebaseData() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState<TournamentStats>(INITIAL_STATS);
  const [isLoaded, setIsLoaded] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    // On deployed env app runs on same host
    const socket = io();
    socketRef.current = socket;

    socket.on('live_update', (data) => {
      if (data.type === 'update_match') {
        setMatches(prev => prev.map(m => m.id === data.matchId ? { ...m, ...data.updates } : m));
      } else if (data.type === 'add_match') {
        setMatches(prev => {
          if (!prev.find(m => m.id === data.match.id)) {
             return [...prev, data.match];
          }
          return prev;
        });
      } else if (data.type === 'update_team') {
        setTeams(prev => prev.map(t => t.id === data.teamId ? { ...t, ...data.updates } : t));
      } else if (data.type === 'add_team') {
        setTeams(prev => {
          if (!prev.find(t => t.id === data.team.id)) {
            return [...prev, data.team];
          }
          return prev;
        });
      } else if (data.type === 'remove_team') {
        setTeams(prev => prev.filter(t => t.id !== data.teamId));
      } else if (data.type === 'add_notification') {
         setNotifications(prev => {
             const exist = prev.find(n => n.id === data.notification.id);
             if (exist) return prev;
             const newNotifs = [...prev, data.notification];
             newNotifs.sort((a,b) => b.id.localeCompare(a.id));
             return newNotifs;
         });
      } else if (data.type === 'update_stats') {
         setStats(prev => ({ ...prev, ...data.stats }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    let unsubs: (() => void)[] = [];

    unsubs.push(onSnapshot(collection(db, 'teams'), (snapshot) => {
      const data: Team[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Team));
      setTeams(data);
    }));

    unsubs.push(onSnapshot(collection(db, 'matches'), (snapshot) => {
      const data: Match[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Match));
      setMatches(data);
    }));

    unsubs.push(onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const data: NotificationItem[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as NotificationItem));
      // Sort by timestamp or natural desc order
      data.sort((a,b) => b.id.localeCompare(a.id)); 
      setNotifications(data);
    }));

    unsubs.push(onSnapshot(doc(db, 'stats', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setStats(docSnap.data() as TournamentStats);
      } else {
        setDoc(doc(db, 'stats', 'global'), INITIAL_STATS);
      }
      setIsLoaded(true);
    }));

    return () => unsubs.forEach(u => u());
  }, []);

  const updateStats = async (newStats: TournamentStats) => {
    socketRef.current?.emit('live_update', { type: 'update_stats', stats: newStats });
    setStats(prev => ({ ...prev, ...newStats })); // Optimistic
    // Avoid rapid writes overriding in full object, merge if possible, but full is ok for now.
    await updateDoc(doc(db, 'stats', 'global'), { ...newStats }).catch(e => {
        // If doc doesn't exist yet, we create.
        setDoc(doc(db, 'stats', 'global'), { ...newStats });
    });
  };

  const addTeam = async (team: Team) => {
    socketRef.current?.emit('live_update', { type: 'add_team', team });
    setTeams(prev => {
       if (!prev.find(t => t.id === team.id)) return [...prev, team];
       return prev;
    }); // Optimistic
    await setDoc(doc(db, 'teams', team.id), team);
  };
  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    socketRef.current?.emit('live_update', { type: 'update_team', teamId, updates });
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...updates } : t)); // Optimistic
    await updateDoc(doc(db, 'teams', teamId), updates);
  };
  const removeTeam = async (teamId: string) => {
    socketRef.current?.emit('live_update', { type: 'remove_team', teamId });
    setTeams(prev => prev.filter(t => t.id !== teamId)); // Optimistic
    await deleteDoc(doc(db, 'teams', teamId));
  };

  const addMatch = async (m: Match) => {
    socketRef.current?.emit('live_update', { type: 'add_match', match: m });
    setMatches(prev => {
       if (!prev.find(match => match.id === m.id)) return [...prev, m];
       return prev;
    }); // Optimistic
    await setDoc(doc(db, 'matches', m.id), m);
  };
  const updateMatch = async (matchId: string, updates: Partial<Match>) => {
    socketRef.current?.emit('live_update', { type: 'update_match', matchId, updates });
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, ...updates } : m)); // Optimistic
    await updateDoc(doc(db, 'matches', matchId), updates);
  };

  const addNotification = async (n: NotificationItem) => {
    socketRef.current?.emit('live_update', { type: 'add_notification', notification: n });
    setNotifications(prev => {
       const exist = prev.find(not => not.id === n.id);
       if (exist) return prev;
       const newNotifs = [...prev, n];
       newNotifs.sort((a,b) => b.id.localeCompare(a.id));
       return newNotifs;
    }); // Optimistic
    await setDoc(doc(db, 'notifications', n.id), n);
  };
  const clearNotifications = async () => {
    // since we cannot delete collection directly from client, we ignore it or just keep them locally.
    // For simplicity, we might just not implement clear, or do a batch delete.
  };

  return { teams, matches, notifications, stats, isLoaded, addTeam, updateTeam, removeTeam, addMatch, updateMatch, addNotification, updateStats };
}
