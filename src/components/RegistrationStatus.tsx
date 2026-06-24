import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { TeamReg } from '../types';
import { Search, Printer, AlertTriangle, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

export default function RegistrationStatus() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [teamResults, setTeamResults] = useState<TeamReg[]>([]);
  const [ticketResults, setTicketResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setIsSearching(true);
    setHasSearched(false);
    
    try {
      // Find teams
      const qTeams = query(collection(db, 'teams'), where('contactDetails', '==', phoneNumber));
      const teamSnap = await getDocs(qTeams);
      setTeamResults(teamSnap.docs.map(d => ({ ...d.data() } as TeamReg)));

      // Find tickets
      const qTickets = query(collection(db, 'tickets'), where('buyerPhone', '==', phoneNumber));
      const ticketSnap = await getDocs(qTickets);
      setTicketResults(ticketSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
    } catch (error) {
      console.error(error);
      alert('Error searching status. Please try again.');
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const handlePrintTeamPass = (team: TeamReg) => {
    const rosterHtml = team.roster && team.roster.length > 0 
      ? team.roster.map(p => `<li>${p.name || p.playerName} <span style="color:#666; font-size: 14px;">(#${p.jerseyNumber || 'N/A'})</span></li>`).join('')
      : '<li>No players listed</li>';

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Team Pass - ${team.teamName}</title>
            <style>
              body { font-family: sans-serif; text-align: center; padding: 40px; }
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
              <h1>ALL PAKISTAN OPEN</h1>
              <h2>OFFICIAL TEAM PASS</h2>
              <div class="details">
                <p><strong>Team Name:</strong> ${team.teamName}</p>
                <p><strong>Captain:</strong> ${team.captainName}</p>
                <p><strong>Status:</strong> VERIFIED</p>
              </div>
              <div class="roster">
                <h3>Player Roster (${team.roster?.length || 0})</h3>
                <ul>${rosterHtml}</ul>
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); }
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
            <title>Spectator Ticket - ${ticket.ticketName}</title>
            <style>
              body { font-family: sans-serif; text-align: center; padding: 40px; }
              .pass { border: 2px dashed #000; padding: 40px; max-width: 400px; margin: 0 auto; }
              h1 { margin-top: 0; font-size: 24px; }
              h2 { color: #f97316; font-size: 20px; }
              .details { text-align: left; margin-top: 30px; font-size: 18px; line-height: 1.8; }
            </style>
          </head>
          <body>
            <div class="pass">
              <h1>ALL PAKISTAN OPEN</h1>
              <h2>${ticket.ticketName}</h2>
              <div class="details">
                <p><strong>Name:</strong> ${ticket.buyerName}</p>
                <p><strong>Contact:</strong> ${ticket.buyerPhone}</p>
                <p><strong>Status:</strong> VERIFIED</p>
                <p><strong>ID:</strong> ${ticket.id}</p>
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white mb-2">Check Registration Status</h2>
        <p className="text-sm text-slate-400">Enter your phone number to check if your team or tickets are verified, and print your passes.</p>
      </div>

      <form onSubmit={handleSearch} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex gap-4">
        <div className="flex-1">
          <input 
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter Phone Number (e.g. +923... or 03...)"
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-orange-500 transition-colors"
          />
        </div>
        <button 
          type="submit" 
          disabled={isSearching || !phoneNumber}
          className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {isSearching ? 'Searching...' : <><Search className="w-5 h-5" /> Search</>}
        </button>
      </form>

      {hasSearched && (
        <div className="space-y-6">
          {teamResults.length === 0 && ticketResults.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-slate-400">
              No registration records found for this phone number.
            </div>
          )}

          {teamResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-200">Team Registrations</h3>
              {teamResults.map((team, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-xl text-white">{team.teamName}</h4>
                      <p className="text-sm text-slate-400">Captain: {team.captainName}</p>
                    </div>
                    {team.isVerified ? (
                      <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-sm font-bold border border-green-500/20">
                        <CheckCircle2 className="w-4 h-4" /> Verified
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full text-sm font-bold border border-orange-500/20">
                        <AlertTriangle className="w-4 h-4" /> Pending Verification
                      </div>
                    )}
                  </div>
                  {team.isVerified ? (
                    <button onClick={() => handlePrintTeamPass(team)} className="bg-slate-800 hover:bg-slate-700 text-white w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                      <Printer className="w-5 h-5" /> Print Team Pass
                    </button>
                  ) : (
                    <p className="text-xs text-slate-500 text-center">Your team pass will be available to print once admin verifies your payment.</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {ticketResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-200">Spectator Tickets</h3>
              {ticketResults.map((ticket, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-200">{ticket.ticketName}</h4>
                    <p className="text-xs text-slate-500">For: {ticket.buyerName}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {ticket.verified ? (
                      <span className="text-green-500 font-bold text-sm flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Verified</span>
                    ) : (
                      <span className="text-orange-500 font-bold text-sm flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Pending</span>
                    )}
                    <button 
                      onClick={() => handlePrintTicket(ticket)} 
                      disabled={!ticket.verified}
                      className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                      <Printer className="w-4 h-4" /> Print
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
