import {
  DisasterIncident,
  DisasterDashboardMetrics,
  DisasterReport,
  DisasterBackendStatus,
} from '../types/disaster';

export const DISASTER_AI_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DISASTER_AI_BACKEND_URL) ||
  'https://disaster-ai-production.up.railway.app';

// Known landmark / neighborhood coordinate lookup table for dataset locations in India (primarily Chennai / Tamil Nadu / Telangana)
const KNOWN_LOCATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Velachery MRTS': { lat: 12.9816, lng: 80.2209 },
  'Medavakkam': { lat: 12.9229, lng: 80.2004 },
  'Industrial Estate Side Road': { lat: 13.0114, lng: 80.1706 },
  'Perungudi': { lat: 12.9654, lng: 80.2461 },
  'Taramani': { lat: 12.9863, lng: 80.2432 },
  'Guindy': { lat: 13.0067, lng: 80.202 },
  'Tambaram': { lat: 12.9249, lng: 80.1, },
  'Adyar': { lat: 13.0012, lng: 80.2565 },
  'Hyderabad': { lat: 17.385, lng: 78.4867 },
  'Mumbai': { lat: 19.076, lng: 72.8777 },
  'Delhi': { lat: 28.6139, lng: 77.209 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
};

/**
  Parse resources required from text report messages
 */
export function extractResourcesNeeded(reports?: DisasterReport[]): string[] {
  if (!reports || reports.length === 0) return [];
  const resources = new Set<string>();

  reports.forEach((r) => {
    const msg = r.message.toLowerCase();
    if (msg.includes('boat') || msg.includes('ndrf') || msg.includes('పంపండి')) {
      resources.add('NDRF Rescue Boat');
    }
    if (msg.includes('insulin') || msg.includes('ఇన్సులిన్')) {
      resources.add('Insulin / Medical Supplies');
    }
    if (msg.includes('medical') || msg.includes('మెడికల్')) {
      resources.add('Medical First Responder Unit');
    }
    if (msg.includes('fire') || msg.includes('extinguisher')) {
      resources.add('Fire Engine & Rescue Squad');
    }
    if (msg.includes('food') || msg.includes('water') || msg.includes('ration')) {
      resources.add('Emergency Rations & Drinking Water');
    }
    if (msg.includes('power') || msg.includes('generator')) {
      resources.add('Emergency Power Generator');
    }
  });

  return Array.from(resources);
}

/**
 * Resolve coordinates and status for an incident record
 */
export function resolveIncidentLocation(inc: DisasterIncident): DisasterIncident {
  if (inc.latitude !== null && inc.longitude !== null && !isNaN(inc.latitude) && !isNaN(inc.longitude)) {
    return {
      ...inc,
      location_status: 'confirmed',
      resolved_lat: inc.latitude,
      resolved_lng: inc.longitude,
    };
  }

  // Attempt lookup via location_text
  if (inc.location_text) {
    for (const [key, coords] of Object.entries(KNOWN_LOCATION_COORDINATES)) {
      if (inc.location_text.toLowerCase().includes(key.toLowerCase())) {
        return {
          ...inc,
          location_status: 'approximate',
          resolved_lat: coords.lat,
          resolved_lng: coords.lng,
        };
      }
    }
  }

  return {
    ...inc,
    location_status: 'unverified',
    resolved_lat: undefined,
    resolved_lng: undefined,
  };
}

/**
 * Fetch Backend Health Status
 */
export async function fetchDisasterBackendHealth(): Promise<DisasterBackendStatus> {
  const url = `${DISASTER_AI_BASE_URL}/health`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      return {
        isOnline: true,
        lastChecked: new Date().toISOString(),
        url: DISASTER_AI_BASE_URL,
      };
    }
    return {
      isOnline: false,
      lastChecked: new Date().toISOString(),
      url: DISASTER_AI_BASE_URL,
      error: `HTTP ${res.status}`,
    };
  } catch (err: any) {
    return {
      isOnline: false,
      lastChecked: new Date().toISOString(),
      url: DISASTER_AI_BASE_URL,
      error: err?.message || 'Network unreachable',
    };
  }
}

/**
 * Fetch Dashboard Metrics from GET /api/dashboard
 */
export async function fetchDisasterDashboardMetrics(): Promise<DisasterDashboardMetrics | null> {
  const url = `${DISASTER_AI_BASE_URL}/api/dashboard`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[DisasterService] Failed to fetch dashboard metrics:', err);
    return null;
  }
}

/**
 * Fetch All Incidents from GET /api/incidents?limit=100
 */
export async function fetchDisasterIncidents(limit = 100): Promise<{
  incidents: DisasterIncident[];
  total: number;
}> {
  const url = `${DISASTER_AI_BASE_URL}/api/incidents?limit=${limit}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    const rawIncidents: DisasterIncident[] = data.incidents || [];
    const resolved = rawIncidents.map(resolveIncidentLocation);
    return {
      incidents: resolved,
      total: data.total || rawIncidents.length,
    };
  } catch (err) {
    console.warn('[DisasterService] Failed to fetch incidents:', err);
    return { incidents: [], total: 0 };
  }
}

/**
 * Fetch Single Incident Detail with Reports from GET /api/incidents/:id
 */
export async function fetchDisasterIncidentDetail(
  incidentId: number
): Promise<DisasterIncident | null> {
  const url = `${DISASTER_AI_BASE_URL}/api/incidents/${incidentId}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const baseInc: DisasterIncident = data.incident;
    const reports: DisasterReport[] = data.reports || [];

    const resolved = resolveIncidentLocation(baseInc);
    resolved.reports = reports;
    resolved.resources_needed = extractResourcesNeeded(reports);
    return resolved;
  } catch (err) {
    console.warn(`[DisasterService] Failed to fetch incident #${incidentId} details:`, err);
    return null;
  }
}
