import React, { useState } from 'react';
import { GOV_PORTALS, GovPortal } from '../../data/govPortals';
import { Shield, ExternalLink, Radio, AlertTriangle, Phone, CheckCircle2, X, RefreshCw } from 'lucide-react';

interface GovPortalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GovPortalsModal: React.FC<GovPortalsModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'alerts' | 'weather' | 'cyclone' | 'flood' | 'satellite'>('all');

  if (!isOpen) return null;

  const filteredPortals =
    activeCategory === 'all'
      ? GOV_PORTALS
      : GOV_PORTALS.filter((p) => p.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050914]/85 backdrop-blur-md p-4">
      <div className="w-[880px] max-w-full max-h-[90vh] flex flex-col bg-[#091122] border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#050914]/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg shadow-orange-950/40 text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Government Weather & Disaster Portals Hub</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  OFFICIAL LIVE GATEWAYS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct integration with NDMA SACHET, IMD Mausam, CWC Flood Forecasting & ISRO Portals
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Helplines Quick Ticker */}
        <div className="flex items-center justify-between px-4 py-2 bg-rose-950/30 border-b border-rose-900/40 text-xs text-rose-200">
          <div className="flex items-center gap-2 font-medium">
            <Phone className="w-3.5 h-3.5 text-rose-400" />
            <span>National Disaster Helplines:</span>
            <span className="font-mono font-bold text-white">NDMA: 1078</span>
            <span>·</span>
            <span className="font-mono font-bold text-white">IMD Weather: 1800-180-1717</span>
            <span>·</span>
            <span className="font-mono font-bold text-white">Emergency Response: 112</span>
          </div>
          <span className="text-[11px] text-rose-300 font-mono">24/7 Operations</span>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800 bg-[#050914]/40 text-xs">
          {(
            [
              { id: 'all', label: 'All Portals (6)' },
              { id: 'alerts', label: 'NDMA SACHET (CAP)' },
              { id: 'weather', label: 'IMD Weather' },
              { id: 'cyclone', label: 'Cyclone Tracking' },
              { id: 'flood', label: 'CWC Flood' },
              { id: 'satellite', label: 'ISRO Satellite' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-cyan-600 text-white font-semibold shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Portals Cards Grid */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          {filteredPortals.map((portal) => (
            <div
              key={portal.id}
              className="p-4 bg-[#050914] border border-slate-800 rounded-xl hover:border-cyan-500/50 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{portal.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {portal.status}
                    </span>
                  </div>
                  <div className="text-xs text-cyan-400 font-medium">{portal.agency}</div>
                </div>

                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-950 transition-all shrink-0 cursor-pointer"
                >
                  <span>Launch Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{portal.description}</p>

              {/* Latest Official Bulletin */}
              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wide block mb-0.5">
                  Latest Ingested Bulletin / Advisory:
                </span>
                <span className="text-slate-200">{portal.latestBulletin}</span>
              </div>

              {/* Key Features & Helpline */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div className="flex flex-wrap gap-1.5">
                  {portal.features.map((feat, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-800 rounded text-slate-300">
                      {feat}
                    </span>
                  ))}
                </div>
                <div className="font-mono text-slate-300">{portal.helpline}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
