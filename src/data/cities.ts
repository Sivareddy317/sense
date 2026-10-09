import { CityScene, Building3D, RoadSegment, SeverityLevel } from '../types/weather';

function generateCityBuildings(
  centerLat: number,
  centerLon: number,
  landmarks: { name: string; x: number; z: number; height: number; type: Building3D['occupancy_type'] }[],
  highRiskAreaOffset: { x: number; z: number; radius: number },
  baseHeightFactor: number = 1.0
): Building3D[] {
  const buildings: Building3D[] = [];
  let idCounter = 1;

  // Add designated landmarks
  landmarks.forEach((lm) => {
    buildings.push({
      id: `bld-lm-${idCounter++}`,
      name: lm.name,
      x: lm.x,
      z: lm.z,
      width: 24,
      depth: 24,
      height: lm.height,
      floors: Math.floor(lm.height / 3.5),
      occupancy_type: lm.type,
      flood_risk: 'low',
      elevation_meters: 540,
      is_evacuation_shelter: lm.type === 'Hospital' || lm.type === 'Government',
    });
  });

  // Generate high-density urban core grid (approx 12x12 blocks)
  const gridSize = 12;
  const spacing = 28;
  const startX = -((gridSize * spacing) / 2);
  const startZ = -((gridSize * spacing) / 2);

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const bx = startX + i * spacing + (Math.sin(i * 3.7 + j) * 4);
      const bz = startZ + j * spacing + (Math.cos(i + j * 2.1) * 4);

      // Check distance from designated landmarks to prevent collisions
      const overlapsLandmark = landmarks.some((lm) => Math.hypot(lm.x - bx, lm.z - bz) < 18);
      if (overlapsLandmark) continue;

      // Distance from city center
      const distFromCenter = Math.hypot(bx, bz);
      if (distFromCenter > 180) continue;

      // Distance from high-risk flood accumulation basin
      const distFromFlood = Math.hypot(bx - highRiskAreaOffset.x, bz - highRiskAreaOffset.z);

      let floodRisk: SeverityLevel = 'low';
      if (distFromFlood < highRiskAreaOffset.radius * 0.5) {
        floodRisk = 'extreme';
      } else if (distFromFlood < highRiskAreaOffset.radius * 0.85) {
        floodRisk = 'high';
      } else if (distFromFlood < highRiskAreaOffset.radius * 1.3) {
        floodRisk = 'moderate';
      }

      // Height distribution: core skyscrapers tapering to perimeter
      const centralBonus = Math.max(0, 1 - distFromCenter / 160);
      const pseudoRand = ((Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1 + 1) % 1;
      const height = Math.floor((18 + centralBonus * 85 + pseudoRand * 45) * baseHeightFactor);

      const occupancyTypes: Building3D['occupancy_type'][] = [
        'Commercial',
        'Residential',
        'Residential',
        'Hospital',
        'Government',
        'Critical Infrastructure',
      ];
      const occType = occupancyTypes[Math.floor(pseudoRand * occupancyTypes.length)];

      buildings.push({
        id: `bld-${idCounter++}`,
        x: bx,
        z: bz,
        width: 14 + (pseudoRand * 8),
        depth: 14 + ((pseudoRand * 13) % 8),
        height: Math.max(16, height),
        floors: Math.max(4, Math.floor(height / 3.3)),
        occupancy_type: occType,
        flood_risk: floodRisk,
        elevation_meters: 520 - (distFromFlood < highRiskAreaOffset.radius ? 12 : 0),
        is_evacuation_shelter: occType === 'Hospital' || (occType === 'Government' && floodRisk === 'low'),
      });
    }
  }

  return buildings;
}

function generateCityRoads(
  highRiskAreaOffset: { x: number; z: number; radius: number },
  roadNames: string[]
): RoadSegment[] {
  const roads: RoadSegment[] = [];
  let roadId = 1;

  // Major horizontal arteries
  const zCoords = [-120, -60, 0, 60, 120];
  zCoords.forEach((z, idx) => {
    const isNearFlood = Math.abs(z - highRiskAreaOffset.z) < highRiskAreaOffset.radius;
    const name = roadNames[idx % roadNames.length] || `Arterial Corridor ${idx + 1}`;
    const risk: SeverityLevel = isNearFlood ? 'high' : 'moderate';

    roads.push({
      id: `road-h-${roadId++}`,
      name,
      startX: -170,
      startZ: z,
      endX: 170,
      endZ: z,
      width: 7.5,
      lanes: 4,
      flood_risk: isNearFlood ? 'extreme' : 'low',
      rainfall_mm: isNearFlood ? 88 : 45,
      predicted_water_depth_cm: isNearFlood ? 42 : 5,
      status: isNearFlood ? 'SUBMERGED' : 'OPEN',
    });
  });

  // Major vertical avenues
  const xCoords = [-120, -60, 0, 60, 120];
  xCoords.forEach((x, idx) => {
    const isNearFlood = Math.abs(x - highRiskAreaOffset.x) < highRiskAreaOffset.radius;
    const name = roadNames[(idx + 3) % roadNames.length] || `Cross Avenue ${idx + 1}`;

    roads.push({
      id: `road-v-${roadId++}`,
      name,
      startX: x,
      startZ: -170,
      endX: x,
      endZ: 170,
      width: 7.5,
      lanes: 4,
      flood_risk: isNearFlood ? 'high' : 'low',
      rainfall_mm: isNearFlood ? 78 : 38,
      predicted_water_depth_cm: isNearFlood ? 28 : 2,
      status: isNearFlood ? 'RESTRICTED' : 'OPEN',
    });
  });

  return roads;
}

export const CITIES_DATA: Record<string, CityScene> = {
  Hyderabad: {
    cityId: 'hyd',
    cityName: 'Hyderabad',
    state: 'Telangana',
    district: 'Hyderabad / Rangareddy',
    latitude: 17.3850,
    longitude: 78.4867,
    elevation_m: 542,
    population_str: '10.5 Million',
    boundingBox: { minLat: 17.25, maxLat: 17.52, minLon: 78.32, maxLon: 78.62 },
    primary_event_id: 'ev-hyd-01',
    landmark_names: ['Cyber Towers Tech Hub', 'Hussain Sagar Lake Basin', 'Charminar Heritage Core', 'HITEC City Flyover'],
    terrain_type: 'plateau',
    flood_elevation_threshold_m: 532,
    radar_frequency_ghz: 2.8,
    buildings: generateCityBuildings(
      17.3850,
      78.4867,
      [
        { name: 'Cyber Towers Tech Spine', x: -40, z: -35, height: 115, type: 'Commercial' },
        { name: 'Telangana State Secretariat', x: 25, z: 20, height: 75, type: 'Government' },
        { name: 'Apollo Emergency Super-Specialty', x: -65, z: 50, height: 60, type: 'Hospital' },
        { name: 'Charminar Historic Quadrant', x: 70, z: 60, height: 52, type: 'Critical Infrastructure' },
        { name: 'Mindspace IT Urban Tower A', x: -55, z: -80, height: 130, type: 'Commercial' },
      ],
      { x: -30, z: 20, radius: 65 },
      1.1
    ),
    roads: generateCityRoads(
      { x: -30, z: 20, radius: 65 },
      [
        'PVNR Elevated Expressway',
        'HITEC City Main Boulevard',
        'Inner Ring Road – Mehdipatnam',
        'Gachibowli Financial District Way',
        'Raj Bhavan Road Corridor',
        'Banjara Hills Road No. 12',
      ]
    ),
  },
  Mumbai: {
    cityId: 'mum',
    cityName: 'Mumbai',
    state: 'Maharashtra',
    district: 'Mumbai Suburban / City',
    latitude: 19.0760,
    longitude: 72.8777,
    elevation_m: 14,
    population_str: '21.3 Million',
    boundingBox: { minLat: 18.90, maxLat: 19.28, minLon: 72.78, maxLon: 73.02 },
    primary_event_id: 'ev-mum-02',
    landmark_names: ['Bandra-Worli Sea Link', 'Nariman Point High-Rise Corridor', 'Gateway of India', 'BKC Financial Center'],
    terrain_type: 'coastal',
    flood_elevation_threshold_m: 8,
    radar_frequency_ghz: 2.85,
    buildings: generateCityBuildings(
      19.0760,
      72.8777,
      [
        { name: 'Bandra Kurla Complex Financial Tower', x: -30, z: -40, height: 165, type: 'Commercial' },
        { name: 'Nariman Point Coastal Tower', x: 45, z: 55, height: 180, type: 'Commercial' },
        { name: 'KEM Memorial Hospital', x: -60, z: 30, height: 70, type: 'Hospital' },
        { name: 'BMC Disaster Command HQ', x: 20, z: -20, height: 95, type: 'Government' },
        { name: 'Worli Sea-Facing Skyscraper', x: -75, z: -10, height: 195, type: 'Residential' },
      ],
      { x: -20, z: -10, radius: 75 },
      1.35
    ),
    roads: generateCityRoads(
      { x: -20, z: -10, radius: 75 },
      [
        'Western Express Highway (WEH)',
        'Eastern Freeway Corridor',
        'Bandra-Worli Sea Link Connector',
        'Swami Vivekananda (SV) Road',
        'LBS Marg Kurla Waterway',
        'Marine Drive Promenade',
      ]
    ),
  },
  Chennai: {
    cityId: 'chn',
    cityName: 'Chennai',
    state: 'Tamil Nadu',
    district: 'Chennai Coastal Sector',
    latitude: 13.0827,
    longitude: 80.2707,
    elevation_m: 6,
    population_str: '11.5 Million',
    boundingBox: { minLat: 12.92, maxLat: 13.20, minLon: 80.12, maxLon: 80.34 },
    primary_event_id: 'ev-chn-03',
    landmark_names: ['Marina Coastal Promenade', 'Tidel Park OMR', 'Ripon Building Municipal HQ', 'Chennai Central Terminal'],
    terrain_type: 'coastal',
    flood_elevation_threshold_m: 4,
    radar_frequency_ghz: 2.75,
    buildings: generateCityBuildings(
      13.0827,
      80.2707,
      [
        { name: 'Tidel Park Technology Spine', x: -45, z: -50, height: 110, type: 'Commercial' },
        { name: 'Ripon Municipal Disaster Center', x: 30, z: 30, height: 65, type: 'Government' },
        { name: 'Government General Hospital', x: -20, z: 40, height: 55, type: 'Hospital' },
        { name: 'OMR IT Tower Cluster Alpha', x: -60, z: -70, height: 125, type: 'Commercial' },
      ],
      { x: 30, z: 10, radius: 70 },
      1.0
    ),
    roads: generateCityRoads(
      { x: 30, z: 10, radius: 70 },
      [
        'Old Mahabalipuram Road (OMR)',
        'Anna Salai (Mount Road)',
        'East Coast Road (ECR)',
        'Poonamallee High Road',
        'Velachery Main Road Drainage Zone',
      ]
    ),
  },
  Delhi: {
    cityId: 'del',
    cityName: 'Delhi',
    state: 'Delhi',
    district: 'Central & South Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    elevation_m: 216,
    population_str: '32.9 Million',
    boundingBox: { minLat: 28.40, maxLat: 28.88, minLon: 76.95, maxLon: 77.40 },
    primary_event_id: 'ev-del-04',
    landmark_names: ['Connaught Place Radial Grid', 'India Gate Boulevard', 'AIIMS Trauma Center', 'Yamuna Riverbed Corridor'],
    terrain_type: 'plains',
    flood_elevation_threshold_m: 205,
    radar_frequency_ghz: 2.9,
    buildings: generateCityBuildings(
      28.6139,
      77.2090,
      [
        { name: 'Civic Centre Urban Headquarters', x: 20, z: -20, height: 110, type: 'Government' },
        { name: 'Statesman House Connaught', x: -10, z: 15, height: 85, type: 'Commercial' },
        { name: 'AIIMS Apex Emergency Complex', x: -50, z: 60, height: 65, type: 'Hospital' },
        { name: 'Shastri Bhawan Central Complex', x: 40, z: 40, height: 70, type: 'Government' },
      ],
      { x: 50, z: 30, radius: 60 },
      1.05
    ),
    roads: generateCityRoads(
      { x: 50, z: 30, radius: 60 },
      [
        'Inner Ring Road (Mahatma Gandhi Marg)',
        'Outer Ring Road Expressway',
        'Barapullah Elevated Flyover',
        'Vikas Marg Yamuna Link',
        'Mathura Road Arterial',
      ]
    ),
  },
  Kolkata: {
    cityId: 'kol',
    cityName: 'Kolkata',
    state: 'West Bengal',
    district: 'Kolkata Urban Core',
    latitude: 22.5726,
    longitude: 88.3639,
    elevation_m: 9,
    population_str: '14.9 Million',
    boundingBox: { minLat: 22.42, maxLat: 22.68, minLon: 88.25, maxLon: 88.48 },
    primary_event_id: 'ev-kol-05',
    landmark_names: ['Howrah Bridge Approach', 'Park Street Commercial Core', 'Nabanna State HQ', 'Salt Lake Tech Sector V'],
    terrain_type: 'basin',
    flood_elevation_threshold_m: 6,
    radar_frequency_ghz: 2.7,
    buildings: generateCityBuildings(
      22.5726,
      88.3639,
      [
        { name: 'The 42 Chowringhee Highrise', x: 10, z: 20, height: 210, type: 'Residential' },
        { name: 'Salt Lake IT Tower Millennium', x: -60, z: -50, height: 115, type: 'Commercial' },
        { name: 'SSKM Medical College & Hospital', x: -20, z: 45, height: 50, type: 'Hospital' },
        { name: 'KMC Central Disaster Control', x: 25, z: -15, height: 75, type: 'Government' },
      ],
      { x: -30, z: 15, radius: 65 },
      1.1
    ),
    roads: generateCityRoads(
      { x: -30, z: 15, radius: 65 },
      [
        'Eastern Metropolitan (EM) Bypass',
        'AJC Bose Road Flyover',
        'Maa Flyover (Park Circus Connector)',
        'VIP Road Airport Corridor',
        'Strand Road Hooghly Embankment',
      ]
    ),
  },
  Bengaluru: {
    cityId: 'blr',
    cityName: 'Bengaluru',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    latitude: 12.9716,
    longitude: 77.5946,
    elevation_m: 920,
    population_str: '13.2 Million',
    boundingBox: { minLat: 12.80, maxLat: 13.15, minLon: 77.45, maxLon: 77.75 },
    primary_event_id: 'ev-blr-06',
    landmark_names: ['Vidhana Soudha Secretariat', 'Manyata Tech Park', 'Bellandur Catchment Zone', 'Electronic City Flyover'],
    terrain_type: 'plateau',
    flood_elevation_threshold_m: 895,
    radar_frequency_ghz: 2.82,
    buildings: generateCityBuildings(
      12.9716,
      77.5946,
      [
        { name: 'Vidhana Soudha Legislative Apex', x: 30, z: 10, height: 68, type: 'Government' },
        { name: 'World Trade Center Malleswaram', x: -45, z: -40, height: 130, type: 'Commercial' },
        { name: 'Manipal Hospital Critical Care', x: -25, z: 50, height: 60, type: 'Hospital' },
        { name: 'EcoSpace IT Hub Outer Ring', x: -70, z: 20, height: 105, type: 'Commercial' },
      ],
      { x: -50, z: 25, radius: 60 },
      1.05
    ),
    roads: generateCityRoads(
      { x: -50, z: 25, radius: 60 },
      [
        'Outer Ring Road (ORR) Bellandur Stretch',
        'Hosur Road Elevated Tollway',
        'Old Airport Road Arterial',
        'Bannerghatta Road Corridor',
        'Hebbal Flyover Junction',
      ]
    ),
  },
  Visakhapatnam: {
    cityId: 'vzg',
    cityName: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam Coastal',
    latitude: 17.6868,
    longitude: 83.2185,
    elevation_m: 45,
    population_str: '2.4 Million',
    boundingBox: { minLat: 17.55, maxLat: 17.85, minLon: 83.10, maxLon: 83.38 },
    primary_event_id: 'ev-vzg-07',
    landmark_names: ['Kailasagiri Radar Hill', 'Port Trust Maritime Terminal', 'RK Beach Coastal Road', 'Steel Plant Industrial Core'],
    terrain_type: 'coastal',
    flood_elevation_threshold_m: 8,
    radar_frequency_ghz: 2.8,
    buildings: generateCityBuildings(
      17.6868,
      83.2185,
      [
        { name: 'Visakhapatnam Port Administrative Highrise', x: 15, z: 40, height: 90, type: 'Critical Infrastructure' },
        { name: 'King George Hospital Emergency Wing', x: -30, z: 20, height: 50, type: 'Hospital' },
        { name: 'Beach Road Skyline Commercial', x: 40, z: -20, height: 110, type: 'Commercial' },
        { name: 'Collectorate Disaster Cell', x: -10, z: -35, height: 65, type: 'Government' },
      ],
      { x: 30, z: 25, radius: 60 },
      0.95
    ),
    roads: generateCityRoads(
      { x: 30, z: 25, radius: 60 },
      [
        'RK Beach Road Coastal Boulevard',
        'National Highway 16 Expressway',
        'Port Main Approach Highway',
        'Waltair Main Road',
      ]
    ),
  },
  Guwahati: {
    cityId: 'ghy',
    cityName: 'Guwahati',
    state: 'Assam',
    district: 'Kamrup Metropolitan',
    latitude: 26.1445,
    longitude: 91.7362,
    elevation_m: 55,
    population_str: '1.2 Million',
    boundingBox: { minLat: 26.05, maxLat: 26.25, minLon: 91.60, maxLon: 91.88 },
    primary_event_id: 'ev-ghy-08',
    landmark_names: ['Brahmaputra Riverside Embankment', 'Saraighat Bridge Crossing', 'Dispur State Secretariat', 'Gauhati Medical College'],
    terrain_type: 'basin',
    flood_elevation_threshold_m: 48,
    radar_frequency_ghz: 2.7,
    buildings: generateCityBuildings(
      26.1445,
      91.7362,
      [
        { name: 'Assam Secretariat Janata Bhawan', x: -20, z: -30, height: 60, type: 'Government' },
        { name: 'Gauhati Medical College & Hospital', x: -45, z: 35, height: 55, type: 'Hospital' },
        { name: 'Brahmaputra River Basin Control Post', x: 40, z: 50, height: 45, type: 'Critical Infrastructure' },
        { name: 'GS Road Commercial Complex', x: 10, z: -10, height: 80, type: 'Commercial' },
      ],
      { x: 35, z: 40, radius: 75 },
      0.9
    ),
    roads: generateCityRoads(
      { x: 35, z: 40, radius: 75 },
      [
        'GS (Guwahati-Shillong) Road',
        'MG Road Brahmaputra Embankment',
        'VIP Road Six Mile Link',
        'Zoo Road (R.G. Baruah Road)',
      ]
    ),
  },
};
