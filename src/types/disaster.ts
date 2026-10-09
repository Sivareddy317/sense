export type EmergencyType =
  | 'FLOOD_RESCUE'
  | 'FIRE'
  | 'MEDICAL_RESCUE'
  | 'RESCUE'
  | 'EVACUATION'
  | 'LANDSLIDE'
  | string;

export type DisasterUrgency = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type DisasterStatus = 'NEW' | 'ACTIVE' | 'RESCUE_IN_PROGRESS' | 'RESOLVED';

export interface DisasterReport {
  id: number;
  source: 'SMS' | 'WHATSAPP' | 'TWITTER' | string;
  source_id?: string | null;
  message: string;
  timestamp: string;
  is_emergency: boolean;
  emergency_type: EmergencyType;
  urgency: DisasterUrgency;
  confidence: number;
  needs_review: boolean;
}

export interface DisasterIncident {
  id: number;
  title: string;
  emergency_type: EmergencyType;
  location_text: string | null;
  latitude: number | null;
  longitude: number | null;
  people_affected: number;
  urgency: DisasterUrgency;
  status: DisasterStatus;
  confidence: number;
  source_count: number;
  created_at: string;
  updated_at: string;
  // Extended UI helper fields
  location_status?: 'confirmed' | 'approximate' | 'unverified';
  resolved_lat?: number;
  resolved_lng?: number;
  reports?: DisasterReport[];
  resources_needed?: string[];
}

export interface DisasterDashboardMetrics {
  reports: {
    total: number;
    emergency: number;
    noise: number;
    needs_review: number;
    by_source: Record<string, number>;
  };
  incidents: {
    total: number;
    active: number;
    resolved: number;
    escalating: number;
    rescue_in_progress: number;
    urgency_breakdown: {
      CRITICAL: number;
      HIGH: number;
      MEDIUM?: number;
      LOW?: number;
    };
  };
  updated_at: string;
}

export interface DisasterBackendStatus {
  isOnline: boolean;
  lastChecked: string;
  url: string;
  error?: string;
}
