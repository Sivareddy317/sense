import React from 'react';
import { WeatherLayer, CityLayer, ViewScale } from '../../types/weather';
import { Layers, Droplets, Thermometer, Wind, CloudLightning, Tornado, Waves, BellRing, Radar, Globe, Cloud } from 'lucide-react';

interface WeatherLayerPanelProps {
  viewScale: ViewScale;
  weatherLayers: WeatherLayer[];
  onToggleWeatherLayer: (layer: WeatherLayer) => void;
  cityLayers: CityLayer[];
  onToggleCityLayer: (layer: CityLayer) => void;
}

export const WeatherLayerPanel: React.FC<WeatherLayerPanelProps> = ({
  viewScale,
  weatherLayers,
  onToggleWeatherLayer,
  cityLayers,
  onToggleCityLayer,
}) => {
  const isCityMode = viewScale === 'city' || viewScale === 'event';

  const globeLayers: { id: WeatherLayer; label: string; icon: any }[] = [
    { id: 'world_borders', label: 'World Map & Borders', icon: Globe },
    { id: 'clouds', label: 'Atmospheric Cloud Layer', icon: Cloud },
    { id: 'rainfall', label: 'Rainfall Intensity', icon: Droplets },
    { id: 'temperature', label: 'Surface Temperature', icon: Thermometer },
    { id: 'wind', label: 'Wind Vector Field', icon: Wind },
    { id: 'thunderstorm', label: 'Thunderstorm Cells', icon: CloudLightning },
    { id: 'cyclone', label: 'Cyclonic Circulation', icon: Tornado },
    { id: 'flood', label: 'Flood Risk Basin', icon: Waves },
    { id: 'alerts', label: 'Active Alerts', icon: BellRing },
    { id: 'radar', label: 'Doppler Radar Scan', icon: Radar },
  ];

  const city3DLayers: { id: CityLayer; label: string }[] = [
    { id: 'buildings', label: '3D Buildings & Landmarks' },
    { id: 'roads', label: 'Road Network & Drainage' },
    { id: 'traffic', label: 'Dynamic Simulated Traffic' },
    { id: 'weather', label: 'Rain / Cloud Particles' },
    { id: 'event_zone', label: 'Translucent Event Dome' },
    { id: 'flood_simulation', label: 'Dynamic Water Inundation' },
    { id: 'radar', label: 'Terminal Radar Cone' },
  ];

  return (
    <div className="absolute top-16 left-4 z-20 w-64 bg-[#091122]/90 border border-slate-800 rounded-xl p-3 shadow-2xl backdrop-blur-md text-slate-200">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
        <Layers className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-xs font-semibold tracking-wider uppercase text-white">
          {isCityMode ? '3D City Layers' : 'Geographic Weather Layers'}
        </span>
      </div>

      {!isCityMode ? (
        <div className="space-y-1">
          {globeLayers.map((layer) => {
            const Icon = layer.icon;
            const isChecked = weatherLayers.includes(layer.id);
            return (
              <label
                key={layer.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-800/60 cursor-pointer select-none transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleWeatherLayer(layer.id)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-900"
                />
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <span className={isChecked ? 'text-cyan-300 font-medium' : 'text-slate-400'}>
                  {layer.label}
                </span>
              </label>
            );
          })}
        </div>
      ) : (
        <div className="space-y-1">
          {city3DLayers.map((layer) => {
            const isChecked = cityLayers.includes(layer.id);
            return (
              <label
                key={layer.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-slate-800/60 cursor-pointer select-none transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleCityLayer(layer.id)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-900"
                />
                <span className={isChecked ? 'text-cyan-300 font-medium' : 'text-slate-400'}>
                  {layer.label}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};
