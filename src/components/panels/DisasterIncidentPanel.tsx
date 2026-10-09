import React from 'react';
import { DisasterIncident, DisasterReport } from '../../types/disaster';
import {
  AlertTriangle,
  MapPin,
  Users,
  Radio,
  Clock,
  ShieldAlert,
  Flame,
  Droplets,
  HeartPulse,
  LifeBuoy,
  X,
  Layers,
  MessageSquare,
  Package,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface DisasterIncidentPanelProps {
  incident: DisasterIncident | null;
  onClose: () => void;
  isLoadingDetail?: boolean;
}

export const DisasterIncidentPanel: React.FC<DisasterIncidentPanelProps> = ({
  incident,
  onClose,
  isLoadingDetail = false,
}) => {
  if (!incident) return null;

  const urgencyColors: Record<string, { bg: string; border: string; text: string }> = {
    CRITICAL: {
      bg: 'bg-rose-950/80',
      border: 'border-rose-500',
      text: 'text-rose-400',
    },
    HIGH: {
      bg: 'bg-amber-950/80',
      border: 'border-amber-500',
      text: 'text-amber-400',
    },
    MEDIUM: {
      bg: 'bg-yellow-950/80',
      border: 'border-yellow-500',
      text: 'text-yellow-400',
    },
    LOW: {
      bg: 'bg-blue-950/80',
      border: 'border-blue-500',
      text: 'text-blue-400',
    },
  };

  const statusBadges: Record<string, { bg: string; text: string; label: string }> = {
    NEW: { bg: 'bg-purple-950 border-purple-700', text: 'text-purple-300', label: 'NEW REPORTED' },
    ACTIVE: { bg: 'bg-rose-950 border-rose-700', text: 'text-rose-300', label: 'ACTIVE INCIDENT' },
    RESCUE_IN_PROGRESS: {
      bg: 'bg-sky-950 border-sky-700',
      text: 'text-sky-300',
      label: 'RESCUE IN PROGRESS',
    },
    RESOLVED: {
      bg: 'bg-emerald-950 border-emerald-700',
      text: 'text-emerald-300',
      label: 'RESOLVED',
    },
  };

  const getEmergencyIcon = (type: string) => {
    switch (type) {
      case 'FLOOD_RESCUE':
        return <Droplets className="w-5 h-5 text-cyan-400" />;
      case 'FIRE':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'MEDICAL_RESCUE':
        return <HeartPulse className="w-5 h-5 text-rose-400" />;
      default:
        return <LifeBuoy className="w-5 h-5 text-amber-400" />;
    }
  };

  const urgencyStyle = urgencyColors[incident.urgency] || urgencyColors.HIGH;
  const statusStyle = statusBadges[incident.status] || statusBadges.ACTIVE;

  return (
    <aside className="absolute right-4 top-24 bottom-24 z-30 w-96 bg-[#091122]/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col overflow-hidden text-slate-100 animate-fade-in">
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          {getEmergencyIcon(incident.emergency_type)}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-cyan-400">INCIDENT #{incident.id}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusStyle.bg} ${statusStyle.text}`}
              >
                {statusStyle.label}
              </span>
            </div>
            <h3 className="font-bold text-sm text-white line-clamp-1">
              {incident.title || incident.emergency_type}
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
        {/* Urgency & Priority Card */}
        <div className={`p-3 rounded-xl border ${urgencyStyle.bg} ${urgencyStyle.border}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-slate-300 font-bold uppercase">URGENCY LEVEL</span>
            <span className={`font-mono font-bold text-xs ${urgencyStyle.text}`}>
              {incident.urgency} PRIORITY
            </span>
          </div>
          <div className="text-[11px] text-slate-300">
            AI Triage Confidence: <span className="font-mono font-bold text-white">{(incident.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Location & Coordinates */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Location Details</span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                incident.location_status === 'confirmed'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : incident.location_status === 'approximate'
                  ? 'bg-amber-950 text-amber-300 border-amber-700'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {incident.location_status === 'confirmed'
                ? 'GPS CONFIRMED'
                : incident.location_status === 'approximate'
                ? 'APPROX AREA'
                : 'LOCATION UNVERIFIED'}
            </span>
          </div>

          <div className="text-sm font-semibold text-white">
            {incident.location_text || 'Unspecified Location'}
          </div>

          {incident.resolved_lat && incident.resolved_lng && (
            <div className="text-[11px] font-mono text-cyan-400">
              Coordinates: {incident.resolved_lat.toFixed(4)}° N, {incident.resolved_lng.toFixed(4)}° E
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-indigo-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-[10px] font-mono text-slate-400">AFFECTED PEOPLE</span>
            </div>
            <div className="text-lg font-bold font-mono text-indigo-200">
              {incident.people_affected || 'Unspecified'}
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-sky-400 mb-1">
              <Radio className="w-4 h-4" />
              <span className="text-[10px] font-mono text-slate-400">REPORT SOURCES</span>
            </div>
            <div className="text-lg font-bold font-mono text-sky-200">{incident.source_count || 1}</div>
          </div>
        </div>

        {/* Required Resources (Parsed from messages) */}
        {incident.resources_needed && incident.resources_needed.length > 0 && (
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 mb-2 font-semibold">
              <Package className="w-4 h-4" />
              <span>Required Emergency Resources</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {incident.resources_needed.map((res, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-amber-950/60 border border-amber-800/80 text-amber-200 rounded-md text-[11px] font-medium"
                >
                  {res}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Incoming Citizen / Dispatch Messages Feed */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Report Feed ({incident.reports?.length || 0})</span>
            </div>
            {isLoadingDetail && <span className="text-[10px] text-cyan-400 animate-pulse">Loading updates...</span>}
          </div>

          {incident.reports && incident.reports.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {incident.reports.map((report) => (
                <div key={report.id} className="p-2 rounded-lg bg-[#050914] border border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-mono font-bold text-cyan-300">{report.source}</span>
                    <span>{new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{report.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 text-[11px] italic">
              No detailed text reports attached yet for this incident.
            </div>
          )}
        </div>

        {/* Timestamp footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Updated: {new Date(incident.updated_at).toLocaleTimeString()}</span>
          </div>
          <span>Ref ID: #{incident.id}</span>
        </div>
      </div>
    </aside>
  );
};
