import React, { useState } from 'react';
import {
  WeatherEvent,
  CityScene,
  Building3D,
  RoadSegment,
  TimeStep,
  ViewScale,
} from '../../types/weather';
import { WEATHER_TYPE_EMOJI_MAP, SEVERITY_COLOR_MAP } from '../../data/weatherEvents';
import { AiAnalysisResult } from '../../services/aiAnalysisService';
import {
  Sparkles,
  TrendingUp,
  MapPin,
  Building2,
  Navigation2,
  Droplets,
  Wind,
  Thermometer,
  Gauge,
  ShieldAlert,
  ChevronRight,
  ArrowLeft,
  Share2,
} from 'lucide-react';

interface CityInspectorPanelProps {
  city: CityScene;
  event: WeatherEvent;
  aiAnalysis: AiAnalysisResult | null;
  inspectedBuilding: Building3D | null;
  inspectedRoad: RoadSegment | null;
  timeStep: TimeStep;
  viewScale: ViewScale;
  onReturnToIndia: () => void;
  onReturnToGlobal: () => void;
  onCloseBuilding: () => void;
  onCloseRoad: () => void;
  isAiLoading: boolean;
}

export const CityInspectorPanel: React.FC<CityInspectorPanelProps> = ({
  city,
  event,
  aiAnalysis,
  inspectedBuilding,
  inspectedRoad,
  timeStep,
  viewScale,
  onReturnToIndia,
  onReturnToGlobal,
  onCloseBuilding,
  onCloseRoad,
  isAiLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'prediction' | 'infrastructure'>('ai');

  // Dynamic rainfall based on timeStep
  const displayRain =
    timeStep === 0
      ? event.rainfall
      : timeStep <= 6
      ? event.prediction.next_6h_rain
      : timeStep <= 12
      ? event.prediction.next_12h_rain
      : timeStep <= 24
      ? event.prediction.next_24h_rain
      : event.prediction.next_48h_rain;

  const sevConfig = SEVERITY_COLOR_MAP[event.severity];

  return (
    <aside className="absolute top-16 right-4 bottom-24 z-20 w-96 max-w-[calc(100vw-32px)] flex flex-col bg-[#091122]/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md text-slate-100 overflow-hidden">
      {/* Top Breadcrumb & Return controls */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-[#050914]/80">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onReturnToIndia}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to India</span>
          </button>
          <span className="text-slate-600">/</span>
          <button
            onClick={onReturnToGlobal}
            className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Global
          </button>
        </div>
        <span className="text-[11px] font-mono text-slate-400">{event.source.split('/')[0]}</span>
      </div>

      {/* City & Weather Event Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono tracking-wide">
              <MapPin className="w-3 h-3" />
              <span>
                {city.state.toUpperCase()} · {city.elevation_m}m MSL
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">{city.cityName}</h2>
          </div>
          <span className="text-3xl">{WEATHER_TYPE_EMOJI_MAP[event.event_type]}</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${sevConfig.bg} ${sevConfig.text}`}>
            {sevConfig.label}
          </span>
          <span className="text-xs text-slate-400">
            Started: {event.start_time} · Status: <span className="text-emerald-400 font-medium">{event.status}</span>
          </span>
        </div>

        {/* Real-time Telemetry Grid */}
        <div className="grid grid-cols-4 gap-2 bg-[#050914] p-2.5 rounded-xl border border-slate-800/80 text-center">
          <div>
            <div className="text-[10px] text-slate-400">PRECIP</div>
            <div className="text-sm font-bold font-mono text-cyan-400">{displayRain} mm</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">TEMP</div>
            <div className="text-sm font-bold font-mono text-slate-200">{event.temperature}°C</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">HUMIDITY</div>
            <div className="text-sm font-bold font-mono text-slate-200">{event.humidity}%</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">WIND</div>
            <div className="text-sm font-bold font-mono text-slate-200">{event.wind_speed} km/h</div>
          </div>
        </div>
      </div>

      {/* Tabs: AI Analysis, Prediction, Infrastructure Risk */}
      <div className="flex items-center border-b border-slate-800 bg-[#050914]/60 p-1">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeTab === 'ai' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Analysis</span>
        </button>
        <button
          onClick={() => setActiveTab('prediction')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeTab === 'prediction' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Predictions</span>
        </button>
        <button
          onClick={() => setActiveTab('infrastructure')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeTab === 'infrastructure'
              ? 'bg-cyan-500/20 text-cyan-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Urban Risk</span>
        </button>
      </div>

      {/* Content Area with smooth scroll */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Raycasted Building Inspector Overlay (if clicked) */}
        {inspectedBuilding && (
          <div className="p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-xl relative">
            <button
              onClick={onCloseBuilding}
              className="absolute top-2 right-2 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 mb-1.5">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-white">
                {inspectedBuilding.name || `Structure ID #${inspectedBuilding.id}`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 mb-2">
              <div>
                Height: <span className="font-mono text-cyan-300 font-semibold">{inspectedBuilding.height}m</span> (
                {inspectedBuilding.floors} fl)
              </div>
              <div>
                Type: <span className="text-white">{inspectedBuilding.occupancy_type}</span>
              </div>
              <div>
                Flood Risk:{' '}
                <span
                  className={`font-mono font-semibold ${
                    inspectedBuilding.flood_risk === 'extreme'
                      ? 'text-rose-400'
                      : inspectedBuilding.flood_risk === 'high'
                      ? 'text-orange-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {inspectedBuilding.flood_risk.toUpperCase()}
                </span>
              </div>
              <div>
                Shelter:{' '}
                <span className={inspectedBuilding.is_evacuation_shelter ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                  {inspectedBuilding.is_evacuation_shelter ? 'DESIGNATED' : 'STANDARD'}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400">
              Ground elevation: {inspectedBuilding.elevation_meters}m MSL. Click building on map to clear.
            </div>
          </div>
        )}

        {/* Raycasted Road Inspector Overlay (if clicked) */}
        {inspectedRoad && (
          <div className="p-3 bg-orange-950/40 border border-orange-500/40 rounded-xl relative">
            <button
              onClick={onCloseRoad}
              className="absolute top-2 right-2 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 mb-1.5">
              <Navigation2 className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-semibold text-white">{inspectedRoad.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 mb-2">
              <div>
                Status:{' '}
                <span
                  className={`font-mono font-semibold ${
                    inspectedRoad.status === 'SUBMERGED'
                      ? 'text-rose-400'
                      : inspectedRoad.status === 'RESTRICTED'
                      ? 'text-orange-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {inspectedRoad.status}
                </span>
              </div>
              <div>
                Water Depth: <span className="font-mono text-cyan-300 font-semibold">{inspectedRoad.predicted_water_depth_cm} cm</span>
              </div>
              <div>
                Lanes: <span className="text-white">{inspectedRoad.lanes} Lane Corridor</span>
              </div>
              <div>
                Precip:{' '}
                <span className="font-mono text-amber-300 font-semibold">{inspectedRoad.rainfall_mm} mm</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: AI ANALYSIS (WHAT IS HAPPENING NOW / WHAT WILL HAPPEN NEXT) */}
        {activeTab === 'ai' && aiAnalysis && (
          <div className="space-y-4">
            {/* Header Badge */}
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                {aiAnalysis.modelIdentifier}
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                Confidence: {Math.round(aiAnalysis.confidenceScore * 100)}%
              </span>
            </div>

            {/* WHAT IS HAPPENING? */}
            <div className="bg-[#050914]/80 p-3 rounded-xl border border-slate-800">
              <h4 className="text-xs font-semibold text-cyan-300 mb-1 tracking-wide uppercase">
                What is happening now?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{aiAnalysis.whatIsHappening}</p>
            </div>

            {/* WHY IT MATTERS */}
            <div className="bg-[#050914]/80 p-3 rounded-xl border border-slate-800">
              <h4 className="text-xs font-semibold text-amber-300 mb-1 tracking-wide uppercase">Why it matters</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{aiAnalysis.whyItMatters}</p>
            </div>

            {/* WHAT WILL HAPPEN NEXT? */}
            <div className="bg-[#050914]/80 p-3 rounded-xl border border-slate-800">
              <h4 className="text-xs font-semibold text-orange-300 mb-1 tracking-wide uppercase">
                What will happen next?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{aiAnalysis.whatCouldHappenNext}</p>
            </div>

            {/* DISASTER PROTOCOLS */}
            <div className="bg-rose-950/20 p-3 rounded-xl border border-rose-900/40">
              <div className="flex items-center gap-1.5 mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <h4 className="text-xs font-semibold text-rose-300 uppercase tracking-wide">
                  NDMA / SDRF Action Protocols
                </h4>
              </div>
              <ul className="space-y-1.5">
                {aiAnalysis.disasterProtocols.map((proto, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-rose-400 shrink-0 font-mono text-[10px]">0{idx + 1}.</span>
                    <span>{proto}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: TIME-SERIES PREDICTIONS */}
        {activeTab === 'prediction' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Forecast Engine: XGBoost + LSTM Ensemble</span>
              <span className="font-mono text-cyan-400 font-semibold">{Math.round(event.prediction.confidence * 100)}%</span>
            </div>

            {/* Rainfall Bar Chart */}
            <div className="bg-[#050914] p-3 rounded-xl border border-slate-800">
              <div className="text-xs font-semibold text-white mb-3">Precipitation Accumulation Projection</div>
              <div className="space-y-2">
                {[
                  { label: 'Current Observation', val: event.rainfall, color: 'bg-cyan-500' },
                  { label: '+6 Hours', val: event.prediction.next_6h_rain, color: 'bg-blue-500' },
                  { label: '+12 Hours', val: event.prediction.next_12h_rain, color: 'bg-indigo-500' },
                  { label: '+24 Hours', val: event.prediction.next_24h_rain, color: 'bg-amber-500' },
                  { label: '+48 Hours', val: event.prediction.next_48h_rain, color: 'bg-slate-500' },
                ].map((row, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">{row.label}</span>
                      <span className="font-mono font-semibold text-slate-200">{row.val} mm</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${row.color} transition-all duration-300`}
                        style={{ width: `${Math.min(100, (row.val / 140) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Indicators */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-[#050914] rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">FLOOD PROBABILITY</div>
                <div className="text-base font-bold font-mono text-rose-400 mt-0.5">
                  {event.prediction.flood_risk.toUpperCase()}
                </div>
              </div>
              <div className="p-3 bg-[#050914] rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">THUNDERSTORM PROB</div>
                <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
                  {event.prediction.thunderstorm_prob}%
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
              Peak storm intensity expected at <span className="text-white font-mono">{event.prediction.peak_time}</span>. Low-lying wards should complete preventive drainage clearout within 2 hours.
            </div>
          </div>
        )}

        {/* TAB 3: URBAN ROADS & INFRASTRUCTURE RISK */}
        {activeTab === 'infrastructure' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400">
              Monitored Arterial Road Segments ({city.roads.length} corridors):
            </div>
            <div className="space-y-2">
              {city.roads.map((road) => (
                <div
                  key={road.id}
                  className="p-2.5 bg-[#050914] border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-white truncate">{road.name}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        SEVERITY_COLOR_MAP[road.flood_risk].bg
                      } ${SEVERITY_COLOR_MAP[road.flood_risk].text}`}
                    >
                      {road.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Water: {road.predicted_water_depth_cm} cm</span>
                    <span>Precip: {road.rainfall_mm} mm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
