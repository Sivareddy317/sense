import React, { useState } from 'react';
import { WeatherEvent, CityScene, SeverityLevel } from '../../types/weather';
import { WEATHER_TYPE_EMOJI_MAP, SEVERITY_COLOR_MAP } from '../../data/weatherEvents';
import { CITIES_DATA } from '../../data/cities';
import { CloudLightning, MapPin, ArrowRight, Filter, X } from 'lucide-react';

interface EventsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: WeatherEvent[];
  onFlyToEventCity: (city: CityScene, event: WeatherEvent) => void;
}

export const EventsListModal: React.FC<EventsListModalProps> = ({
  isOpen,
  onClose,
  events,
  onFlyToEventCity,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | 'all'>('all');

  if (!isOpen) return null;

  const filteredEvents =
    filterSeverity === 'all' ? events : events.filter((e) => e.severity === filterSeverity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050914]/80 backdrop-blur-md p-4">
      <div className="w-[840px] max-w-full max-h-[90vh] flex flex-col bg-[#091122] border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#050914]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950 rounded-lg border border-cyan-800 text-cyan-400">
              <CloudLightning className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Active National Weather Events Registry</h3>
              <p className="text-xs text-slate-400">Real-time geolocated meteorological triggers across India</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-[#050914]/40 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Filter Severity:</span>
          {(['all', 'extreme', 'high', 'moderate', 'low'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded-md text-xs capitalize transition-colors cursor-pointer ${
                filterSeverity === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Events Table */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
          {filteredEvents.map((ev) => {
            const cityScene = CITIES_DATA[ev.city];
            const sevConfig = SEVERITY_COLOR_MAP[ev.severity];

            return (
              <div
                key={ev.event_id}
                className="p-3 bg-[#050914] border border-slate-800 rounded-xl flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{WEATHER_TYPE_EMOJI_MAP[ev.event_type]}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{ev.city}</span>
                      <span className="text-xs text-slate-400">({ev.state})</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${sevConfig.bg} ${sevConfig.text}`}
                      >
                        {sevConfig.label}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 line-clamp-1">{ev.title}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Rainfall: {ev.rainfall} mm · Wind: {ev.wind_speed} km/h · Area: {ev.affected_area} km²
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      if (cityScene) {
                        onFlyToEventCity(cityScene, ev);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1.5 py-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-950 transition-colors cursor-pointer"
                  >
                    <span>FLY TO 3D CITY</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
