/**
 * HIKARI SENSE - Official Government Weather & Disaster Portals Registry
 * Connects to NDMA SACHET, IMD Mausam, CWC, ISRO MOSDAC, and State Emergency Portals
 */

export interface GovPortal {
  id: string;
  name: string;
  shortName: string;
  agency: string;
  url: string;
  description: string;
  category: 'alerts' | 'weather' | 'cyclone' | 'flood' | 'satellite';
  status: 'ONLINE' | 'ACTIVE_INGEST';
  latestBulletin: string;
  helpline: string;
  features: string[];
}

export const GOV_PORTALS: GovPortal[] = [
  {
    id: 'sachet-ndma',
    name: 'SACHET – National Disaster Early Warning Portal',
    shortName: 'NDMA SACHET',
    agency: 'National Disaster Management Authority (NDMA)',
    url: 'https://sachet.ndma.gov.in',
    description: 'All-India Common Alerting Protocol (CAP) platform for real-time localized SMS, broadcast, and siren alerts for geo-hazards, flash floods, and severe weather.',
    category: 'alerts',
    status: 'ONLINE',
    latestBulletin: 'Active Orange Alert: Cloudburst & waterlogging warning across Rangareddy & Mumbai Suburban catchments.',
    helpline: 'NDMA Control Room: 1078 / 011-26701728',
    features: ['Geo-targeted SMS Cell Broadcasts', 'CAP Standard XML Ingest', 'Gram Panchayat Level Alerts', 'Multi-Hazard Risk Maps'],
  },
  {
    id: 'imd-mausam',
    name: 'MAUSAM – IMD National Weather Services Portal',
    shortName: 'IMD Mausam',
    agency: 'India Meteorological Department, Ministry of Earth Sciences',
    url: 'https://mausam.imd.gov.in',
    description: 'Official national weather service for daily weather forecasts, district-level nowcasting, Doppler Weather Radar (DWR) composite volume scans, and lightning alerts.',
    category: 'weather',
    status: 'ONLINE',
    latestBulletin: 'Monsoon Trough: Heavy to very heavy rainfall spell active over Konkan, Coastal Karnataka & Telangana.',
    helpline: 'IMD Weather Info: 1800-180-1717 / 1965',
    features: ['DWR S-Band Radar Reflectivity', 'District Nowcast (3-Hour Alerts)', 'Agromet Advisories', 'Numerical Weather Prediction (NWP)'],
  },
  {
    id: 'imd-cyclone',
    name: 'RSMC New Delhi – Tropical Cyclone Warning Division',
    shortName: 'IMD Cyclone Portal',
    agency: 'Regional Specialized Meteorological Centre (RSMC), IMD',
    url: 'https://rsmcnewdelhi.imd.gov.in',
    description: 'WMO designated tropical cyclone tracking center for the North Indian Ocean basin, Arabian Sea, and Bay of Bengal.',
    category: 'cyclone',
    status: 'ONLINE',
    latestBulletin: 'Deep Depression over East-Central Bay of Bengal tracking northwestwards towards Andhra/Odisha coasts.',
    helpline: 'Cyclone Duty Officer: 011-24652484',
    features: ['Cyclone Track Cone of Uncertainty', 'Wind Radii 34/50/64 knot quadrants', 'Storm Surge Hydrodynamic Modeling', 'Port Warning Signals'],
  },
  {
    id: 'cwc-ffwc',
    name: 'FFWC – CWC Flood Forecast & River Discharge Portal',
    shortName: 'CWC Flood Portal',
    agency: 'Central Water Commission, Ministry of Jal Shakti',
    url: 'https://ffwc.cwc.gov.in',
    description: 'National river basin flood warning network tracking 325 river monitoring stations, dam outflows, reservoir levels, and High Flood Level (HFL) exceedances.',
    category: 'flood',
    status: 'ONLINE',
    latestBulletin: 'Brahmaputra at Guwahati flowing 0.65m above High Flood Level. Mithi river basin under flood surveillance.',
    helpline: 'CWC Flood Control: 011-26107386',
    features: ['Hydrograph River Gauge Telemetry', 'Reservoir Storage Percentage', 'Flash Flood Guidance (FFG)', 'Inundation Extent Maps'],
  },
  {
    id: 'isro-mosdac',
    name: 'MOSDAC – ISRO Satellite Meteorology & Oceanography Data',
    shortName: 'ISRO MOSDAC',
    agency: 'Space Applications Centre (SAC), ISRO',
    url: 'https://www.mosdac.gov.in',
    description: 'Near real-time satellite imagery from INSAT-3D, INSAT-3DR, and SCATSAT-1, including infrared brightness temperature, ocean surface wind vectors, and rainfall estimations.',
    category: 'satellite',
    status: 'ONLINE',
    latestBulletin: 'INSAT-3DR TIR-1 channel records convective cloud top temperatures dropping below -72°C over South Deccan.',
    helpline: 'SAC Data Helpdesk: 079-26916000',
    features: ['Thermal Infrared (TIR) Cloud Tops', 'Atmospheric Motion Vectors (AMV)', 'Ocean Scatterometer Winds', 'Rainfall Hydro-Estimator'],
  },
  {
    id: 'isro-bhuvan',
    name: 'Bhuvan Disaster Management Support Services (DMSS)',
    shortName: 'Bhuvan Disaster',
    agency: 'National Remote Sensing Centre (NRSC), ISRO',
    url: 'https://bhuvan-app1.nrsc.gov.in/disaster/disaster.php',
    description: 'Satellite-based rapid emergency mapping for flood inundation, landslide zonation, forest fires, and cyclone damage assessment across India.',
    category: 'satellite',
    status: 'ONLINE',
    latestBulletin: 'SAR (Synthetic Aperture Radar) flood inundation map published for Lower Assam & Brahmaputra valley.',
    helpline: 'NRSC Emergency Operations: 040-23884000',
    features: ['Sentinel & RISAT SAR Inundation', 'Post-Disaster High-Res Cartosat', 'Vulnerability Assessment', 'Relief Camp Spatial Planning'],
  },
];
