import React, { useState } from 'react';
import { SpectatorTicket } from '../types';
import TicketRegistration from './TicketRegistration';
import { Ticket, Search, Printer, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface TicketPortalProps {
  tickets: SpectatorTicket[];
  onRegisterTicket: (ticket: SpectatorTicket) => void;
}

export default function TicketPortal({ tickets, onRegisterTicket }: TicketPortalProps) {
  const [view, setView] = useState<'options' | 'register' | 'status'>('options');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchedTickets, setSearchedTickets] = useState<SpectatorTicket[] | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone) return;
    const found = tickets.filter(t => t.contactNumber === searchPhone);
    setSearchedTickets(found);
  };

  const handlePrint = (ticket: SpectatorTicket) => {
    const printContent = `
      <div style="font-family: sans-serif; padding: 20px; border: 2px dashed #000; width: 300px; text-align: center; margin: 0 auto;">
         <h2 style="margin: 0 0 10px 0;">Tournament Pass</h2>
         <p style="font-size: 14px; color: #555; margin: 0 0 20px 0;">Admit One</p>
         <h1 style="margin: 0 0 10px 0;">${ticket.category === '100' ? 'Standard' : ticket.category === '200' ? 'Premium' : 'VIP'} Pass</h1>
         <h3 style="margin: 0 0 20px 0; color: #d97706;">Rs ${ticket.category}</h3>
         <div style="text-align: left; background: #eee; padding: 10px; margin-bottom: 20px;">
           <p style="margin: 5px 0;"><strong>Name:</strong> ${ticket.name}</p>
           <p style="margin: 5px 0;"><strong>Facilities:</strong> ${ticket.facilities}</p>
           <p style="margin: 5px 0;"><strong>TID:</strong> ${ticket.paymentDetails.transactionId}</p>
         </div>
         <p style="font-size: 12px; font-weight: bold; margin:0;">VERIFIED TICKET</p>
         <p style="font-size: 10px; color: #999; margin-top:5px;">${ticket.id}</p>
      </div>
    `;

    const printWindow = window.open('', '', 'width=600,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Ticket - ${ticket.name}</title>
          </head>
          <body onload="window.print(); window.close();">
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      {view === 'options' && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              onClick={() => setView('register')}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-orange-500 hover:bg-slate-800 transition"
            >
              <Ticket className="w-12 h-12 text-orange-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Buy a Spectator Ticket</h3>
              <p className="text-sm text-slate-400">Purchase a pass for the tournament. Options available Rs 100, 200, 300 with different facilities.</p>
            </div>
            
            <div 
              onClick={() => setView('status')}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-emerald-500 hover:bg-slate-800 transition"
            >
              <Search className="w-12 h-12 text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Check Status / Print Pass</h3>
              <p className="text-sm text-slate-400">Already bought a ticket? Enter your phone number to check verification status and print your pass.</p>
            </div>
         </div>
      )}

      {view === 'register' && (
         <TicketRegistration 
            onRegisterTicket={(t) => {
               onRegisterTicket(t);
               setView('status');
               setSearchPhone(t.contactNumber);
               setSearchedTickets([t]);
               alert("Ticket registration submitted! Admin will verify your payment.");
            }} 
            onCancel={() => setView('options')} 
         />
      )}

      {view === 'status' && (
         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-white">Find Your Ticket</h2>
               <button onClick={() => setView('options')} className="text-sm font-semibold text-slate-400 hover:text-white">Back</button>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-sm mb-8">
               <input
                 type="text"
                 placeholder="Enter Contact Number used for registration"
                 value={searchPhone}
                 onChange={e => setSearchPhone(e.target.value)}
                 className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none"
               />
               <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition">Search</button>
            </form>

            {searchedTickets !== null && (
               <div className="space-y-4">
                  {searchedTickets.length === 0 ? (
                    <div className="text-slate-400 text-sm">No tickets found for this number.</div>
                  ) : (
                    searchedTickets.map(t => (
                       <div key={t.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
                          <div>
                            <div className="text-white font-bold text-lg">{t.name} <span className="text-sm text-orange-400 ml-2">Rs {t.category} Pass</span></div>
                            <div className="text-xs text-emerald-400 mt-1">{t.facilities}</div>
                            <div className="text-xs text-slate-500 mt-1">Reg Date: {t.registrationDate}</div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-1">
                               {t.paymentStatus === 'paid' && <><CheckCircle2 className="w-5 h-5 text-emerald-500" /><span className="text-sm font-bold text-emerald-500">Verified</span></>}
                               {t.paymentStatus === 'pending' && <><Clock className="w-5 h-5 text-amber-500" /><span className="text-sm font-bold text-amber-500">Pending Verification</span></>}
                               {t.paymentStatus === 'unpaid' && <><XCircle className="w-5 h-5 text-red-500" /><span className="text-sm font-bold text-red-500">Rejected</span></>}
                             </div>

                             {t.paymentStatus === 'paid' && (
                                <button 
                                  onClick={() => handlePrint(t)}
                                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition"
                                >
                                   <Printer className="w-4 h-4" /> Print Pass
                                </button>
                             )}
                          </div>
                       </div>
                    ))
                  )}
               </div>
            )}
         </div>
      )}
    </div>
  );
}
