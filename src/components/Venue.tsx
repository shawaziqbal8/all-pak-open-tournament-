import React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, Navigation } from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export default function Venue() {
  if (!hasValidKey) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-xl" style={{fontFamily:'sans-serif'}}>
        <div style={{textAlign:'center',maxWidth:520}}>
          <h2 className="text-2xl font-black text-white mb-4">Google Maps API Key Required</h2>
          <div className="text-slate-400 space-y-4 text-sm">
            <p><strong>Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener" className="text-orange-500 hover:text-orange-400 font-bold underline">Get an API Key</a></p>
            <p><strong>Step 2:</strong> Add your key as a secret in AI Studio:</p>
            <ul className="text-left list-disc pl-6 space-y-2 mb-4 bg-slate-950 p-4 rounded-lg font-mono">
              <li>Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
              <li>Select <strong>Secrets</strong></li>
              <li>Type <code className="text-orange-400">GOOGLE_MAPS_PLATFORM_KEY</code> as the secret name, press <strong>Enter</strong></li>
              <li>Paste your API key as the value, press <strong>Enter</strong></li>
            </ul>
            <p className="italic text-slate-500">The app will automatically rebuild after adding the secret.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white mb-2">Tournament Venue</h2>
        <p className="text-sm text-slate-400">View tournament location, courts, and nearby parking options.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[600px] rounded-xl overflow-hidden shadow-lg border border-slate-800 relative bg-slate-950">
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={{ lat: 34.8732, lng: 72.8601 }} // Bisham, Shangla Approx
              defaultZoom={15}
              mapId="TOURNAMENT_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              {/* Main Venue */}
              <AdvancedMarker position={{ lat: 34.8732, lng: 72.8601 }} title="Khursheed Khan Volleyball Ground">
                <Pin background="#f97316" borderColor="#c2410c" glyphColor="#fff" />
              </AdvancedMarker>
              
              {/* Parking 1 */}
              <AdvancedMarker position={{ lat: 34.8740, lng: 72.8610 }} title="Main Parking Lot">
                <Pin background="#3b82f6" borderColor="#1d4ed8" glyphColor="#fff" />
              </AdvancedMarker>

              {/* Medical Tent */}
              <AdvancedMarker position={{ lat: 34.8735, lng: 72.8590 }} title="Medical Services">
                <Pin background="#ef4444" borderColor="#b91c1c" glyphColor="#fff" />
              </AdvancedMarker>

              {/* Food & Beverages */}
              <AdvancedMarker position={{ lat: 34.8725, lng: 72.8605 }} title="Food Stalls & Refreshments">
                <Pin background="#22c55e" borderColor="#15803d" glyphColor="#fff" />
              </AdvancedMarker>
            </Map>
          </APIProvider>
        </div>

        <div className="space-y-4">
           <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl transition-colors hover:border-slate-700">
             <div className="flex gap-3 mb-2">
               <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center border border-orange-500/20 shrink-0">
                  <MapPin className="w-5 h-5 text-orange-500" />
               </div>
               <div>
                  <h3 className="font-black text-white text-lg">Main Ground</h3>
                  <p className="text-xs text-orange-500 font-bold tracking-wider uppercase">Khursheed Khan</p>
               </div>
             </div>
             <p className="text-sm text-slate-400 mb-3">Taja Maira,<br/>Bisham, Shangla</p>
             <button className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
               <Navigation className="w-4 h-4" /> Get Directions
             </button>
           </div>
           
           <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl transition-colors hover:border-slate-700">
             <h3 className="font-bold text-slate-200 mb-2 flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-blue-500"></div> Event Dates
             </h3>
             <p className="text-sm text-slate-400">Tournament officially starts on <strong>2 July</strong>. Parking available near the ground.</p>
           </div>
           
           <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl transition-colors hover:border-slate-700">
             <h3 className="font-bold text-slate-200 mb-2 border-b border-slate-800 pb-2">Arena Guidelines</h3>
             <ul className="text-sm text-slate-400 space-y-2 mt-3 list-disc pl-4">
               <li>No outside food or drinks</li>
               <li>Clear bag policy strictly enforced</li>
               <li>Entry gates close at halftime</li>
             </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
