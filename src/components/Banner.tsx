/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TOURNAMENT_DETAILS } from '../data';
import { Calendar, MapPin, Phone, User, Award, Flame, Megaphone } from 'lucide-react';
import { TournamentStats } from '../types';

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOver: boolean;
}

export default function Banner({ stats }: { stats?: TournamentStats }) {
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false
  });

  useEffect(() => {
    // Starting date is July 2 2026 10:00 AM Pakistan Standard Time (UTC+5)
    const targetDate = new Date('2026-07-02T10:00:00+05:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        clearInterval(interval);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds, isOver: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-6 md:p-10 text-white border border-slate-800 mb-8" id="tournament-banner">
      {/* Decorative absolute background pattern */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl -z-1" />
      <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -z-1" />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-orange-640/20 border border-orange-500/30 px-3 py-1 rounded-full text-orange-400 text-[10px] font-bold tracking-wider uppercase">
            <Award className="w-3.5 h-3.5 text-orange-500" /> Sponsor: Fawad Group of Companies (FGC)
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            🏆 ALL PAKISTAN OPEN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
              VOLLEYBALL TOURNAMENT
            </span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-slate-300 text-sm">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-orange-450 shrink-0 mt-0.5" />
              <span>
                <strong>Venue:</strong> {TOURNAMENT_DETAILS.venue}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-orange-450 shrink-0" />
              <span>
                <strong>Starting Date:</strong> {TOURNAMENT_DETAILS.startDate}
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-amber-500 shrink-0" />
                <span>
                  <strong>Chief Organizers:</strong> {TOURNAMENT_DETAILS.chiefOrganizers.join(', ').replace(/, ([^,]*)$/, ' & $1')}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-5 h-5 text-amber-500 shrink-0" />
                <span>
                  <strong>Contact:</strong> {TOURNAMENT_DETAILS.contactNumber}
                </span>
              </div>
              <a
                href="https://wa.me/923060888584"
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd59] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors w-fit border border-[#1da851]"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.472-1.761-1.645-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="pt-2 flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="inline-block bg-slate-950/60 rounded-lg px-4 py-2 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-0.5">Official Slogan</span>
              <p className="font-serif italic text-orange-300/90 text-xs">"Rule the Court, Claim the Pride!" • Registration Open</p>
            </div>
            {stats?.featuredAdvertisement && (
              <a 
                 href={stats.featuredAdvertisementLink || '#'} 
                 target={stats.featuredAdvertisementLink ? "_blank" : undefined}
                 rel="noreferrer"
                 className={`inline-flex flex-col bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg px-4 py-2 transition-colors ${stats.featuredAdvertisementLink ? 'cursor-pointer' : 'cursor-default'}`}
              >
                  <span className="text-[9px] text-amber-500 uppercase tracking-widest font-black flex items-center gap-1 mb-0.5"><Megaphone className="w-3 h-3" /> Sponsor Announcement</span>
                  <span className="text-amber-100 text-xs font-bold mb-2">{stats.featuredAdvertisement}</span>
                  {stats.featuredAdvertisementMediaUrl && stats.featuredAdvertisementMediaType === 'image' && (
                     <img src={stats.featuredAdvertisementMediaUrl} alt="Sponsor" className="max-w-[200px] max-h-[100px] object-contain rounded mt-1 border border-amber-500/20" />
                  )}
                  {stats.featuredAdvertisementMediaUrl && stats.featuredAdvertisementMediaType === 'video' && (
                     <video src={stats.featuredAdvertisementMediaUrl} autoPlay loop muted playsInline className="max-w-[200px] max-h-[100px] object-contain rounded mt-1 border border-amber-500/20" />
                  )}
              </a>
            )}
          </div>
        </div>

        {/* Countdown Ticker */}
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 md:p-6 lg:min-w-[320px] text-center shadow-lg hover:border-orange-500/20 transition-colors">
          <div className="flex items-center justify-center gap-2 mb-3 text-orange-500 font-bold uppercase tracking-wider text-xs">
            <Flame className="w-4 h-4 text-orange-500 shrink-0" />
            Tournament Countdown
          </div>

          {countdown.isOver ? (
            <div className="py-4 text-orange-500 font-black text-2xl tracking-widest animate-pulse">
              🔥 THE TOURNAMENT IS LIVE!
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              <div className="flex flex-col bg-slate-900 rounded-lg p-2 min-w-[60px] border border-slate-850">
                <span className="text-2xl md:text-3xl font-black font-mono text-white">{countdown.days}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Days</span>
              </div>
              <div className="flex flex-col bg-slate-900 rounded-lg p-2 min-w-[60px] border border-slate-850">
                <span className="text-2xl md:text-3xl font-black font-mono text-white">
                  {String(countdown.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Hrs</span>
              </div>
              <div className="flex flex-col bg-slate-900 rounded-lg p-2 min-w-[60px] border border-slate-850">
                <span className="text-2xl md:text-3xl font-black font-mono text-white">
                  {String(countdown.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Mins</span>
              </div>
              <div className="flex flex-col bg-slate-900 rounded-lg p-2 min-w-[60px] border border-slate-850">
                <span className="text-2xl md:text-3xl font-black font-mono text-orange-400">
                  {String(countdown.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Secs</span>
              </div>
            </div>
          )}

          <div className="mt-4 bg-orange-600/10 rounded-lg py-2 px-3 text-xs text-orange-300 border border-orange-500/20">
            🥇 Winner Cash Prize & Trophy Awaits!
          </div>
        </div>
      </div>
    </div>
  );
}
