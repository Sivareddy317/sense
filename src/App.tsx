import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  WeatherEvent,
  CityScene,
  Building3D,
  RoadSegment,
  ViewScale,
  WeatherLayer,
  CityLayer,
  TimeStep,
  UserRole,
} from './types/weather';
import {
  DisasterIncident,
  DisasterDashboardMetrics,
  DisasterBackendStatus,
} from './types/disaster';
import { WEATHER_EVENTS } from './data/weatherEvents';
import { CITIES_DATA } from './data/cities';
import { generateDisasterAnalysis, AiAnalysisResult } from './services/aiAnalysisService';
import {
  fetchDisasterBackendHealth,
  fetchDisasterDashboardMetrics,
  fetchDisasterIncidents,
  fetchDisasterIncidentDetail,
} from './services/disasterService';

import { ThreeGlobeCity } from './components/viewport/ThreeGlobeCity';
import { IndiaWeatherMap } from './components/viewport/IndiaWeatherMap';
import { ViewControls } from './components/viewport/ViewControls';
import { CityLoadingOverlay } from './components/viewport/CityLoadingOverlay';
import { TopBar } from './components/panels/TopBar';
import { DisasterStatsHeader } from './components/panels/DisasterStatsHeader';
import { LeftNavigation, NavTab } from './components/panels/LeftNavigation';
import { WeatherLayerPanel } from './components/panels/WeatherLayerPanel';
import { CityInspectorPanel } from './components/panels/CityInspectorPanel';
import { DisasterIncidentPanel } from './components/panels/DisasterIncidentPanel';
import { TimeMachine } from './components/timeline/TimeMachine';

import { CitizenReportModal } from './components/modals/CitizenReportModal';
import { SensorNetworkModal } from './components/modals/SensorNetworkModal';
import { AuditLogModal } from './components/modals/AuditLogModal';
import { EventsListModal } from './components/modals/EventsListModal';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { GovPortalsModal } from './components/modals/GovPortalsModal';
import { DisasterIncidentsModal } from './components/modals/DisasterIncidentsModal';

export default function App() {
  // Core Platform State
  const [weatherEvents, setWeatherEvents] = useState<WeatherEvent[]>(WEATHER_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<WeatherEvent | null>(WEATHER_EVENTS[0]);
  const [activeCity, setActiveCity] = useState<CityScene | null>(CITIES_DATA['Hyderabad']);
  const [viewScale, setViewScale] = useState<ViewScale>('india_map');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false); // Default live API mode
  const [currentRole, setCurrentRole] = useState<UserRole>('OPERATOR');

  // DisasterAI Deployed Backend Integration State
  const [disasterIncidents, setDisasterIncidents] = useState<DisasterIncident[]>([]);
  const [selectedDisasterIncident, setSelectedDisasterIncident] = useState<DisasterIncident | null>(null);
  const [disasterMetrics, setDisasterMetrics] = useState<DisasterDashboardMetrics | null>(null);
  const [backendStatus, setBackendStatus] = useState<DisasterBackendStatus>({
    isOnline: false,
    lastChecked: '',
    url: 'https://disaster-ai-production.up.railway.app',
  });
  const [isDisasterLoading, setIsDisasterLoading] = useState<boolean>(false);
  const [isLoadingIncidentDetail, setIsLoadingIncidentDetail] = useState<boolean>(false);
  const [isDisasterModalOpen, setIsDisasterModalOpen] = useState<boolean>(false);

  // Active Layers
  const [weatherLayers, setWeatherLayers] = useState<WeatherLayer[]>([
    'world_borders',
    'clouds',
    'rainfall',
    'flood',
    'alerts',
    'radar',
  ]);
  const [cityLayers, setCityLayers] = useState<CityLayer[]>([
    'buildings',
    'roads',
    'traffic',
    'weather',
    'event_zone',
    'flood_simulation',
  ]);

  // Timeline State
  const [timeStep, setTimeStep] = useState<TimeStep>(0);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);

  // Inspector State
  const [inspectedBuilding, setInspectedBuilding] = useState<Building3D | null>(null);
  const [inspectedRoad, setInspectedRoad] = useState<RoadSegment | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Navigation & Modals
  const [activeNavTab, setActiveNavTab] = useState<NavTab>('india_map');
  const [isNavCollapsed, setIsNavCollapsed] = useState<boolean>(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState<boolean>(false);
  const [isSensorsModalOpen, setIsSensorsModalOpen] = useState<boolean>(false);
  const [isCitizenModalOpen, setIsCitizenModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isGovPortalsOpen, setIsGovPortalsOpen] = useState<boolean>(false);

  // Cinematic City Transition State
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [pendingTransitionCity, setPendingTransitionCity] = useState<CityScene | null>(null);

  // Sync Live DisasterAI Backend Feed
  const syncDisasterData = useCallback(async () => {
    setIsDisasterLoading(true);
    try {
      const health = await fetchDisasterBackendHealth();
      setBackendStatus(health);

      const metrics = await fetchDisasterDashboardMetrics();
      if (metrics) {
        setDisasterMetrics(metrics);
      }

      const { incidents } = await fetchDisasterIncidents(100);
      if (incidents && incidents.length > 0) {
        setDisasterIncidents(incidents);
        // Default select top critical incident if none selected
        if (!selectedDisasterIncident) {
          const topInc = incidents.find((i) => i.urgency === 'CRITICAL') || incidents[0];
          setSelectedDisasterIncident(topInc);
        }
      }
    } catch (err) {
      console.warn('[DisasterAI Sync Error]:', err);
    } finally {
      setIsDisasterLoading(false);
    }
  }, [selectedDisasterIncident]);

  useEffect(() => {
    syncDisasterData();
    const interval = setInterval(syncDisasterData, 30000); // 30s live poll
    return () => clearInterval(interval);
  }, [syncDisasterData]);

  // When selected DisasterAI incident changes, fetch full reports & resources
  useEffect(() => {
    if (!selectedDisasterIncident?.id) return;
    let isMounted = true;
    setIsLoadingIncidentDetail(true);

    fetchDisasterIncidentDetail(selectedDisasterIncident.id).then((detailed) => {
      if (isMounted && detailed) {
        setSelectedDisasterIncident(detailed);
        setIsLoadingIncidentDetail(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedDisasterIncident?.id]);

  // Compute stats from returned records
  const calculatedStats = useMemo(() => {
    let affected = 0;
    let critical = 0;
    let high = 0;
    let rescueProgress = 0;
    let resolved = 0;

    disasterIncidents.forEach((inc) => {
      affected += inc.people_affected || 0;
      if (inc.urgency === 'CRITICAL') critical++;
      if (inc.urgency === 'HIGH') high++;
      if (inc.status === 'RESCUE_IN_PROGRESS') rescueProgress++;
      if (inc.status === 'RESOLVED') resolved++;
    });

    return { affected, critical, high, rescueProgress, resolved };
  }, [disasterIncidents]);

  // Fetch AI Meteorological Analysis when city, event, or timeStep changes
  const loadAiAnalysis = useCallback(async () => {
    if (!selectedEvent || !activeCity) return;
    setIsAiLoading(true);
    try {
      const result = await generateDisasterAnalysis(selectedEvent, activeCity, timeStep);
      setAiAnalysis(result);
    } catch {
      // Heuristic fallback already embedded in service
    } finally {
      setIsAiLoading(false);
    }
  }, [selectedEvent, activeCity, timeStep]);

  useEffect(() => {
    loadAiAnalysis();
  }, [loadAiAnalysis]);

  // Handle User Event Selection
  const handleSelectEvent = (event: WeatherEvent) => {
    setSelectedEvent(event);
    const city = CITIES_DATA[event.city];
    if (city) {
      setActiveCity(city);
    }
  };

  // Select Disaster Incident
  const handleSelectDisasterIncident = (incident: DisasterIncident) => {
    setSelectedDisasterIncident(incident);
  };

  // Fly-to-City Initiation Flow
  const handleExploreCity = (city: CityScene) => {
    const ev = weatherEvents.find((e) => e.city === city.cityName) || weatherEvents[0];
    setSelectedEvent(ev);
    setActiveCity(city);
    setPendingTransitionCity(city);
    setIsTransitioning(true);
  };

  // Complete Fly-to-City Transition
  const handleCompleteTransition = () => {
    setIsTransitioning(false);
    setViewScale('city');
    setPendingTransitionCity(null);
  };

  const handleReturnToIndia = () => {
    setViewScale('india');
    setInspectedBuilding(null);
    setInspectedRoad(null);
  };

  const handleReturnToGlobal = () => {
    setViewScale('global');
    setInspectedBuilding(null);
    setInspectedRoad(null);
  };

  const handleResetCamera = () => {
    const current = viewScale;
    setViewScale('global');
    setTimeout(() => setViewScale(current), 50);
  };

  // Handle Navigation Sidebar Tabs
  const handleSelectNavTab = (tab: NavTab) => {
    setActiveNavTab(tab);
    if (tab === 'globe') {
      setViewScale('global');
    } else if (tab === 'india_map') {
      setViewScale('india_map');
    } else if (tab === 'gov_portals') {
      setIsGovPortalsOpen(true);
    } else if (tab === 'events') {
      setIsDisasterModalOpen(true);
    } else if (tab === 'predictions') {
      setViewScale('city');
    } else if (tab === 'disaster_risk') {
      setIsDisasterModalOpen(true);
    } else if (tab === 'alerts') {
      setIsNotificationsOpen(true);
    } else if (tab === 'sensors') {
      setIsSensorsModalOpen(true);
    } else if (tab === 'ai_insights') {
      setViewScale('city');
    } else if (tab === 'citizen_reports') {
      setIsCitizenModalOpen(true);
    } else if (tab === 'audit_log') {
      setIsAuditModalOpen(true);
    }
  };

  const handleToggleWeatherLayer = (layer: WeatherLayer) => {
    setWeatherLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
    );
  };

  const handleToggleCityLayer = (layer: CityLayer) => {
    setCityLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
    );
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-[#050914] text-slate-100 font-sans">
      {/* 1. TOP COMMAND BAR */}
      <TopBar
        currentRole={currentRole}
        onChangeRole={setCurrentRole}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
        onSearchSelectCity={handleExploreCity}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        weatherEvents={weatherEvents}
        selectedCity={activeCity}
      />

      {/* 1B. DISASTER-AI LIVE INCIDENT METRICS HEADER BAR */}
      <DisasterStatsHeader
        metrics={disasterMetrics}
        backendStatus={backendStatus}
        onRefresh={syncDisasterData}
        isRefreshing={isDisasterLoading}
        totalPeopleAffectedFromIncidents={calculatedStats.affected}
        activeIncidentsCount={disasterIncidents.length}
        criticalCount={calculatedStats.critical}
        highCount={calculatedStats.high}
        rescueInProgressCount={calculatedStats.rescueProgress}
        resolvedCount={calculatedStats.resolved}
      />

      {/* 2. MAIN WORKSPACE: LEFT NAV + CENTER VIEWPORT + RIGHT INSPECTOR */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <LeftNavigation
          activeTab={activeNavTab}
          onSelectTab={handleSelectNavTab}
          isCollapsed={isNavCollapsed}
          onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
          unreadAlertCount={disasterIncidents.filter((i) => i.urgency === 'CRITICAL').length}
        />

        {/* Center 3D Geospatial Viewport Container */}
        <main className="relative flex-1 h-full overflow-hidden">
          {/* Main View: Dedicated Google Maps India Weather & Disaster Map OR Three.js 3D Globe & City */}
          {viewScale === 'india_map' ? (
            <IndiaWeatherMap
              weatherEvents={weatherEvents}
              selectedEvent={selectedEvent}
              onSelectEvent={handleSelectEvent}
              onExploreCity={handleExploreCity}
              onOpenGovPortals={() => setIsGovPortalsOpen(true)}
              weatherLayers={weatherLayers}
              timeStep={timeStep}
              disasterIncidents={disasterIncidents}
              selectedDisasterIncident={selectedDisasterIncident}
              onSelectDisasterIncident={handleSelectDisasterIncident}
            />
          ) : (
            <ThreeGlobeCity
              weatherEvents={weatherEvents}
              selectedEvent={selectedEvent}
              activeCity={activeCity}
              viewScale={viewScale}
              weatherLayers={weatherLayers}
              cityLayers={cityLayers}
              timeStep={timeStep}
              isDemoMode={isDemoMode}
              onSelectEvent={handleSelectEvent}
              onExploreCity={handleExploreCity}
              onInspectBuilding={setInspectedBuilding}
              onInspectRoad={setInspectedRoad}
              onReturnToIndia={handleReturnToIndia}
              onReturnToGlobal={handleReturnToGlobal}
              isTransitioning={isTransitioning}
              setIsTransitioning={setIsTransitioning}
            />
          )}

          {/* View Scale & Camera Controls */}
          <ViewControls
            viewScale={viewScale}
            activeCity={activeCity}
            selectedEvent={selectedEvent}
            onChangeScale={setViewScale}
            onResetCamera={handleResetCamera}
          />

          {/* Weather & 3D Layer Selector Panel (shown in 3D views) */}
          {viewScale !== 'india_map' && (
            <WeatherLayerPanel
              viewScale={viewScale}
              weatherLayers={weatherLayers}
              onToggleWeatherLayer={handleToggleWeatherLayer}
              cityLayers={cityLayers}
              onToggleCityLayer={handleToggleCityLayer}
            />
          )}

          {/* Fly-to-City Cinematic Stage Transition Overlay */}
          {isTransitioning && pendingTransitionCity && (
            <CityLoadingOverlay
              city={pendingTransitionCity}
              onComplete={handleCompleteTransition}
            />
          )}

          {/* DisasterAI Incident Detail Panel */}
          {selectedDisasterIncident && (
            <DisasterIncidentPanel
              incident={selectedDisasterIncident}
              onClose={() => setSelectedDisasterIncident(null)}
              isLoadingDetail={isLoadingIncidentDetail}
            />
          )}

          {/* City Inspector Panel when in City Mode */}
          {viewScale === 'city' && activeCity && selectedEvent && !selectedDisasterIncident && (
            <CityInspectorPanel
              city={activeCity}
              event={selectedEvent}
              aiAnalysis={aiAnalysis}
              inspectedBuilding={inspectedBuilding}
              inspectedRoad={inspectedRoad}
              timeStep={timeStep}
              viewScale={viewScale}
              onReturnToIndia={handleReturnToIndia}
              onReturnToGlobal={handleReturnToGlobal}
              onCloseBuilding={() => setInspectedBuilding(null)}
              onCloseRoad={() => setInspectedRoad(null)}
              isAiLoading={isAiLoading}
            />
          )}

          {/* Bottom Interactive Time Machine Scrubber */}
          <TimeMachine
            timeStep={timeStep}
            onChangeTimeStep={setTimeStep}
            isPlaying={isPlayingTimeline}
            onTogglePlay={() => setIsPlayingTimeline(!isPlayingTimeline)}
          />
        </main>
      </div>

      {/* 3. MODAL DIALOGS */}
      <DisasterIncidentsModal
        isOpen={isDisasterModalOpen}
        onClose={() => setIsDisasterModalOpen(false)}
        incidents={disasterIncidents}
        selectedIncident={selectedDisasterIncident}
        onSelectIncident={setSelectedDisasterIncident}
        onFocusOnMap={(inc) => {
          setSelectedDisasterIncident(inc);
          setViewScale('india_map');
        }}
      />

      <EventsListModal
        isOpen={isEventsModalOpen}
        onClose={() => setIsEventsModalOpen(false)}
        events={weatherEvents}
        onFlyToEventCity={(city, ev) => {
          setSelectedEvent(ev);
          handleExploreCity(city);
        }}
      />

      <SensorNetworkModal
        isOpen={isSensorsModalOpen}
        onClose={() => setIsSensorsModalOpen(false)}
      />

      <CitizenReportModal
        isOpen={isCitizenModalOpen}
        onClose={() => setIsCitizenModalOpen(false)}
        activeCityName={activeCity?.cityName || 'Hyderabad'}
      />

      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        events={weatherEvents}
        onSelectEvent={handleSelectEvent}
      />

      <GovPortalsModal
        isOpen={isGovPortalsOpen}
        onClose={() => setIsGovPortalsOpen(false)}
      />
    </div>
  );
}
