import React from 'react';
import { TELEMETRY_STATIONS } from '../../data/telemetryStations';
import { Radio, Activity, CheckCircle, AlertTriangle, X, RefreshCw } from 'lucide-react';

interface SensorNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SensorNetworkModal: React.FC<SensorNetworkModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050914]/80 backdrop-blur-md p-4">
      <div className="w-[720px] max-w-full max-h-[90vh] flex flex-col bg-[#091122] border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#050914]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950 rounded-lg border border-cyan-800 text-cyan-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">National Sensor Telemetry Network</h3>
              <p className="text-xs text-slate-400">Doppler Weather Radars, AWS Mesonets & CWC Basin Gauges</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-[#050914] border border-slate-800 rounded-xl">
              <div className="text-[10px] text-slate-400">DWR RADARS ACTIVE</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">3 / 3 Online</div>
              <div className="text-[11px] text-slate-500 mt-1">S-Band / C-Band Pulse Doppler</div>
            </div>
            <div className="p-3 bg-[#050914] border border-slate-800 rounded-xl">
              <div className="text-[10px] text-slate-400">AWS TELEMETRY PING</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">24 ms Mean</div>
              <div className="text-[11px] text-slate-500 mt-1">Satellite Ingest: INSAT-3DR</div>
            </div>
            <div className="p-3 bg-[#050914] border border-slate-800 rounded-xl">
              <div className="text-[10px] text-slate-400">HYDROLOGICAL GAUGES</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">2 Above Threshold</div>
              <div className="text-[11px] text-slate-500 mt-1">Mithi Basin & Brahmaputra</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">Station Telemetry Status:</div>
            {TELEMETRY_STATIONS.map((station) => (
              <div
                key={station.id}
                className="p-3 bg-[#050914] border border-slate-800 rounded-xl flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-white">{station.name}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                        station.status === 'ONLINE'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {station.status}
                    </span>
                  </div>
                  <div className="text-xs text-cyan-400 font-mono mb-1">{station.reading}</div>
                  <div className="text-[11px] text-slate-400">
                    Location: {station.city}, {station.state} ({station.latitude.toFixed(3)}°N, {station.longitude.toFixed(3)}°E)
                  </div>
                </div>

                <div className="text-right shrink-0 text-[11px] text-slate-500 font-mono">
                  <div>Ping: {station.latency_ms}ms</div>
                  <div>{station.last_ping}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
