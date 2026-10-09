/**
 * HIKARI SENSE - National Weather Big Data Analytics Platform
 * Team: THE WIND BREAKERS (SIH 26069)
 * Theme: Disaster Management
 */

export type SeverityLevel = 'low' | 'moderate' | 'high' | 'extreme';

export type WeatherEventType =
  | 'heavy_rain'
  | 'rain'
  | 'thunderstorm'
  | 'severe_thunderstorm'
  | 'cyclone'
  | 'strong_wind'
  | 'fog'
  | 'clear'
  | 'cloudy'
  | 'flood'
  | 'extreme_heat'
  | 'extreme_cold'
  | 'severe_alert';

export type EventStatus = 'ACTIVE' | 'WATCH' | 'WARNING' | 'RESOLVED';

export interface WeatherEvent {
  event_id: string;
  event_type: WeatherEventType;
  title: string;
  city: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  severity: SeverityLevel;
  start_time: string;
  end_time: string;
  rainfall: number; // mm
  temperature: number; // °C
  humidity: number; // %
  wind_speed: number; // km/h
  confidence: number; // 0.0 - 1.0 (e.g. 0.91)
  affected_area: number; // km²
  source: string; // e.g. "IMD Doppler Radar / DWR Hyd"
  status: EventStatus;
  is_demo: boolean;
  prediction: {
    next_6h_rain: number;
    next_12h_rain: number;
    next_24h_rain: number;
    next_48h_rain: number;
    flood_risk: SeverityLevel;
    thunderstorm_prob: number; // %
    confidence: number;
    peak_time: string;
  };
  event_zone_radius_km: number;
  ai_summary?: string;
  alert_headline: string;
}

export interface Building3D {
  id: string;
  name?: string;
  x: number; // local city coordinates
  z: number;
  width: number;
  depth: number;
  height: number;
  floors: number;
  occupancy_type: 'Commercial' | 'Residential' | 'Hospital' | 'Government' | 'Critical Infrastructure';
  flood_risk: SeverityLevel;
  elevation_meters: number;
  is_evacuation_shelter?: boolean;
}

export interface RoadSegment {
  id: string;
  name: string;
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  width: number;
  lanes: number;
  flood_risk: SeverityLevel;
  rainfall_mm: number;
  predicted_water_depth_cm: number;
  status: 'OPEN' | 'CONGESTED' | 'RESTRICTED' | 'SUBMERGED';
}

export interface SimulatedVehicle {
  id: string;
  roadId: string;
  progress: number; // 0 to 1
  speed: number;
  type: 'car' | 'bus' | 'emergency';
  lane: number;
  reverse: boolean;
}

export interface CityScene {
  cityId: string;
  cityName: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  population_str: string;
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  primary_event_id: string;
  landmark_names: string[];
  buildings: Building3D[];
  roads: RoadSegment[];
  flood_elevation_threshold_m: number;
  radar_frequency_ghz: number;
  terrain_type: 'coastal' | 'plateau' | 'basin' | 'plains';
}

export type ViewScale = 'global' | 'india' | 'city' | 'event' | 'india_map';

export type WeatherLayer =
  | 'rainfall'
  | 'temperature'
  | 'wind'
  | 'thunderstorm'
  | 'cyclone'
  | 'flood'
  | 'alerts'
  | 'radar'
  | 'world_borders'
  | 'clouds';

export type CityLayer =
  | 'buildings'
  | 'roads'
  | 'traffic'
  | 'weather'
  | 'event_zone'
  | 'flood_simulation'
  | 'radar';

export type TimeStep = -12 | -6 | 0 | 6 | 12 | 24 | 48;

export type UserRole = 'OPERATOR' | 'ANALYST' | 'ADMIN' | 'CITIZEN';

export interface CitizenReport {
  id: string;
  reporter_name: string;
  city: string;
  district: string;
  location_lat: number;
  location_lon: number;
  category: 'waterlogging' | 'fallen_tree' | 'power_outage' | 'rescue_needed' | 'landslide';
  severity: SeverityLevel;
  description: string;
  timestamp: string;
  status: 'PENDING_VERIFICATION' | 'DISPATCHED' | 'RESOLVED';
  upvotes: number;
}

export interface SensorStation {
  id: string;
  name: string;
  type: 'DOPPLER_RADAR' | 'AWS_STATION' | 'RIVER_GAUGE' | 'SATELLITE_LINK';
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  status: 'ONLINE' | 'CALIBRATING' | 'WARNING';
  latency_ms: number;
  last_ping: string;
  reading: string;
}
