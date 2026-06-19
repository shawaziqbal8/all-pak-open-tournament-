import React from "react";
import {
  X,
  Book,
  Trophy,
  ShieldAlert,
  Award,
  AlertTriangle,
  AlertCircle,
  Camera,
} from "lucide-react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 text-slate-300">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Book className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                Official Tournament Guide
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Rules, Prizes & Policies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-950/50 hover:bg-slate-950 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          {/* Section 1: Rulebook */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Trophy className="w-5 h-5 text-orange-400" /> Official Rulebook
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                <h4 className="font-bold text-white text-sm mb-2">
                  Match Format
                </h4>
                <ul className="text-sm space-y-1.5 text-slate-400 list-disc list-inside">
                  <li>Best of 3 sets for preliminary matches.</li>
                  <li>
                    Best of 5 sets for Quarterfinals, Semifinals, and Final.
                  </li>
                  <li>First to 25 points wins a set (must win by 2).</li>
                  <li>Deciding set played to 15 points (must win by 2).</li>
                </ul>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                <h4 className="font-bold text-white text-sm mb-2">
                  Team Requirements
                </h4>
                <ul className="text-sm space-y-1.5 text-slate-400 list-disc list-inside">
                  <li>Max roster size of 12 athletes.</li>
                  <li>Standard kit/jersey colors per team required.</li>
                  <li>Substitutions limited to 6 per set.</li>
                  <li>One designated Libero player allowed per set.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: Prize Distribution */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Award className="w-5 h-5 text-orange-400" /> Prize Distribution
            </h3>
            <div className="bg-slate-950 rounded-xl border border-slate-850 overflow-hidden divide-y divide-slate-800">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="block text-xl font-black text-white">
                    1st Place (Champions)
                  </span>
                  <span className="text-xs text-slate-400">
                    Total Prize Money & Gold Trophy
                  </span>
                </div>
                <span className="text-2xl font-mono font-black text-orange-500">
                  PKR 100,000
                </span>
              </div>
              <div className="p-4 flex items-center justify-between bg-slate-900/50">
                <div>
                  <span className="block text-lg font-bold text-slate-200">
                    2nd Place (Runner-ups)
                  </span>
                  <span className="text-xs text-slate-400">Silver Trophy</span>
                </div>
                <span className="text-xl font-mono font-bold text-slate-300">
                  PKR 50,000
                </span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="block text-base font-bold text-slate-300">
                    Individual Honors
                  </span>
                  <span className="text-xs text-slate-400">
                    Best Player, Best Spiker, Best Setter
                  </span>
                </div>
                <span className="text-base font-mono font-bold text-slate-400">
                  PKR 5,000 (Ea)
                </span>
              </div>
            </div>
          </section>

          {/* Section 3: Disciplinary Policies */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldAlert className="w-5 h-5 text-red-500" /> Disciplinary
              Policies
            </h3>
            <div className="space-y-3">
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-bold text-red-400 mb-1">
                    Zero Tolerance for Misconduct
                  </h4>
                  <p className="text-red-200/80">
                    Any verbal or physical abuse directed at umpires,
                    organizers, or opposing teams will result in immediate
                    disqualification of the entire team without a refund.
                  </p>
                </div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-bold text-orange-400 mb-1">
                    Late Attendance Policy
                  </h4>
                  <p className="text-orange-200/80">
                    Teams must report 15 minutes before the scheduled match
                    time. A delay of more than 10 minutes leads to a walkover
                    (forfeit).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Photo Gallery */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Camera className="w-5 h-5 text-orange-400" /> Tournament Gallery
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden border border-slate-800 h-48 relative group">
                <img src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1600&auto=format&fit=crop" alt="Volleyball Court" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-4">
                  <span className="text-sm font-bold text-white">Professional Arenas</span>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-800 h-48 relative group">
                <img src="https://images.unsplash.com/photo-1592656094267-764a45160876?q=80&w=1600&auto=format&fit=crop" alt="Volleyball Spike" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-4">
                  <span className="text-sm font-bold text-white">High-Flying Action</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            I Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
