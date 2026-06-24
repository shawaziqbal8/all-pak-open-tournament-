import React, { useState, useEffect } from 'react';
import { MatchScore, TeamReg, AuditLog } from '../types';
import { Socket } from 'socket.io-client';
import { CheckCircle2, ChevronRight, MessageCircle, Send, ShieldAlert, XCircle, Plus, Calendar as CalendarIcon, Clock, Edit2, Lock, ImagePlus, MonitorPlay, Trash2, Upload, AlertTriangle, Download } from 'lucide-react';
import { db, storage } from '../lib/firebase';
import { doc, updateDoc, setDoc, deleteDoc, collection, onSnapshot, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import TeamDetailModal from './TeamDetailModal';

import BracketTree from './BracketTree';

export interface AdImage {
  id: string;
  url: string;
  active: boolean;
  type?: 'image' | 'video';
}

export default function AdminDashboard({ matches, teams, socket }: { matches: MatchScore[], teams: TeamReg[], socket: Socket | null }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const [activeTab, setActiveTab] = useState<'registrations' | 'bracket' | 'notifications' | 'analytics' | 'ads' | 'tickets' | 'audit'>('registrations');
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSettingAlert, setIsSettingAlert] = useState(false);
  
  // Schedule state
  const [newMatchTeam1, setNewMatchTeam1] = useState('');
  const [newMatchTeam2, setNewMatchTeam2] = useState('');
  const [newMatchDate, setNewMatchDate] = useState('');

  // Tickets state
  const [tickets, setTickets] = useState<any[]>([]);

  // Ads state
  const [ads, setAds] = useState<AdImage[]>([]);
  const [newAdUrl, setNewAdUrl] = useState('');
  
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadLogs, setUploadLogs] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video' | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const addUploadLog = (msg: string) => {
    setUploadLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
  };

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    let isSubscribed = true;
    if (isAuthenticated) {
      const unsub = onSnapshot(collection(db, 'ads'), (snapshot) => {
        const dbAds = snapshot.docs.map(d => ({id: d.id, ...d.data()}) as AdImage);
        if (isSubscribed) setAds(dbAds);
      });
      const unsubTickets = onSnapshot(collection(db, 'tickets'), (snapshot) => {
        if (isSubscribed) setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      const unsubAudit = onSnapshot(collection(db, 'auditLogs'), (snapshot) => {
        if (isSubscribed) setAuditLogs(snapshot.docs.map(doc => doc.data() as AuditLog));
      });
      return () => { isSubscribed = false; unsub(); unsubTickets(); unsubAudit(); };
    }
  }, [isAuthenticated]);

  const [isUploading, setIsUploading] = useState(false);
  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdUrl) return;
    const id = 'ad_' + Date.now();
    try {
      await setDoc(doc(db, 'ads', id), { url: newAdUrl, active: true });
      setNewAdUrl('');
    } catch(e) {
      console.error(e);
      alert('Failed to add ad');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadLogs([]);
    addUploadLog(`File selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);

    const isVideo = file.type.startsWith('video/');
    setPreviewType(isVideo ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
      addUploadLog('Client-side preview generated successfully.');
    };
    reader.onerror = () => {
      addUploadLog('Error reading file for preview.');
    }
    reader.readAsDataURL(file);
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPreviewType(null);
    setUploadProgress(0);
    setUploadLogs([]);
    setIsUploading(false);
  };

  const handleUploadFile = async () => {
    if (!selectedFile || !previewUrl) return;

    setIsUploading(true);
    let finalDataUrl = previewUrl;

    // Auto-compress images
    if (selectedFile.type.startsWith('image/')) {
      addUploadLog('Optimizing image size...');
      try {
        finalDataUrl = await new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round((width * MAX_HEIGHT) / height);
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            resolve(canvas.toDataURL('image/jpeg', 0.85)); // 85% quality
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = previewUrl;
        });
        addUploadLog(`Image optimized successfully.`);
      } catch (err) {
        addUploadLog(`Optimization failed: ${err}. Uploading original.`);
      }
    }

    addUploadLog('Saving asset metadata to database...');
    
    try {
      setUploadProgress(50);
      const id = 'ad_' + Date.now();
      await setDoc(doc(db, 'ads', id), { 
        url: finalDataUrl, 
        active: true, 
        type: previewType 
      });
      
      setUploadProgress(100);
      addUploadLog('Ad successfully registered in database.');
      setTimeout(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
        setIsUploading(false);
      }, 2000);
    } catch (err) {
      addUploadLog(`Database save failed: ${err}`);
      setIsUploading(false);
    }
  };

  const handleToggleAd = async (id: string, active: boolean) => {
    try { await updateDoc(doc(db, 'ads', id), { active }); } catch(e) {}
  };

  const handleDeleteAd = async (id: string) => {
    try { await deleteDoc(doc(db, 'ads', id)); } catch(e) {}
  };

  const pendingTeams = teams.filter(t => !t.isVerified);
  const verifiedTeams = teams.filter(t => t.isVerified);

  const handleDownloadCSV = () => {
    const headers = ['Team Name', 'Captain Name', 'Contact Details', 'Status', 'Verified', 'Player Details (Name - Jersey)'];
    const csvRows = [headers.join(',')];
    
    teams.forEach(team => {
      const rosterDetails = team.roster && team.roster.length > 0 
        ? team.roster.map((p: any) => `${p.name || p.playerName || 'Unknown'} (#${p.jerseyNumber || 'N/A'})`).join(' | ')
        : 'No players';

      const row = [
        `"${(team.teamName || '').replace(/"/g, '""')}"`,
        `"${(team.captainName || '').replace(/"/g, '""')}"`,
        `"${(team.contactDetails || '').replace(/"/g, '""')}"`,
        `"${team.paymentStatus || ''}"`,
        team.isVerified ? 'Yes' : 'No',
        `"${rosterDetails.replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tournament_teams_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const logAuditAction = async (action: string, targetId: string, targetType: 'team' | 'match') => {
    try {
      const logId = 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      await setDoc(doc(db, 'auditLogs', logId), {
        id: logId,
        action,
        adminId: 'admin_id_placeholder', // Since we don't have a real admin auth yet
        adminEmail: 'admin@example.com',
        targetId,
        targetType,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error logging audit action:", e);
    }
  };

  const handleVerify = async (teamId: string, isVerified: boolean) => {
    try {
      await updateDoc(doc(db, 'teams', teamId), { isVerified });
      if (isVerified) {
        await logAuditAction('Approved team registration', teamId, 'team');
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handlePublishMatch = async (matchId: string) => {
    try {
      await updateDoc(doc(db, 'matches', matchId), { status: 'published' });
      await logAuditAction('Published new match', matchId, 'match');
    } catch(e) {
      console.error(e);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (confirm("Are you sure you want to delete this team?")) {
      try {
        await deleteDoc(doc(db, 'teams', teamId));
      } catch(e) {
        console.error("Error deleting team:", e);
      }
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (confirm("Are you sure you want to delete this match?")) {
      try {
        await deleteDoc(doc(db, 'matches', matchId));
      } catch(e) {
        console.error("Error deleting match:", e);
      }
    }
  };

  const handleVerifyTicket = async (ticketId: string, verified: boolean) => {
    try {
      await updateDoc(doc(db, 'tickets', ticketId), { verified });
    } catch(e) {
      console.error(e);
    }
  };

  const handlePrintTeamPass = (team: any) => {
    const rosterHtml = team.roster && team.roster.length > 0 
      ? team.roster.map((p: any) => `<li>${p.name || p.playerName} <span style="color:#666; font-size: 14px;">(#${p.jerseyNumber || 'N/A'})</span></li>`).join('')
      : '<li>No players listed</li>';

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Team Registration Pass - ${team.teamName}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; text-align: center; }
              .pass { border: 2px dashed #000; padding: 40px; max-width: 600px; margin: 0 auto; }
              h1 { margin-top: 0; }
              .details { text-align: left; margin-top: 30px; font-size: 18px; line-height: 1.6; }
              .roster { margin-top: 20px; text-align: left; }
              .roster h3 { margin-bottom: 10px; }
              .roster ul { list-style-type: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
              .roster li { font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            </style>
          </head>
          <body>
            <div class="pass">
              <h1>ALL PAKISTAN OPEN VOLLEYBALL</h1>
              <h2>OFFICIAL TEAM PASS</h2>
              <hr />
              <div class="details">
                <p><strong>Team Name:</strong> ${team.teamName}</p>
                <p><strong>Captain:</strong> ${team.captainName}</p>
                <p><strong>Status:</strong> VERIFIED</p>
              </div>
              <div class="roster">
                <h3>Player Roster (${team.roster?.length || 0})</h3>
                <ul>
                  ${rosterHtml}
                </ul>
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handlePrintTicket = (ticket: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Spectator Pass - ${ticket.ticketName}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; text-align: center; }
              .pass { border: 2px dashed #000; padding: 40px; max-width: 400px; margin: 0 auto; background: #fafafa; }
              h1 { margin-top: 0; font-size: 24px; }
              .type { font-size: 20px; font-weight: bold; color: #d97706; margin: 20px 0; }
              .details { text-align: left; margin-top: 20px; font-size: 16px; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="pass">
              <h1>ALL PAKISTAN OPEN VOLLEYBALL</h1>
              <div class="type">${ticket.ticketName}</div>
              <hr />
              <div class="details">
                <p><strong>Name:</strong> ${ticket.buyerName || 'Guest'}</p>
                <p><strong>Phone:</strong> ${ticket.buyerPhone || 'N/A'}</p>
                <p><strong>Perks:</strong> ${ticket.description}</p>
                <p><strong>Status:</strong> VERIFIED</p>
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
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

  const handleSetAlert = async () => {
    if (!alertMsg) return;
    setIsSettingAlert(true);
    try {
      await setDoc(doc(db, 'settings', 'liveAlert'), {
        message: alertMsg,
        active: true,
        timestamp: new Date().toISOString()
      });
      setAlertMsg('');
      alert('Live alert broadcasted!');
    } catch(e) {
      alert('Failed to set alert.');
    } finally {
      setIsSettingAlert(false);
    }
  };

  const handleClearAlert = async () => {
    try {
      await setDoc(doc(db, 'settings', 'liveAlert'), { active: false }, { merge: true });
      alert('Alert cleared.');
    } catch(e) {
      console.error(e);
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
      status: 'pending',
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

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white mb-2">Admin Portal</h2>
          <p className="text-sm text-slate-400">Enter the secret password to access.</p>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (password === '55758') {
             setIsAuthenticated(true);
          } else {
             alert('Invalid password');
          }
        }} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-center text-white outline-none focus:border-red-500 tracking-widest text-lg transition-colors"
            placeholder="•••••"
            autoFocus
          />
          <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors text-lg tracking-wider">
             Verify
          </button>
        </form>
      </div>
    );
  }

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
        <button onClick={() => setActiveTab('ads')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'ads' ? 'bg-red-500/20 text-red-500' : 'text-slate-400 hover:text-slate-200'}`}>
          <MonitorPlay className="w-4 h-4" /> Ads manager
        </button>
        <button onClick={() => setActiveTab('tickets')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'tickets' ? 'bg-red-500/20 text-red-500' : 'text-slate-400 hover:text-slate-200'}`}>
          Tickets ({tickets.filter(t => !t.verified).length} Pending)
        </button>
        <button onClick={() => setActiveTab('audit')} className={`px-4 py-2 rounded-lg font-bold text-sm ${activeTab === 'audit' ? 'bg-red-500/20 text-red-500' : 'text-slate-400 hover:text-slate-200'}`}>
          Audit Logs
        </button>
      </div>

      {activeTab === 'ads' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between shadow-xl">
            <div className="flex-1 max-w-lg">
              <h3 className="text-2xl font-black text-white mb-3 flex items-center gap-2"><ImagePlus className="w-6 h-6 text-orange-500" /> Banner Ads Studio</h3>
              <p className="text-sm text-slate-400 leading-relaxed text-balance">
                Upload image or video files securely using standard Firebase Resumable Storage. Images are automatically compressed to ensure reliability. Alternatively, provide an external media link.
              </p>
            </div>
            
            <div className="flex flex-col gap-5 w-full xl:w-[450px]">
              {!selectedFile ? (
                <label className="group bg-slate-950 border-2 border-dashed border-slate-700 hover:border-orange-500 hover:bg-slate-900/50 text-slate-300 transition-all font-bold p-8 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer w-full text-center">
                  <div className="bg-slate-800 group-hover:bg-orange-500/20 group-hover:text-orange-400 p-3 rounded-full transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span>Browse Media File</span>
                  <span className="text-xs font-normal text-slate-500">Supported: WebM, MP4, JPEG, PNG</span>
                  <input type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
                </label>
              ) : (
                <div className="flex flex-col gap-3 w-full bg-slate-950 p-4 border border-slate-800 rounded-xl shadow-inner">
                  {previewUrl && (
                    <div className="aspect-video w-full bg-black rounded-lg overflow-hidden border border-slate-800 relative group">
                       {previewType === 'video' ? (
                         <video src={previewUrl} controls className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                       ) : (
                         <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                       )}
                       <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] uppercase font-black text-orange-400 border border-white/10 shadow-sm">Preview Draft</div>
                    </div>
                  )}
                  
                  {isUploading && (
                    <div className="w-full bg-slate-900 rounded-full h-3 mb-1 overflow-hidden border border-slate-800 relative shadow-inner">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBsNDAtNDBIMjBMMCAyMHptNDAgMEwyMCAwSDBsNDAgNDB6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-20"></div>
                      <div className="bg-orange-500 h-full transition-all duration-300 relative" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-1">
                    <button 
                      onClick={handleUploadFile} 
                      disabled={isUploading}
                      className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
                    >
                      {isUploading ? `${Math.round(uploadProgress)}% Uploading...` : 'Confirm Upload'}
                    </button>
                    <button 
                      onClick={cancelUpload} 
                      disabled={isUploading}
                      className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-700 text-white px-4 py-3 rounded-lg transition-colors shadow-lg disabled:shadow-none"
                      title="Cancel"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  {uploadLogs.length > 0 && (
                    <div className="bg-black/50 border border-slate-800 p-3 rounded-lg mt-2 h-28 overflow-y-auto font-mono text-[10px] text-emerald-400/80 space-y-1 shadow-inner custom-scrollbar">
                      {uploadLogs.map((log, i) => <div key={i}>&gt; {log}</div>)}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 text-slate-600 text-[10px] font-black uppercase tracking-widest justify-center">
                <div className="flex-1 h-px bg-slate-800"></div>
                OR EXTERNAL LINK
                <div className="flex-1 h-px bg-slate-800"></div>
              </div>
              
              <form onSubmit={handleAddAd} className="flex flex-col gap-2 w-full">
                <div className="flex gap-2 w-full relative">
                  <input type="url" value={newAdUrl} onChange={e => setNewAdUrl(e.target.value)} required placeholder="https://example.com/banner.mp4" className="flex-1 min-w-0 bg-slate-950 border border-slate-800 p-3 pl-4 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-slate-600 shadow-inner" />
                  <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 rounded-lg flex items-center justify-center transition-colors border border-slate-700 shadow-md">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ads.map(ad => (
              <div key={ad.id} className={`border p-4 rounded-xl relative overflow-hidden bg-slate-900 ${ad.active ? 'border-orange-500/50' : 'border-slate-800 opacity-60'}`}>
                <div className="aspect-video w-full bg-slate-950 rounded-lg overflow-hidden mb-4 border border-slate-800">
                  {ad.type === 'video' || ad.url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={ad.url} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={ad.url} alt="Ad Banner" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&h=300&fit=crop')} />
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={ad.active} onChange={(e) => handleToggleAd(ad.id, e.target.checked)} className="w-4 h-4 rounded accent-orange-500" />
                    {ad.active ? 'Live' : 'Hidden'}
                  </label>
                  <button onClick={() => handleDeleteAd(ad.id)} className="text-slate-500 hover:text-red-500 transition-colors p-2">
                    <Trash2 className="w-5 h-5" />  
                  </button>
                </div>
              </div>
            ))}
            {ads.length === 0 && (
              <div className="col-span-full text-center p-8 text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">No ads uploaded yet.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'registrations' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={handleDownloadCSV} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
              <Download className="w-4 h-4" /> Download Teams (CSV)
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-300 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-500" /> Pending Approval
            </h3>
            {pendingTeams.length === 0 ? (
              <div className="text-slate-500 text-sm bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">No pending teams.</div>
            ) : pendingTeams.map(team => (
              <div key={team.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 relative overflow-hidden cursor-pointer hover:border-slate-700 transition-colors" onClick={() => setSelectedTeam(team)}>
                <div className="absolute top-0 right-0 p-2 bg-orange-500/10 text-orange-500 text-xs font-bold rounded-bl-lg">Pending</div>
                <h4 className="font-bold text-lg">{team.teamName}</h4>
                <div className="text-sm text-slate-400 space-y-1">
                  <p>Captain: {team.captainName}</p>
                  <p>Contact: {team.contactDetails}</p>
                  <p>Roster: {team.roster?.length || 0} players</p>
                  <p>Status: {team.paymentStatus}</p>
                </div>
                <div className="flex gap-2 pt-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleVerify(team.id, true)} className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-500 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => handleWhatsAppContact(team.contactDetails, `Hi ${team.captainName}, your registration for ${team.teamName} is pending. Please complete the remaining steps.`)} className="px-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 rounded-lg flex items-center justify-center transition-colors tooltip" aria-label="WhatsApp Captain">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteTeam(team.id)} className="px-4 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg flex items-center justify-center transition-colors tooltip" aria-label="Delete Team">
                    <Trash2 className="w-4 h-4" />
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
              <div key={team.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex justify-between items-center group cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setSelectedTeam(team)}>
                <div>
                  <h4 className="font-bold text-slate-200">{team.teamName}</h4>
                  <p className="text-xs text-slate-500">Contact: {team.contactDetails}</p>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handlePrintTeamPass(team)} className="text-slate-500 hover:text-orange-500 p-2 opacity-0 group-hover:opacity-100 transition-all font-bold text-xs flex items-center gap-1">
                    Print Pass
                  </button>
                  <button onClick={() => handleWhatsAppContact(team.contactDetails, `Hi ${team.captainName}, your team ${team.teamName} is verified for the upcoming tournament!`)} className="text-slate-500 hover:text-green-500 p-2 opacity-0 group-hover:opacity-100 transition-all">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleVerify(team.id, false)} className="text-slate-500 hover:text-red-400 p-2">
                    <XCircle className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDeleteTeam(team.id)} className="text-slate-500 hover:text-red-600 p-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      )}

      {activeTab === 'bracket' && (
        <div className="space-y-8">
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
                    if (a.status === 'published') return -1;
                    if (b.status === 'published') return 1;
                    if (a.status === 'pending') return -1;
                    return 1;
                 }
                 return new Date(b.startTime || 0).getTime() - new Date(a.startTime || 0).getTime();
              }).map(match => (
                <div key={match.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden flex flex-col items-center">
                  <div className={`absolute top-0 right-0 p-1 px-3 text-[10px] font-bold rounded-bl-lg uppercase tracking-wider ${
                    match.status === 'live' ? 'bg-red-500/20 text-red-500' :
                    match.status === 'finished' ? 'bg-slate-800 text-slate-400' :
                    match.status === 'pending' ? 'bg-orange-500/20 text-orange-500' :
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
                     <div className="flex items-center gap-4">
                       {match.status === 'pending' && (
                         <button onClick={() => handlePublishMatch(match.id)} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-1 rounded font-bold text-xs transition-colors">
                           Publish Match
                         </button>
                       )}
                       {match.status === 'published' && (
                         <div className="flex items-center gap-2">
                           <button onClick={() => notifyMatchScheduled(match, 1)} className="text-green-500 hover:text-green-400 flex items-center gap-1 font-bold">
                             <MessageCircle className="w-3 h-3" /> T1
                           </button>
                           <button onClick={() => notifyMatchScheduled(match, 2)} className="text-green-500 hover:text-green-400 flex items-center gap-1 font-bold">
                             <MessageCircle className="w-3 h-3" /> T2
                           </button>
                         </div>
                       )}
                       <button onClick={() => handleDeleteMatch(match.id)} className="text-red-500 hover:text-red-400 flex items-center justify-center transition-colors">
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                  </div>
                </div>
              ))}
              {matches.length === 0 && <p className="text-slate-500 text-sm">No matches in the system.</p>}
            </div>
          </div>
          </div>
          <BracketTree matches={matches} />
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
        <div className="max-w-2xl space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white mb-2">Live Alert Banner</h2>
                <p className="text-slate-400 text-sm">Set an active banner visible to all connected users across the app.</p>
            </div>
            
            <div className="space-y-4">
               <textarea 
                 value={alertMsg}
                 onChange={(e) => setAlertMsg(e.target.value)}
                 placeholder="E.g., Event delayed due to rain..."
                 className="w-full h-20 bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 outline-none focus:border-orange-500 transition-colors resize-none"
               />
               <div className="flex justify-between items-center gap-4">
                 <button 
                   onClick={handleSetAlert}
                   disabled={isSettingAlert || !alertMsg}
                   className="flex-1 flex justify-center items-center gap-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                   <AlertTriangle className="w-4 h-4" /> {isSettingAlert ? 'Setting...' : 'Set Active Alert'}
                 </button>
                 <button 
                   onClick={handleClearAlert}
                   className="flex-1 flex justify-center items-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 py-2 px-6 rounded-lg transition-colors">
                   Clear Alert
                 </button>
               </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
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
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-300">Pending Spectator Tickets</h3>
            {tickets.filter(t => !t.verified).length === 0 ? (
              <div className="text-slate-500 text-sm bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">No pending tickets.</div>
            ) : tickets.filter(t => !t.verified).map(ticket => (
              <div key={ticket.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 bg-orange-500/10 text-orange-500 text-xs font-bold rounded-bl-lg">Pending</div>
                <h4 className="font-bold text-lg">{ticket.ticketName}</h4>
                <div className="text-sm text-slate-400 space-y-1">
                  <p>Buyer: {ticket.buyerName}</p>
                  <p>Contact: {ticket.buyerPhone}</p>
                  <p>Price: PKR {ticket.price}</p>
                  <p>Status: {ticket.paymentStatus}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleVerifyTicket(ticket.id, true)} className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-500 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Verify Payment
                  </button>
                  <button onClick={() => handleWhatsAppContact(ticket.buyerPhone, `Hi ${ticket.buyerName}, your ticket payment for ${ticket.ticketName} is pending. Please complete it.`)} className="px-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 rounded-lg flex items-center justify-center transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-300">Verified Spectator Tickets</h3>
            {tickets.filter(t => t.verified).length === 0 ? (
              <div className="text-slate-500 text-sm bg-slate-900/50 border border-slate-800 p-4 rounded-xl text-center">No tickets verified yet.</div>
            ) : tickets.filter(t => t.verified).map(ticket => (
              <div key={ticket.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex justify-between items-center group">
                <div>
                  <h4 className="font-bold text-slate-200">{ticket.ticketName} - {ticket.buyerName}</h4>
                  <p className="text-xs text-slate-500">Contact: {ticket.buyerPhone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handlePrintTicket(ticket)} className="text-slate-500 hover:text-orange-500 p-2 opacity-0 group-hover:opacity-100 transition-all font-bold text-xs flex items-center gap-1">
                    Print Pass
                  </button>
                  <button onClick={() => handleWhatsAppContact(ticket.buyerPhone, `Hi ${ticket.buyerName}, your ${ticket.ticketName} is verified. Your pass is ready.`)} className="text-slate-500 hover:text-green-500 p-2 opacity-0 group-hover:opacity-100 transition-all">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleVerifyTicket(ticket.id, false)} className="text-slate-500 hover:text-red-400 p-2">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-6">Audit Logs</h2>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            {auditLogs.length === 0 ? (
              <p className="text-slate-500 text-center">No audit logs available.</p>
            ) : (
              <div className="space-y-3">
                {auditLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(log => (
                  <div key={log.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 gap-2">
                    <div>
                      <p className="font-bold text-slate-200">{log.action}</p>
                      <p className="text-xs text-slate-400">Target Type: {log.targetType} | Target ID: {log.targetId}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
                      <p className="text-xs text-slate-400">Admin: {log.adminEmail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTeam && (
        <TeamDetailModal selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} matches={matches} />
      )}
    </div>
  );
}
