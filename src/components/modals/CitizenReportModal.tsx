import React, { useState } from 'react';
import { CitizenReport, SeverityLevel } from '../../types/weather';
import { INITIAL_CITIZEN_REPORTS } from '../../data/telemetryStations';
import { Users, AlertTriangle, Send, ThumbsUp, MapPin, X } from 'lucide-react';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCityName: string;
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  isOpen,
  onClose,
  activeCityName,
}) => {
  const [reports, setReports] = useState<CitizenReport[]>(INITIAL_CITIZEN_REPORTS);
  const [reporterName, setReporterName] = useState('');
  const [district, setDistrict] = useState('');
  const [category, setCategory] = useState<CitizenReport['category']>('waterlogging');
  const [severity, setSeverity] = useState<SeverityLevel>('high');
  const [description, setDescription] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newReport: CitizenReport = {
      id: `rep-${Date.now()}`,
      reporter_name: reporterName.trim() || 'Anonymous Citizen',
      city: activeCityName,
      district: district.trim() || `${activeCityName} Urban Sector`,
      location_lat: 17.385,
      location_lon: 78.4867,
      category,
      severity,
      description,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      status: 'PENDING_VERIFICATION',
      upvotes: 1,
    };

    setReports([newReport, ...reports]);
    setDescription('');
    setSubmittedMessage(true);
    setTimeout(() => setSubmittedMessage(false), 3500);
  };

  const handleUpvote = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050914]/80 backdrop-blur-md p-4">
      <div className="w-[680px] max-w-full max-h-[90vh] flex flex-col bg-[#091122] border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#050914]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950 rounded-lg border border-cyan-800 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Citizen Disaster Reporting & Ground Truth</h3>
              <p className="text-xs text-slate-400">Crowdsourced ground hazard verification network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-5">
          {submittedMessage && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs">
              ✓ Ground hazard report registered and routed to municipal emergency dispatch queue.
            </div>
          )}

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="p-3.5 bg-[#050914] border border-slate-800 rounded-xl space-y-3">
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">
              Submit Local Hazard Observation ({activeCityName})
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vikram S."
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#091122] border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">District / Locality</label>
                <input
                  type="text"
                  placeholder="e.g. Madhapur Ward 12"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#091122] border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Hazard Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-[#091122] border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="waterlogging">Waterlogging / Submerged Road</option>
                  <option value="fallen_tree">Fallen Tree / Blocked Transit</option>
                  <option value="power_outage">Substation Power Outage</option>
                  <option value="rescue_needed">Stranded Persons / Rescue Needed</option>
                  <option value="landslide">Landslide / Mudflow</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Estimated Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-[#091122] border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="moderate">Moderate (Ponding water)</option>
                  <option value="high">High (Vehicles stranded)</option>
                  <option value="extreme">Extreme (Immediate evacuation)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Detailed Observation</label>
              <textarea
                rows={2}
                placeholder="Describe water depth, landmarks, and road conditions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#091122] border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-950 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Field Observation</span>
            </button>
          </form>

          {/* Active Citizen Reports Feed */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-300">Live Field Verified Reports ({reports.length}):</div>
            <div className="space-y-2">
              {reports.map((rep) => (
                <div key={rep.id} className="p-3 bg-[#050914] border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-white">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{rep.district}, {rep.city}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{rep.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{rep.description}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">By {rep.reporter_name}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-emerald-400 font-mono">{rep.status}</span>
                    </div>
                    <button
                      onClick={() => handleUpvote(rep.id)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3 h-3 text-cyan-400" />
                      <span>{rep.upvotes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
