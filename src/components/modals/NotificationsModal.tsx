import React from 'react';
import { WeatherEvent } from '../../types/weather';
import { SEVERITY_COLOR_MAP, WEATHER_TYPE_EMOJI_MAP } from '../../data/weatherEvents';
import { Bell, AlertTriangle, X, Radio } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: WeatherEvent[];
  onSelectEvent: (event: WeatherEvent) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  events,
  onSelectEvent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050914]/80 backdrop-blur-md p-4">
      <div className="w-[600px] max-w-full max-h-[85vh] flex flex-col bg-[#091122] border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#050914]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-950 rounded-lg border border-rose-800 text-rose-400">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">National Early Warning Broadcasts</h3>
              <p className="text-xs text-slate-400">Common Alerting Protocol (CAP) live advisories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {events.map((ev) => {
            const sev = SEVERITY_COLOR_MAP[ev.severity];
            return (
              <div
                key={ev.event_id}
                onClick={() => {
                  onSelectEvent(ev);
                  onClose();
                }}
                className="p-3 bg-[#050914] border border-slate-800 rounded-xl hover:border-cyan-500/50 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <span>{WEATHER_TYPE_EMOJI_MAP[ev.event_type]}</span>
                    <span>{ev.city} Alert</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${sev.bg} ${sev.text}`}>
                      {sev.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{ev.start_time}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{ev.alert_headline}</p>
                <div className="text-[10px] text-slate-500 font-mono">
                  Source: {ev.source} · Confidence: {Math.round(ev.confidence * 100)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
