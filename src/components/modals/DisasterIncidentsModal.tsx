import React, { useState, useMemo } from 'react';
import { DisasterIncident, DisasterUrgency, DisasterStatus } from '../../types/disaster';
import {
  X,
  Search,
  Filter,
  AlertOctagon,
  AlertTriangle,
  Users,
  MapPin,
  Radio,
  Flame,
  Droplets,
  HeartPulse,
  LifeBuoy,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface DisasterIncidentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: DisasterIncident[];
  selectedIncident: DisasterIncident | null;
  onSelectIncident: (inc: DisasterIncident) => void;
  onFocusOnMap: (inc: DisasterIncident) => void;
}

export const DisasterIncidentsModal: React.FC<DisasterIncidentsModalProps> = ({
  isOpen,
  onClose,
  incidents,
  selectedIncident,
  onSelectIncident,
  onFocusOnMap,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterUrgency, setFilterUrgency] = useState<DisasterUrgency | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      const matchSearch =
        !searchQuery.trim() ||
        inc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.emergency_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.location_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(inc.id).includes(searchQuery);

      const matchUrgency = filterUrgency === 'ALL' || inc.urgency === filterUrgency;
      const matchType = filterType === 'ALL' || inc.emergency_type === filterType;

      return matchSearch && matchUrgency && matchType;
    });
  }, [incidents, searchQuery, filterUrgency, filterType]);

  const getEmergencyBadge = (type: string) => {
    switch (type) {
      case 'FLOOD_RESCUE':
        return <span className="flex items-center gap-1 text-cyan-300 font-bold">💧 FLOOD RESCUE</span>;
      case 'FIRE':
        return <span className="flex items-center gap-1 text-orange-400 font-bold">🔥 FIRE</span>;
      case 'MEDICAL_RESCUE':
        return <span className="flex items-center gap-1 text-rose-400 font-bold">🚑 MEDICAL RESCUE</span>;
      default:
        return <span className="flex items-center gap-1 text-amber-400 font-bold">🛟 {type}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl h-[85vh] bg-[#091122] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-900/40">
              <AlertOctagon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white tracking-wide">
                  DisasterAI Emergency Incidents Directory
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  {incidents.length} TOTAL RECORDS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI-deduplicated emergency incident feeds from SMS, WhatsApp, and Twitter
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#050914] border-b border-slate-800 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by Incident ID, Type, Location, or Keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((urg) => (
              <button
                key={urg}
                onClick={() => setFilterUrgency(urg)}
                className={`px-2 py-1 rounded-md capitalize font-mono text-[11px] transition-colors cursor-pointer ${
                  filterUrgency === urg
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {urg}
              </button>
            ))}
          </div>
        </div>

        {/* Incidents Table / Grid */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin space-y-2">
          {filtered.length > 0 ? (
            filtered.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;
              const isCritical = inc.urgency === 'CRITICAL';

              return (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                      : isCritical
                      ? 'bg-rose-950/20 border-rose-900/60 hover:bg-rose-950/40'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">#{inc.id}</span>
                      <div className="text-xs">{getEmergencyBadge(inc.emergency_type)}</div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          isCritical
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}
                      >
                        {inc.urgency}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {inc.status}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFocusOnMap(inc);
                        onClose();
                      }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/80 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Focus on Map</span>
                    </button>
                  </div>

                  <div className="text-xs font-semibold text-white mb-1">
                    {inc.title || `${inc.emergency_type} - ${inc.location_text || 'Unspecified Location'}`}
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 font-mono pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-4">
                      <span>
                        Location: <strong className="text-slate-200">{inc.location_text || 'Unverified'}</strong>
                      </span>
                      <span>
                        Affected: <strong className="text-indigo-300">{inc.people_affected || 'N/A'}</strong>
                      </span>
                      <span>
                        Sources: <strong className="text-sky-300">{inc.source_count}</strong>
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500">
                      Updated: {new Date(inc.updated_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching emergency incidents found. Try adjusting your search or filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
