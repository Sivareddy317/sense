import React from 'react';
import { ViewScale, CityScene, WeatherEvent } from '../../types/weather';
import { Globe, MapPin, Building2, AlertTriangle, Compass, RotateCcw, Map } from 'lucide-react';

interface ViewControlsProps {
  viewScale: ViewScale;
  activeCity: CityScene | null;
  selectedEvent: WeatherEvent | null;
  onChangeScale: (scale: ViewScale) => void;
  onResetCamera: () => void;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  viewScale,
  activeCity,
  selectedEvent,
  onChangeScale,
  onResetCamera,
}) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 bg-[#091122]/90 border border-slate-800 rounded-xl shadow-xl backdrop-blur-md">
      {/* Global View */}
      <button
        onClick={() => onChangeScale('global')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
          viewScale === 'global'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        }`}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>3D Earth</span>
      </button>

      {/* Dedicated India Weather Map (Google Maps) */}
      <button
        onClick={() => onChangeScale('india_map')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
          viewScale === 'india_map'
            ? 'bg-gradient-to-r from-orange-500/25 to-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        }`}
      >
        <Map className="w-3.5 h-3.5 text-amber-400" />
        <span>India Weather Map</span>
      </button>

      {/* India 3D Globe View */}
      <button
        onClick={() => onChangeScale('india')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
          viewScale === 'india'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        }`}
      >
        <MapPin className="w-3.5 h-3.5" />
        <span>India 3D Globe</span>
      </button>

      {/* City View (enabled if city selected) */}
      <button
        onClick={() => activeCity && onChangeScale('city')}
        disabled={!activeCity}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
          viewScale === 'city'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
            : !activeCity
            ? 'text-slate-600 cursor-not-allowed'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        }`}
      >
        <Building2 className="w-3.5 h-3.5" />
        <span>3D City {activeCity ? `(${activeCity.cityName})` : ''}</span>
      </button>

      {/* Event Zone View */}
      <button
        onClick={() => activeCity && onChangeScale('event')}
        disabled={!activeCity}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
          viewScale === 'event'
            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
            : !activeCity
            ? 'text-slate-600 cursor-not-allowed'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        }`}
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Event Zone</span>
      </button>

      <div className="w-[1px] h-4 bg-slate-700 mx-1" />

      {/* Reset Camera */}
      <button
        onClick={onResetCamera}
        title="Reset Camera Orientation"
        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
