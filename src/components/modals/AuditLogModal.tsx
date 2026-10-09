import React from 'react';
import { FileText, ShieldCheck, AlertCircle, X, Download } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const logs = [
    {
      id: 'log-001',
      time: '15:42:10 IST',
      category: 'EARLY_WARNING_BROADCAST',
      severity: 'HIGH',
      message: 'Automated Common Alerting Protocol (CAP) SMS cell-broadcast dispatched to Rangareddy / Hyderabad urban polygon (7.5 km radius).',
      actor: 'HIKARI-DISPATCHER-DAEMON',
    },
    {
      id: 'log-002',
      time: '15:20:04 IST',
      category: 'ML_INFERENCE_PIPELINE',
      severity: 'INFO',
      message: 'XGBoost + Hydrologic routing model executed for Mumbai Suburban. Inundation probability updated to 94%.',
      actor: 'WEATHER-PREDICT-ENGINE-V3',
    },
    {
      id: 'log-003',
      time: '14:55:18 IST',
      category: 'RADAR_INGEST',
      severity: 'INFO',
      message: 'Doppler Weather Radar (DWR) Hyderabad raw volume scan ingested (14 sweeps, 250km range). Reflectivity core 54 dBZ detected.',
      actor: 'IMD-DWR-GATEWAY',
    },
    {
      id: 'log-004',
      time: '14:30:22 IST',
      category: 'SDRF_INTERVENTION',
      severity: 'WARNING',
      message: 'NDMA Level-2 advisory issued for Brahmaputra Basin (Guwahati). 2 NDRF water rescue teams placed on 15-minute standby.',
      actor: 'OPERATOR_DESK_ADMIN',
    },
    {
      id: 'log-005',
      time: '13:10:00 IST',
      category: 'SYSTEM_AUDIT',
      severity: 'INFO',
      message: 'Geospatial 3D Tile Cache synchronized for 8 primary municipal scenes. 3D building risk matrix validated.',
      actor: 'POSTGIS-CLUSTER-MANAGER',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050914]/80 backdrop-blur-md p-4">
      <div className="w-[720px] max-w-full max-h-[90vh] flex flex-col bg-[#091122] border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#050914]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950 rounded-lg border border-cyan-800 text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Disaster Operations & Compliance Audit Log</h3>
              <p className="text-xs text-slate-400">Immutable record of alert broadcasts, ML forecasts, and responder dispatches</p>
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
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-[#050914] border border-slate-800 rounded-xl space-y-1.5 font-mono text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-semibold">{log.category}</span>
                <span className="text-slate-500 text-[11px]">{log.time}</span>
              </div>
              <p className="text-slate-300 font-sans text-xs leading-relaxed">{log.message}</p>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-500">
                <span>ACTOR: {log.actor}</span>
                <span>STATUS: RECORDED</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
