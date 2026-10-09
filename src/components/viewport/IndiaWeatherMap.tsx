import React, { useState, useEffect, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  WeatherEvent,
  CityScene,
  SeverityLevel,
  WeatherEventType,
  WeatherLayer,
  TimeStep,
} from '../../types/weather';
import { WEATHER_TYPE_EMOJI_MAP, SEVERITY_COLOR_MAP } from '../../data/weatherEvents';
import { CITIES_DATA } from '../../data/cities';
import { TELEMETRY_STATIONS } from '../../data/telemetryStations';
import {
  MapPin,
  ExternalLink,
  Layers,
  Radio,
  Building2,
  AlertTriangle,
  Globe2,
  Shield,
  Search,
  Filter,
  Navigation,
  Droplets,
  Wind,
  Waves,
  Eye,
  EyeOff,
  Compass,
  PhoneCall,
  CheckCircle2,
  Crosshair,
} from 'lucide-react';

import { DisasterIncident } from '../../types/disaster';

interface IndiaWeatherMapProps {
  weatherEvents: WeatherEvent[];
  selectedEvent: WeatherEvent | null;
  onSelectEvent: (event: WeatherEvent) => void;
  onExploreCity: (city: CityScene) => void;
  onOpenGovPortals: () => void;
  weatherLayers: WeatherLayer[];
  timeStep: TimeStep;
  disasterIncidents?: DisasterIncident[];
  selectedDisasterIncident?: DisasterIncident | null;
  onSelectDisasterIncident?: (incident: DisasterIncident) => void;
}


// Controller component to smoothly pan/zoom Google Maps from React
const MapViewController: React.FC<{
  targetLocation: { lat: number; lng: number; zoom: number } | null;
}> = ({ targetLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !targetLocation) return;
    map.panTo({ lat: targetLocation.lat, lng: targetLocation.lng });
    map.setZoom(targetLocation.zoom);
  }, [map, targetLocation]);

  return null;
};

// Canvas Radar Range Rings & Danger Circles Overlay using Google Maps
const CustomMapOverlays: React.FC<{
  showRadarRings: boolean;
  showSachetDangerZones: boolean;
  weatherEvents: WeatherEvent[];
}> = ({ showRadarRings, showSachetDangerZones, weatherEvents }) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');

  useEffect(() => {
    if (!map || !mapsLib) return;

    const circles: any[] = [];

    // 1. SACHET Danger Risk Circles
    if (showSachetDangerZones) {
      weatherEvents.forEach((ev) => {
        const sevHex = SEVERITY_COLOR_MAP[ev.severity]?.hex || '#ef4444';
        const circle = new mapsLib.Circle({
          strokeColor: sevHex,
          strokeOpacity: 0.85,
          strokeWeight: 2,
          fillColor: sevHex,
          fillOpacity: ev.severity === 'extreme' ? 0.22 : 0.14,
          map,
          center: { lat: ev.latitude, lng: ev.longitude },
          radius: (ev.event_zone_radius_km || 10) * 1000,
          clickable: false,
        });
        circles.push(circle);
      });
    }

    // 2. IMD Doppler Weather Radar Range Envelopes (100km and 250km)
    if (showRadarRings) {
      const radarStations = TELEMETRY_STATIONS.filter((s) => s.type === 'DOPPLER_RADAR');
      radarStations.forEach((station) => {
        // Inner 100km high-res Doppler envelope
        const innerCircle = new mapsLib.Circle({
          strokeColor: '#38bdf8',
          strokeOpacity: 0.6,
          strokeWeight: 1,
          fillColor: '#0284c7',
          fillOpacity: 0.04,
          map,
          center: { lat: station.latitude, lng: station.longitude },
          radius: 100000,
          clickable: false,
        });
        // Outer 250km surveillance envelope
        const outerCircle = new mapsLib.Circle({
          strokeColor: '#0369a1',
          strokeOpacity: 0.35,
          strokeWeight: 1,
          fillColor: '#0369a1',
          fillOpacity: 0.02,
          map,
          center: { lat: station.latitude, lng: station.longitude },
          radius: 250000,
          clickable: false,
        });
        circles.push(innerCircle, outerCircle);
      });
    }

    return () => {
      circles.forEach((c) => c.setMap(null));
    };
  }, [map, mapsLib, showRadarRings, showSachetDangerZones, weatherEvents]);

  return null;
};

export const IndiaWeatherMap: React.FC<IndiaWeatherMapProps> = ({
  weatherEvents,
  selectedEvent,
  onSelectEvent,
  onExploreCity,
  onOpenGovPortals,
  weatherLayers,
  timeStep,
  disasterIncidents = [],
  selectedDisasterIncident,
  onSelectDisasterIncident,
}) => {
  const apiKey =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY) ||
    'AIzaSyA2Uxo2lMg-dXPqiTQ5mRyC3HXSBIcbaLE';

  // Map settings
  const [mapType, setMapType] = useState<'hybrid' | 'roadmap' | 'terrain' | 'satellite'>('hybrid');
  const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | 'all'>('all');
  const [filterType, setFilterType] = useState<WeatherEventType | 'all'>('all');

  // Layer Visibility Toggles
  const [showRadarRings, setShowRadarRings] = useState<boolean>(true);
  const [showSachetDangerZones, setShowSachetDangerZones] = useState<boolean>(true);
  const [showDWRStations, setShowDWRStations] = useState<boolean>(true);
  const [showCWCGauges, setShowCWCGauges] = useState<boolean>(true);

  // Active InfoWindow selection
  const [activeInfoWindowId, setActiveInfoWindowId] = useState<string | null>(null);
  const [activeStationInfo, setActiveStationInfo] = useState<(typeof TELEMETRY_STATIONS)[0] | null>(
    null
  );

  // Camera Target
  const [cameraTarget, setCameraTarget] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(null);

  // Quick State Navigation targets
  const REGIONAL_JUMPS = [
    { name: 'All India', lat: 21.7679, lng: 78.8718, zoom: 5 },
    { name: 'Telangana', lat: 17.8749, lng: 79.1126, zoom: 8 },
    { name: 'Maharashtra', lat: 19.7515, lng: 75.7139, zoom: 7 },
    { name: 'Tamil Nadu', lat: 11.1271, lng: 78.6569, zoom: 7 },
    { name: 'Delhi NCR', lat: 28.6139, lng: 77.209, zoom: 9 },
    { name: 'West Bengal', lat: 23.385, lng: 87.8286, zoom: 7 },
    { name: 'Assam & NE', lat: 26.2006, lng: 92.9376, zoom: 7 },
    { name: 'Kerala', lat: 10.8505, lng: 76.2711, zoom: 8 },
    { name: 'Andhra Coast', lat: 16.5417, lng: 80.7003, zoom: 7 },
    { name: 'Odisha Coast', lat: 20.9517, lng: 85.0985, zoom: 7 },
  ];

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return weatherEvents.filter((ev) => {
      const matchSev = filterSeverity === 'all' || ev.severity === filterSeverity;
      const matchType = filterType === 'all' || ev.event_type === filterType;
      return matchSev && matchType;
    });
  }, [weatherEvents, filterSeverity, filterType]);

  // Doppler Radar Stations
  const radarStations = useMemo(() => {
    return TELEMETRY_STATIONS.filter((s) => s.type === 'DOPPLER_RADAR');
  }, []);

  // CWC River Gauges
  const cwcGauges = useMemo(() => {
    return TELEMETRY_STATIONS.filter((s) => s.type === 'RIVER_GAUGE');
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col bg-[#050914] text-slate-100">
      {/* 1. TOP OFFICIAL GOVERNMENT PORTALS BANNER */}
      <div className="relative z-30 flex items-center justify-between px-4 py-2 bg-[#091122]/95 border-b border-slate-800 text-xs backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-white tracking-wide">
            <span className="text-base">🇮🇳</span>
            <span>INDIA WEATHER BIG DATA MAP</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              GOOGLE MAPS PLATFORM
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-800 text-[11px] text-slate-400">
            <span className="text-slate-500 font-mono">GOVT FEEDS:</span>
            <a
              href="https://sachet.ndma.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-orange-400 hover:text-orange-300 font-medium px-1.5 py-0.5 rounded bg-orange-950/40 border border-orange-800/60"
            >
              <span>NDMA SACHET (CAP)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://mausam.imd.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/60"
            >
              <span>IMD Mausam</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://radar.imd.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium px-1.5 py-0.5 rounded bg-sky-950/40 border border-sky-800/60"
            >
              <span>IMD Doppler Radar</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://rsmcnewdelhi.imd.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-medium px-1.5 py-0.5 rounded bg-rose-950/40 border border-rose-800/60"
            >
              <span>IMD RSMC Cyclone</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://ffwc.cwc.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium px-1.5 py-0.5 rounded bg-blue-950/40 border border-blue-800/60"
            >
              <span>CWC Flood</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Emergency Hotline Alert */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-rose-300 bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-900/50">
            <PhoneCall className="w-3 h-3 text-rose-400" />
            <span className="font-mono">NDMA: 1078 | IMD: 1800-180-1717</span>
          </div>

          {/* Government Hub Modal Opener */}
          <button
            onClick={onOpenGovPortals}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-500 hover:to-amber-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-orange-950 transition-all cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Govt Weather Portals Hub</span>
          </button>
        </div>
      </div>

      {/* 2. REGIONAL JUMP BAR (QUICK NAVIGATE STATES OF INDIA) */}
      <div className="relative z-20 flex items-center gap-1.5 px-4 py-1.5 bg-[#050914]/90 border-b border-slate-800/80 overflow-x-auto text-[11px] scrollbar-thin">
        <span className="text-slate-500 font-mono shrink-0 mr-1 flex items-center gap-1">
          <Compass className="w-3 h-3 text-cyan-400" /> QUICK FOCUS:
        </span>
        {REGIONAL_JUMPS.map((reg) => (
          <button
            key={reg.name}
            onClick={() => setCameraTarget({ lat: reg.lat, lng: reg.lng, zoom: reg.zoom })}
            className="px-2.5 py-0.5 rounded-full bg-slate-900/80 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 border border-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            {reg.name}
          </button>
        ))}
      </div>

      {/* 3. INTERACTIVE CONTROL TOOLBAR (FILTERS, MAP STYLES, LAYERS) */}
      <div className="absolute top-20 left-4 z-20 flex flex-wrap items-center gap-2 p-2 bg-[#091122]/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-md max-w-[95vw]">
        {/* Map Type Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setMapType('hybrid')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              mapType === 'hybrid'
                ? 'bg-cyan-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Google Hybrid
          </button>
          <button
            onClick={() => setMapType('terrain')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              mapType === 'terrain'
                ? 'bg-cyan-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Terrain
          </button>
          <button
            onClick={() => setMapType('roadmap')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              mapType === 'roadmap'
                ? 'bg-cyan-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Roadmap
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              mapType === 'satellite'
                ? 'bg-cyan-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
          <Filter className="w-3 h-3 text-slate-400 ml-1" />
          {(['all', 'extreme', 'high', 'moderate'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                filterSeverity === sev
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setShowSachetDangerZones(!showSachetDangerZones)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors cursor-pointer ${
              showSachetDangerZones
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle SACHET Disaster Risk Radius Circles"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>SACHET Zones</span>
          </button>

          <button
            onClick={() => setShowRadarRings(!showRadarRings)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors cursor-pointer ${
              showRadarRings
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle IMD Doppler Radar 100km & 250km Detection Envelopes"
          >
            <Radio className="w-3 h-3 text-sky-400" />
            <span>DWR Radar Rings</span>
          </button>

          <button
            onClick={() => setShowCWCGauges(!showCWCGauges)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors cursor-pointer ${
              showCWCGauges
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Central Water Commission River Basins & Gauges"
          >
            <Waves className="w-3 h-3 text-blue-400" />
            <span>CWC Basins</span>
          </button>
        </div>

        {/* Events Count Indicator */}
        <div className="px-2.5 py-1 bg-slate-800/80 rounded-lg text-xs font-mono text-cyan-300 border border-slate-700">
          {filteredEvents.length} Active Events
        </div>
      </div>

      {/* 4. MAIN GOOGLE MAP VIEWPORT */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <APIProvider apiKey={apiKey} libraries={['marker', 'places', 'geometry']}>
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={{ lat: 21.7679, lng: 78.8718 }}
            defaultZoom={5}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapTypeId={mapType}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            className="w-full h-full"
          >
            {/* Dynamic Camera Pan Controller */}
            <MapViewController targetLocation={cameraTarget} />

            {/* Custom Google Maps Overlays (Radar Rings & SACHET Inundation Zones) */}
            <CustomMapOverlays
              showRadarRings={showRadarRings}
              showSachetDangerZones={showSachetDangerZones}
              weatherEvents={filteredEvents}
            />

            {/* A. ADVANCED MARKERS FOR WEATHER EVENTS */}
            {filteredEvents.map((ev) => {
              const isSelected = selectedEvent?.event_id === ev.event_id;
              const sevHex = SEVERITY_COLOR_MAP[ev.severity]?.hex || '#ef4444';
              const emoji = WEATHER_TYPE_EMOJI_MAP[ev.event_type] || '🌧️';

              return (
                <AdvancedMarker
                  key={ev.event_id}
                  position={{ lat: ev.latitude, lng: ev.longitude }}
                  title={`${ev.city}: ${ev.title}`}
                  onClick={() => {
                    onSelectEvent(ev);
                    setActiveInfoWindowId(ev.event_id);
                    setActiveStationInfo(null);
                  }}
                >
                  {/* Custom High-Contrast Marker Pin */}
                  <div className="relative flex items-center justify-center cursor-pointer group">
                    {/* Pulsing ring for extreme/high severity */}
                    {(ev.severity === 'extreme' || ev.severity === 'high') && (
                      <span
                        className="absolute w-10 h-10 rounded-full animate-ping opacity-75"
                        style={{ backgroundColor: sevHex }}
                      />
                    )}

                    <div
                      className={`relative flex items-center gap-1 px-2 py-1 rounded-full shadow-2xl border-2 transition-transform duration-200 group-hover:scale-110 ${
                        isSelected ? 'scale-125 ring-4 ring-cyan-400' : ''
                      }`}
                      style={{
                        backgroundColor: '#091122',
                        borderColor: sevHex,
                      }}
                    >
                      <span className="text-base leading-none">{emoji}</span>
                      <span className="text-[11px] font-bold text-white leading-none whitespace-nowrap">
                        {ev.city}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: sevHex }}
                      />
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* B. ADVANCED MARKERS FOR IMD DOPPLER RADAR STATIONS */}
            {showDWRStations &&
              radarStations.map((station) => (
                <AdvancedMarker
                  key={station.id}
                  position={{ lat: station.latitude, lng: station.longitude }}
                  title={station.name}
                  onClick={() => {
                    setActiveStationInfo(station);
                    setActiveInfoWindowId(null);
                  }}
                >
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-sky-950/90 border border-sky-400 rounded-md shadow-lg text-[10px] text-sky-200 hover:scale-110 transition-transform cursor-pointer">
                    <Radio className="w-3 h-3 text-sky-400 shrink-0 animate-pulse" />
                    <span className="font-mono font-semibold">{station.city} DWR</span>
                  </div>
                </AdvancedMarker>
              ))}

            {/* C. ADVANCED MARKERS FOR CWC RIVER BASIN GAUGES */}
            {showCWCGauges &&
              cwcGauges.map((gauge) => (
                <AdvancedMarker
                  key={gauge.id}
                  position={{ lat: gauge.latitude, lng: gauge.longitude }}
                  title={gauge.name}
                  onClick={() => {
                    setActiveStationInfo(gauge);
                    setActiveInfoWindowId(null);
                  }}
                >
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-950/90 border border-blue-400 rounded-md shadow-lg text-[10px] text-blue-200 hover:scale-110 transition-transform cursor-pointer">
                    <Waves className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="font-mono font-semibold">{gauge.city} Basin</span>
                  </div>
                </AdvancedMarker>
              ))}

            {/* C2. ADVANCED MARKERS FOR DISASTER-AI LIVE INCIDENTS */}
            {disasterIncidents
              .filter((inc) => inc.resolved_lat && inc.resolved_lng)
              .slice(0, 10)
              .map((inc) => {
                const isSelected = selectedDisasterIncident?.id === inc.id;
                const isCritical = inc.urgency === 'CRITICAL';
                const isHigh = inc.urgency === 'HIGH';
                const typeIcon =
                  inc.emergency_type === 'FLOOD_RESCUE'
                    ? '🌧️'
                    : inc.emergency_type === 'FIRE'
                    ? '🔥'
                    : inc.emergency_type === 'MEDICAL_RESCUE'
                    ? '🚑'
                    : '🛟';

                return (
                  <AdvancedMarker
                    key={`disaster_inc_${inc.id}`}
                    position={{ lat: inc.resolved_lat!, lng: inc.resolved_lng! }}
                    title={`Incident #${inc.id}: ${inc.title}`}
                    onClick={() => {
                      if (onSelectDisasterIncident) {
                        onSelectDisasterIncident(inc);
                      }
                    }}
                  >
                    <div className="relative flex items-center justify-center cursor-pointer group">
                      {(isCritical || isHigh) && (
                        <span
                          className={`absolute w-12 h-12 rounded-full animate-ping opacity-75 ${
                            isCritical ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                        />
                      )}

                      <div
                        className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-2xl border-2 transition-transform duration-200 group-hover:scale-110 ${
                          isSelected ? 'scale-125 ring-4 ring-rose-400 bg-rose-950' : 'bg-[#091122]'
                        } ${
                          isCritical
                            ? 'border-rose-500 text-rose-200'
                            : isHigh
                            ? 'border-amber-500 text-amber-200'
                            : 'border-cyan-500 text-cyan-200'
                        }`}
                      >
                        <span className="text-base leading-none">{typeIcon}</span>
                        <div className="flex flex-col text-left">
                          <div className="text-[10px] font-bold font-mono text-white leading-none whitespace-nowrap">
                            #{inc.id} {inc.location_text || inc.emergency_type}
                          </div>
                          <div className="flex items-center gap-1 text-[9px] font-mono leading-tight">
                            <span className={isCritical ? 'text-rose-400 font-bold' : 'text-amber-400'}>
                              [{inc.urgency}]
                            </span>
                            <span className="text-slate-400">
                              {inc.location_status === 'confirmed' ? 'GPS' : 'APPROX'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}


            {/* D. INFO WINDOW FOR SELECTED WEATHER EVENT */}
            {activeInfoWindowId && (
              (() => {
                const ev = weatherEvents.find((e) => e.event_id === activeInfoWindowId);
                if (!ev) return null;
                const sevHex = SEVERITY_COLOR_MAP[ev.severity]?.hex || '#ef4444';
                const emoji = WEATHER_TYPE_EMOJI_MAP[ev.event_type] || '🌧️';

                return (
                  <InfoWindow
                    position={{ lat: ev.latitude, lng: ev.longitude }}
                    onCloseClick={() => setActiveInfoWindowId(null)}
                  >
                    <div className="p-1 max-w-[290px] text-slate-900 font-sans">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">{emoji}</span>
                          <span className="font-bold text-sm text-slate-900">{ev.city}</span>
                        </div>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded text-white font-mono"
                          style={{ backgroundColor: sevHex }}
                        >
                          {ev.severity.toUpperCase()} ALERT
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold text-slate-700 mb-1">
                        {ev.district}, {ev.state}
                      </div>

                      <div className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                        {ev.alert_headline}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-100 rounded-lg text-[11px] mb-2 font-mono">
                        <div>
                          <span className="text-slate-500 block text-[9px]">RAINFALL</span>
                          <span className="font-bold text-cyan-700">{ev.rainfall} mm</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">WIND SPEED</span>
                          <span className="font-bold text-slate-800">{ev.wind_speed} km/h</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">TEMPERATURE</span>
                          <span className="font-bold text-slate-800">{ev.temperature}°C</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">HUMIDITY</span>
                          <span className="font-bold text-slate-800">{ev.humidity}%</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 mb-2.5">
                        <strong>Source:</strong> {ev.source}
                      </div>

                      <div className="space-y-1.5">
                        <button
                          onClick={() => {
                            const cityScene = CITIES_DATA[ev.city];
                            if (cityScene) {
                              onExploreCity(cityScene);
                            }
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold shadow transition-colors cursor-pointer"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>EXPLORE 3D CITY ENVIRONMENT →</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <a
                            href="https://sachet.ndma.gov.in"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1 py-1 px-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-[10px] font-semibold transition-colors"
                          >
                            <span>SACHET Alert</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                          <a
                            href="https://mausam.imd.gov.in"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1 py-1 px-2 bg-sky-600 hover:bg-sky-700 text-white rounded text-[10px] font-semibold transition-colors"
                          >
                            <span>IMD Radar</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </InfoWindow>
                );
              })()
            )}

            {/* E. INFO WINDOW FOR RADAR/SENSOR STATION */}
            {activeStationInfo && (
              <InfoWindow
                position={{
                  lat: activeStationInfo.latitude,
                  lng: activeStationInfo.longitude,
                }}
                onCloseClick={() => setActiveStationInfo(null)}
              >
                <div className="p-1 max-w-[280px] text-slate-900 font-sans">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-sky-800">
                      {activeStationInfo.type === 'DOPPLER_RADAR'
                        ? '📡 IMD Doppler Weather Radar'
                        : '🌊 CWC River Basin Gauge'}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {activeStationInfo.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mb-0.5">
                    {activeStationInfo.name}
                  </h4>
                  <div className="text-[11px] text-slate-600 mb-2">
                    {activeStationInfo.city}, {activeStationInfo.state}
                  </div>
                  <div className="p-2 bg-slate-100 rounded-lg text-xs font-mono mb-2 text-slate-800">
                    <span className="text-[9px] text-slate-500 block mb-0.5">LIVE TELEMETRY READING:</span>
                    {activeStationInfo.reading}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Latency: {activeStationInfo.latency_ms} ms</span>
                    <span>Last Ping: {activeStationInfo.last_ping}</span>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* 5. FLOATING SELECTED EVENT BOTTOM RIGHT CARD */}
        {selectedEvent && (
          <div className="absolute bottom-6 right-6 z-20 w-84 bg-[#091122]/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-slate-100">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{WEATHER_TYPE_EMOJI_MAP[selectedEvent.event_type]}</span>
                <div>
                  <h4 className="font-bold text-sm text-white">{selectedEvent.city}</h4>
                  <p className="text-xs text-slate-400">
                    {selectedEvent.district}, {selectedEvent.state}
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                  SEVERITY_COLOR_MAP[selectedEvent.severity].bg
                } ${SEVERITY_COLOR_MAP[selectedEvent.severity].text}`}
              >
                {selectedEvent.severity.toUpperCase()} ALERT
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed line-clamp-2">
              {selectedEvent.alert_headline}
            </p>

            <div className="grid grid-cols-2 gap-2 p-2 bg-[#050914] rounded-lg border border-slate-800 text-xs mb-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">RAINFALL</span>
                <span className="font-mono font-bold text-cyan-400">
                  {selectedEvent.rainfall} mm
                </span>
                <span className="text-[10px] text-slate-500 block font-mono">
                  +6h: {selectedEvent.prediction.next_6h_rain} mm
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">WIND SPEED</span>
                <span className="font-mono font-bold text-slate-200">
                  {selectedEvent.wind_speed} km/h
                </span>
                <span className="text-[10px] text-slate-500 block font-mono">
                  Storm Risk: {selectedEvent.prediction.thunderstorm_prob}%
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  const cityScene = CITIES_DATA[selectedEvent.city];
                  if (cityScene) {
                    onExploreCity(cityScene);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-950 transition-colors cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>EXPLORE 3D CITY ENVIRONMENT</span>
                <span aria-hidden="true">→</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href="https://sachet.ndma.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-orange-600/90 hover:bg-orange-600 text-white rounded-lg text-[11px] font-semibold transition-colors"
                >
                  <Shield className="w-3 h-3" />
                  <span>SACHET NDMA</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <a
                  href="https://mausam.imd.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-sky-600/90 hover:bg-sky-600 text-white rounded-lg text-[11px] font-semibold transition-colors"
                >
                  <Radio className="w-3 h-3" />
                  <span>IMD Mausam</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 6. BOTTOM LEFT EXTERNAL DIRECT GOOGLE MAPS LINK */}
        <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2">
          <a
            href="https://www.google.com/maps/@20.5937,78.9629,5z/data=!5m1!1e1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#091122]/95 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 shadow-xl backdrop-blur-md transition-colors"
          >
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open in Google Maps Live</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
