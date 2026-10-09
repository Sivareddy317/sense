import React from 'react';
import { DisasterDashboardMetrics, DisasterBackendStatus } from '../../types/disaster';
import {
  AlertOctagon,
  AlertTriangle,
  Users,
  LifeBuoy,
  CheckCircle2,
  Activity,
  Radio,
  Server,
  RefreshCw,
} from 'lucide-react';

interface DisasterStatsHeaderProps {
  metrics: DisasterDashboardMetrics | null;
  backendStatus: DisasterBackendStatus;
  onRefresh: () => void;
  isRefreshing: boolean;
  totalPeopleAffectedFromIncidents: number;
  activeIncidentsCount: number;
  criticalCount: number;
  highCount: number;
  rescueInProgressCount: number;
  resolvedCount: number;
}

export const DisasterStatsHeader: React.FC<DisasterStatsHeaderProps> = ({
  metrics,
  backendStatus,
  onRefresh,
  isRefreshing,
  totalPeopleAffectedFromIncidents,
  activeIncidentsCount,
  criticalCount,
  highCount,
  rescueInProgressCount,
  resolvedCount,
}) => {
  const activeTotal = metrics?.incidents?.active ?? activeIncidentsCount;
  const critTotal = metrics?.incidents?.urgency_breakdown?.CRITICAL ?? criticalCount;
  const highTotal = metrics?.incidents?.urgency_breakdown?.HIGH ?? highCount;
  const rescueTotal = metrics?.incidents?.rescue_in_progress ?? rescueInProgressCount;
  const resTotal = metrics?.incidents?.resolved ?? resolvedCount;

  return (
    <div className="relative z-30 bg-[#091122]/95 border-b border-slate-800/90 px-4 py-2.5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Connection Status Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-mono">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">DISASTER AI BACKEND:</span>
            {backendStatus.isOnline ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                LIVE ONLINE
              </span>
            ) : (
              <span className="text-amber-400 font-semibold">CONNECTING / OFFLINE</span>
            )}
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Live DisasterAI API Feed"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Sync API</span>
          </button>
        </div>

        {/* 6 Key Disaster Summary Stat Cards */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* 1. Active Incidents */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-inner">
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-mono leading-none">ACTIVE INCIDENTS</div>
              <div className="text-sm font-bold text-cyan-300 font-mono leading-tight">{activeTotal}</div>
            </div>
          </div>

          {/* 2. Critical Urgency */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
            <div>
              <div className="text-[10px] text-rose-300/80 font-mono leading-none">CRITICAL URGENCY</div>
              <div className="text-sm font-bold text-rose-400 font-mono leading-tight">{critTotal}</div>
            </div>
          </div>

          {/* 3. High Priority */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-amber-300/80 font-mono leading-none">HIGH PRIORITY</div>
              <div className="text-sm font-bold text-amber-400 font-mono leading-tight">{highTotal}</div>
            </div>
          </div>

          {/* 4. People Affected */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-indigo-200">
            <Users className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <div className="text-[10px] text-indigo-300/80 font-mono leading-none">PEOPLE AFFECTED</div>
              <div className="text-sm font-bold text-indigo-300 font-mono leading-tight">
                {totalPeopleAffectedFromIncidents}
              </div>
            </div>
          </div>

          {/* 5. Rescue In Progress */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-950/40 border border-sky-800/60 text-sky-200">
            <LifeBuoy className="w-4 h-4 text-sky-400 shrink-0 animate-spin-slow" />
            <div>
              <div className="text-[10px] text-sky-300/80 font-mono leading-none">RESCUE IN PROGRESS</div>
              <div className="text-sm font-bold text-sky-300 font-mono leading-tight">{rescueTotal}</div>
            </div>
          </div>

          {/* 6. Resolved Incidents */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-emerald-300/80 font-mono leading-none">RESOLVED</div>
              <div className="text-sm font-bold text-emerald-400 font-mono leading-tight">{resTotal}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
