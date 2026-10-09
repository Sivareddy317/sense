/**
 * HIKARI SENSE - High-Fidelity Geospatial World Map Generator
 * Renders an accurate equirectangular world map onto an HTML5 canvas for 3D Globe texturing.
 * Features:
 * - Accurate polygon coastlines for all 7 continents and major islands
 * - National borders and sovereignty boundaries
 * - Geographic coordinate graticule (Equator, Tropics, Prime Meridian, Parallels)
 * - Deep ocean bathymetry and continental shelf glow
 * - Detailed India sub-continent with state boundaries, major rivers, and metropolises
 * - Ocean and continental typography labels
 * - Progressive enhancement support for satellite imagery
 */

export interface WorldMapOptions {
  width?: number;
  height?: number;
  showGraticule?: boolean;
  showCountryBorders?: boolean;
  showLabels?: boolean;
  showRivers?: boolean;
  theme?: 'command_center' | 'satellite' | 'topographic';
}

// Convert [lat, lon] to canvas pixel coordinates
// lat: -90 (South Pole) to +90 (North Pole)
// lon: -180 (West) to +180 (East)
export function latLonToCanvas(
  lat: number,
  lon: number,
  width: number,
  height: number
): [number, number] {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

// Helper to draw a polygon of [lat, lon] coordinates
function drawGeoPolygon(
  ctx: CanvasRenderingContext2D,
  coords: [number, number][],
  width: number,
  height: number,
  fillColor?: string,
  strokeColor?: string,
  lineWidth: number = 1
) {
  if (coords.length < 3) return;
  ctx.beginPath();
  const [firstX, firstY] = latLonToCanvas(coords[0][0], coords[0][1], width, height);
  ctx.moveTo(firstX, firstY);

  for (let i = 1; i < coords.length; i++) {
    const [x, y] = latLonToCanvas(coords[i][0], coords[i][1], width, height);
    ctx.lineTo(x, y);
  }
  ctx.closePath();

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

// Helper to draw a polyline (e.g. borders, rivers, coastlines)
function drawGeoPolyline(
  ctx: CanvasRenderingContext2D,
  coords: [number, number][],
  width: number,
  height: number,
  strokeColor: string,
  lineWidth: number = 1,
  lineDash: number[] = []
) {
  if (coords.length < 2) return;
  ctx.beginPath();
  ctx.setLineDash(lineDash);
  const [firstX, firstY] = latLonToCanvas(coords[0][0], coords[0][1], width, height);
  ctx.moveTo(firstX, firstY);

  for (let i = 1; i < coords.length; i++) {
    const [x, y] = latLonToCanvas(coords[i][0], coords[i][1], width, height);
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.setLineDash([]);
}

// =========================================================================
// REALISTIC CONTINENTAL COASTLINE COORDINATES [LAT, LON]
// =========================================================================

// 1. AFRICA
const AFRICA_COAST: [number, number][] = [
  [37.3, 9.8], [36.8, 11.1], [33.9, 10.1], [32.9, 13.2], [31.2, 16.6],
  [32.0, 20.0], [31.5, 25.0], [31.3, 30.0], [31.6, 32.3], [29.9, 32.5],
  [27.8, 34.3], [24.0, 35.6], [22.0, 36.9], [19.5, 37.3], [15.6, 39.5],
  [12.8, 43.0], [11.8, 43.3], [11.6, 51.2], [9.5, 50.8], [5.3, 48.5],
  [2.0, 45.3], [-0.5, 42.8], [-4.0, 39.7], [-10.5, 40.5], [-15.0, 40.7],
  [-17.0, 39.0], [-23.8, 35.5], [-26.0, 32.9], [-28.8, 32.1], [-32.0, 29.0],
  [-34.0, 25.7], [-34.8, 20.0], [-34.4, 18.5], [-32.5, 18.2], [-28.6, 16.5],
  [-22.9, 14.5], [-16.0, 11.8], [-12.3, 13.6], [-8.8, 13.2], [-6.0, 12.3],
  [-5.0, 12.0], [-1.0, 9.5], [2.0, 9.8], [4.5, 8.5], [4.3, 6.0],
  [6.4, 3.4], [5.0, 0.0], [5.2, -3.0], [4.4, -7.5], [6.0, -10.5],
  [8.0, -13.0], [9.5, -13.7], [12.0, -16.5], [14.7, -17.5], [16.0, -16.5],
  [21.0, -17.0], [26.0, -14.5], [30.5, -10.0], [33.5, -7.6], [35.8, -5.9],
  [35.9, -5.3], [35.2, -3.0], [36.0, 1.0], [36.9, 4.0], [37.3, 9.8]
];

// Madagascar
const MADAGASCAR_COAST: [number, number][] = [
  [-12.0, 49.3], [-15.5, 50.5], [-19.0, 48.9], [-25.0, 47.0], [-25.6, 45.2],
  [-22.0, 43.2], [-16.0, 44.4], [-13.3, 48.0], [-12.0, 49.3]
];

// 2. EURASIA (Europe & Asia mainland)
const EURASIA_COAST: [number, number][] = [
  // Western Europe
  [36.0, -5.6], [36.5, -6.3], [37.0, -8.9], [38.7, -9.5], [41.2, -8.7],
  [43.4, -9.3], [43.5, -1.8], [46.0, -1.2], [48.4, -4.7], [49.7, -1.6],
  [51.0, 2.2], [53.5, 7.0], [55.0, 8.5], [57.7, 10.6], [55.6, 12.6],
  [54.5, 14.0], [54.5, 19.0], [57.0, 21.5], [59.0, 24.0], [60.0, 30.0],
  // Scandinavia
  [65.0, 25.0], [66.0, 22.0], [60.0, 19.0], [59.0, 18.0], [56.0, 13.0],
  [58.0, 8.0], [60.5, 5.0], [63.0, 8.0], [68.0, 14.0], [71.2, 25.8],
  [70.0, 31.0], [68.0, 40.0], [66.0, 44.0],
  // Northern Russia & Siberia
  [68.5, 50.0], [69.5, 60.0], [73.0, 70.0], [73.0, 80.0], [77.0, 105.0],
  [73.0, 120.0], [71.0, 135.0], [70.0, 150.0], [69.0, 170.0], [66.0, -170.0],
  // Kamchatka & East Asia
  [60.0, 165.0], [52.0, 158.0], [56.0, 163.0], [59.0, 150.0], [53.0, 141.0],
  [45.0, 136.0], [42.0, 130.0], [38.0, 128.0], [35.0, 129.0], [37.0, 126.0],
  [40.0, 124.0], [38.0, 118.0], [35.0, 119.5], [31.5, 121.5], [26.0, 120.0],
  [22.5, 114.0], [21.0, 109.0], [16.0, 108.0], [10.5, 107.5], [8.5, 105.0],
  // Southeast Asia & Indochina
  [10.0, 103.0], [13.0, 100.5], [8.0, 100.0], [1.3, 103.8], [3.0, 101.5],
  [7.0, 99.0], [16.0, 96.0], [20.0, 93.0], [22.0, 91.5],
  // Indian Subcontinent (Detailed)
  [22.5, 89.5], [21.5, 87.0], [19.8, 86.0], [17.7, 83.3], [15.8, 80.3],
  [13.1, 80.3], [10.8, 79.8], [9.3, 79.1], [8.1, 77.5], [8.8, 76.6],
  [11.5, 75.8], [15.4, 73.8], [19.0, 72.8], [20.9, 70.4], [22.3, 69.0],
  [23.5, 68.3], [24.8, 67.0], [25.2, 62.0],
  // Middle East / Persian Gulf / Red Sea
  [25.0, 57.0], [24.0, 58.0], [22.5, 59.8], [17.0, 54.0], [14.5, 49.0],
  [12.7, 43.5], [16.0, 42.0], [22.0, 39.0], [28.0, 35.0], [29.5, 35.0],
  [31.5, 34.5], [33.5, 35.5], [36.5, 36.0], [36.5, 30.0], [38.5, 27.0],
  [40.5, 26.5], [41.0, 29.0],
  // Mediterranean Europe & Black Sea
  [40.0, 23.0], [38.0, 24.0], [36.5, 22.0], [38.5, 21.0], [42.0, 19.0],
  [45.5, 13.5], [44.0, 12.5], [41.0, 16.0], [38.0, 16.0], [37.0, 15.0],
  [40.5, 14.0], [44.0, 10.0], [43.5, 7.0], [43.0, 3.0], [41.0, 1.0],
  [37.0, -1.8], [36.7, -4.5], [36.0, -5.6]
];

// Great Britain & Ireland
const BRITAIN_COAST: [number, number][] = [
  [50.0, -5.2], [50.5, -2.0], [51.5, 1.4], [53.0, 0.5], [55.0, -1.5],
  [58.5, -3.0], [58.6, -5.0], [56.0, -5.5], [54.5, -3.0], [53.0, -4.5],
  [51.5, -5.0], [50.0, -5.2]
];

const IRELAND_COAST: [number, number][] = [
  [51.5, -9.5], [52.2, -6.3], [54.0, -6.0], [55.3, -7.3], [54.5, -9.0],
  [53.0, -10.0], [51.5, -9.5]
];

// Japan
const JAPAN_COAST: [number, number][] = [
  [31.0, 130.5], [33.5, 133.5], [35.5, 140.0], [40.5, 142.0], [43.5, 145.5],
  [45.5, 142.0], [43.0, 140.5], [39.0, 139.5], [36.0, 136.0], [34.0, 131.0],
  [31.0, 130.5]
];

// Sri Lanka
const SRI_LANKA_COAST: [number, number][] = [
  [9.8, 80.2], [8.5, 81.2], [6.9, 81.8], [5.9, 80.5], [7.0, 79.8],
  [8.5, 79.8], [9.8, 80.2]
];

// Indonesian Archipelago / Philippines
const SUMATRA_COAST: [number, number][] = [
  [5.5, 95.3], [2.0, 99.0], [-2.0, 105.0], [-5.8, 106.0], [-4.0, 102.5],
  [0.0, 98.5], [4.0, 96.0], [5.5, 95.3]
];

const BORNEO_COAST: [number, number][] = [
  [7.0, 117.0], [4.5, 119.0], [1.0, 119.0], [-3.5, 116.0], [-4.0, 114.0],
  [-3.0, 110.0], [1.5, 109.0], [4.0, 114.0], [7.0, 117.0]
];

// 3. NORTH AMERICA
const NORTH_AMERICA_COAST: [number, number][] = [
  // Alaska & Canada Arctic
  [71.3, -156.5], [70.0, -140.0], [69.0, -135.0], [68.0, -120.0], [68.0, -90.0],
  [62.0, -92.0], [55.0, -82.0], [52.0, -80.0], [58.0, -78.0], [62.0, -74.0],
  [60.0, -65.0], [55.0, -60.0], [52.0, -56.0], [47.0, -53.0], [44.0, -64.0],
  // US East Coast
  [43.0, -70.5], [41.0, -72.0], [39.0, -74.5], [35.0, -75.5], [32.0, -80.5],
  [27.0, -80.0], [25.0, -80.5], [26.0, -82.0], [30.0, -84.0], [30.0, -88.0],
  [29.0, -90.0], [29.5, -94.5], [26.0, -97.0],
  // Mexico & Central America
  [22.0, -97.5], [19.0, -96.0], [18.5, -92.5], [21.5, -87.0], [19.0, -87.5],
  [16.0, -88.0], [15.0, -83.5], [11.0, -83.5], [9.0, -80.0], [8.0, -77.5],
  // Pacific side Central America & Mexico
  [7.5, -81.5], [9.0, -84.5], [13.5, -89.0], [16.0, -95.0], [18.0, -103.0],
  [23.0, -106.0], [28.0, -112.0], [32.0, -117.0],
  // US West Coast & Pacific NW
  [34.0, -120.0], [37.5, -122.5], [42.0, -124.5], [47.5, -124.5], [49.0, -123.0],
  [54.0, -130.0], [58.0, -136.0], [60.0, -145.0], [59.0, -153.0], [55.0, -162.0],
  [58.0, -158.0], [64.0, -165.0], [66.0, -168.0], [71.3, -156.5]
];

// Greenland
const GREENLAND_COAST: [number, number][] = [
  [83.0, -30.0], [81.0, -15.0], [75.0, -20.0], [70.0, -25.0], [65.0, -38.0],
  [60.0, -43.0], [65.0, -52.0], [72.0, -55.0], [78.0, -70.0], [82.0, -60.0],
  [83.0, -30.0]
];

// 4. SOUTH AMERICA
const SOUTH_AMERICA_COAST: [number, number][] = [
  [12.5, -71.5], [11.0, -63.0], [8.0, -59.0], [5.0, -52.0], [0.0, -50.0],
  [-3.0, -42.0], [-5.5, -35.0], [-10.0, -36.0], [-18.0, -39.0], [-23.0, -43.0],
  [-28.0, -48.5], [-35.0, -55.0], [-39.0, -62.0], [-45.0, -65.0], [-52.0, -68.0],
  [-55.0, -66.0], [-54.0, -72.0], [-48.0, -74.0], [-40.0, -73.5], [-30.0, -71.5],
  [-20.0, -70.0], [-15.0, -75.0], [-8.0, -79.0], [-3.0, -80.5], [1.0, -79.0],
  [5.0, -77.5], [8.5, -77.0], [10.0, -75.5], [12.5, -71.5]
];

// 5. AUSTRALIA & OCEANIA
const AUSTRALIA_COAST: [number, number][] = [
  [-11.0, 142.5], [-15.0, 145.0], [-21.0, 149.0], [-27.0, 153.5], [-34.0, 151.0],
  [-37.5, 150.0], [-38.5, 146.0], [-38.0, 141.0], [-35.0, 138.0], [-32.0, 132.0],
  [-33.0, 124.0], [-35.0, 118.0], [-34.0, 115.0], [-28.0, 114.0], [-22.0, 114.0],
  [-19.0, 119.0], [-15.0, 125.0], [-12.5, 131.0], [-12.0, 136.0], [-15.0, 137.0],
  [-15.0, 141.0], [-11.0, 142.5]
];

// New Zealand
const NZ_NORTH_COAST: [number, number][] = [
  [-35.0, 173.5], [-37.0, 175.5], [-39.0, 177.5], [-41.5, 175.0], [-39.0, 174.0],
  [-37.0, 174.5], [-35.0, 173.5]
];

const NZ_SOUTH_COAST: [number, number][] = [
  [-41.0, 173.0], [-43.5, 173.0], [-46.5, 169.0], [-46.0, 166.5], [-43.0, 170.0],
  [-41.0, 173.0]
];

// 6. ANTARCTICA
const ANTARCTICA_COAST: [number, number][] = [
  [-64.0, -60.0], [-66.0, -50.0], [-70.0, -30.0], [-72.0, 0.0], [-68.0, 30.0],
  [-66.0, 60.0], [-65.0, 90.0], [-66.0, 120.0], [-65.0, 150.0], [-72.0, 170.0],
  [-78.0, 180.0], [-78.0, -170.0], [-74.0, -140.0], [-72.0, -100.0], [-70.0, -80.0],
  [-64.0, -60.0]
];

// =========================================================================
// REALISTIC NATIONAL BORDER POLYLINES
// =========================================================================

// India National Boundary (High Precision)
const INDIA_BORDER: [number, number][] = [
  [35.5, 74.5], [37.0, 75.5], [36.0, 77.5], [34.5, 78.5], [33.0, 79.5],
  [31.5, 79.0], [30.5, 81.0], [28.0, 82.0], [27.5, 88.0], [28.0, 89.0],
  [27.0, 92.5], [28.2, 94.5], [28.5, 97.0], [27.0, 97.5], [25.0, 94.5],
  [24.0, 93.5], [22.0, 92.5], [21.5, 89.0], [22.5, 89.5], [21.5, 87.0],
  [19.8, 86.0], [17.7, 83.3], [15.8, 80.3], [13.1, 80.3], [10.8, 79.8],
  [9.3, 79.1], [8.1, 77.5], [8.8, 76.6], [11.5, 75.8], [15.4, 73.8],
  [19.0, 72.8], [20.9, 70.4], [22.3, 69.0], [23.5, 68.3], [24.5, 69.0],
  [24.5, 71.0], [26.0, 70.5], [28.0, 71.0], [30.0, 72.5], [31.5, 74.5],
  [33.0, 74.5], [34.5, 74.0], [35.5, 74.5]
];

// Key Indian State Boundaries
const INDIAN_STATES_INTERNAL: [number, number][][] = [
  // Telangana & Andhra Pradesh divide
  [[19.0, 78.0], [18.0, 79.5], [17.0, 80.5], [16.0, 80.0], [16.0, 78.5], [17.5, 77.5], [19.0, 78.0]],
  // Maharashtra divide
  [[21.5, 73.0], [21.0, 76.0], [21.5, 79.0], [20.0, 80.5], [18.0, 79.5], [17.5, 77.5], [16.0, 74.0]],
  // Karnataka divide
  [[16.0, 74.0], [17.5, 77.5], [15.0, 77.5], [13.0, 77.5], [12.0, 76.0], [13.0, 74.5]],
  // Tamil Nadu & Kerala divide
  [[13.0, 77.5], [11.0, 79.0], [9.0, 78.0], [8.5, 77.5], [10.0, 76.5], [12.0, 75.5]],
  // Northern India / Gangetic basin (UP / MP / Bihar / Bengal)
  [[26.0, 77.0], [25.0, 80.0], [24.0, 84.0], [25.0, 88.0]],
  [[28.0, 77.0], [26.0, 80.0], [26.0, 84.0], [26.0, 88.0]],
  // Rajasthan / Gujarat
  [[24.5, 71.0], [25.0, 73.5], [24.0, 75.0], [22.0, 74.0]]
];

// Major Indian Rivers
const INDIAN_RIVERS: [number, number][][] = [
  // Ganga River
  [[31.0, 79.0], [29.5, 78.5], [27.0, 80.5], [25.5, 82.5], [25.5, 85.5], [24.0, 88.0], [22.5, 89.5]],
  // Brahmaputra River
  [[29.0, 84.0], [29.5, 88.0], [28.0, 94.0], [26.5, 93.0], [26.0, 90.0], [24.0, 89.8]],
  // Godavari River
  [[19.9, 73.8], [19.0, 76.5], [18.5, 79.0], [17.0, 81.5], [16.5, 82.2]],
  // Krishna River
  [[18.0, 73.8], [16.5, 76.0], [16.0, 78.5], [16.0, 80.5], [15.8, 80.8]],
  // Narmada River
  [[22.7, 81.5], [22.8, 79.0], [22.0, 75.0], [21.7, 72.8]]
];

// Major Global Borders (Stylized GeoJSON equivalent)
const MAJOR_WORLD_BORDERS: [number, number][][] = [
  // US - Canada border (49th parallel + Great Lakes)
  [[49.0, -123.0], [49.0, -95.0], [48.0, -89.0], [45.0, -75.0], [45.0, -71.0], [47.0, -68.0]],
  // US - Mexico border
  [[32.5, -117.0], [31.5, -111.0], [31.3, -108.5], [31.8, -106.5], [29.0, -103.5], [26.0, -97.0]],
  // Europe - France / Spain (Pyrenees)
  [[43.4, -1.8], [42.5, 1.0], [42.4, 3.1]],
  // Europe - France / Germany / Italy (Alps & Rhine)
  [[44.0, 7.0], [46.0, 7.0], [47.5, 7.5], [49.0, 8.2], [50.5, 6.0]],
  // Europe - Poland / Germany (Oder-Neisse)
  [[54.0, 14.2], [52.0, 14.5], [50.8, 15.0]],
  // South America - Brazil / Argentina / Chile
  [[-22.0, -68.0], [-27.0, -69.0], [-35.0, -70.5], [-45.0, -71.5], [-52.0, -72.0]],
  [[-15.0, -58.0], [-22.0, -57.5], [-27.0, -54.0], [-30.0, -57.5], [-34.0, -58.0]],
  // Africa - North Africa borders (Sahara straight lines)
  [[32.0, -8.0], [27.5, -8.5], [24.0, -12.0]],
  [[37.0, 8.5], [32.0, 10.0], [23.5, 12.0]],
  [[31.5, 25.0], [22.0, 25.0], [22.0, 31.5]],
  // Asia - China / Russia / Mongolia
  [[50.0, 87.0], [48.0, 95.0], [45.0, 105.0], [47.0, 115.0], [50.0, 120.0]],
  [[53.5, 122.0], [50.0, 127.0], [48.0, 135.0], [43.0, 131.0]],
  // Middle East borders
  [[30.0, 35.0], [30.0, 38.0], [32.0, 39.0], [34.0, 42.0], [37.0, 44.0]],
  [[30.0, 48.0], [32.5, 46.0], [37.0, 44.5]],
  // Australia state lines (stylized internal graticule)
  [[-26.0, 129.0], [-26.0, 138.0], [-26.0, 141.0]],
  [[-38.0, 141.0], [-26.0, 141.0]]
];

/**
 * Generate a complete, high-resolution World Map texture canvas
 */
export function generateWorldMapCanvas(options: WorldMapOptions = {}): HTMLCanvasElement {
  const width = options.width || 2048;
  const height = options.height || 1024;
  const showGraticule = options.showGraticule !== false;
  const showBorders = options.showCountryBorders !== false;
  const showLabels = options.showLabels !== false;
  const showRivers = options.showRivers !== false;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. DEEP OCEAN BASE GRADIENT (Command Center Navy)
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0.0, '#040b18'); // Arctic dark
  oceanGrad.addColorStop(0.2, '#061326'); // North temperate ocean
  oceanGrad.addColorStop(0.5, '#081730'); // Tropical equatorial ocean
  oceanGrad.addColorStop(0.8, '#061326'); // South temperate ocean
  oceanGrad.addColorStop(1.0, '#040b18'); // Antarctic dark
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle ocean bathymetry texture (subsea ridges & currents)
  ctx.fillStyle = 'rgba(14, 116, 144, 0.04)';
  for (let y = 0; y < height; y += 16) {
    ctx.fillRect(0, y, width, 1);
  }

  // 2. CONTINENTAL LANDMASSES (Dark Charcoal Slate with Subtle Neon Elevation)
  const continentColor = '#142035';
  const continentCoastlineColor = '#0284c7'; // Vibrant cyan-blue coastline
  const shelfColor = 'rgba(56, 189, 248, 0.12)';

  // Draw continental shelf glow first
  [
    AFRICA_COAST, EURASIA_COAST, NORTH_AMERICA_COAST,
    SOUTH_AMERICA_COAST, AUSTRALIA_COAST, GREENLAND_COAST,
    MADAGASCAR_COAST, BRITAIN_COAST, JAPAN_COAST
  ].forEach((poly) => {
    drawGeoPolygon(ctx, poly, width, height, shelfColor, undefined, 4);
  });

  // Draw main continents
  drawGeoPolygon(ctx, AFRICA_COAST, width, height, continentColor, continentCoastlineColor, 1.5);
  drawGeoPolygon(ctx, MADAGASCAR_COAST, width, height, continentColor, continentCoastlineColor, 1.2);
  drawGeoPolygon(ctx, EURASIA_COAST, width, height, continentColor, continentCoastlineColor, 1.5);
  drawGeoPolygon(ctx, BRITAIN_COAST, width, height, continentColor, continentCoastlineColor, 1.2);
  drawGeoPolygon(ctx, IRELAND_COAST, width, height, continentColor, continentCoastlineColor, 1.0);
  drawGeoPolygon(ctx, JAPAN_COAST, width, height, continentColor, continentCoastlineColor, 1.2);
  drawGeoPolygon(ctx, SRI_LANKA_COAST, width, height, '#0d9488', '#14b8a6', 1.5);
  drawGeoPolygon(ctx, SUMATRA_COAST, width, height, continentColor, continentCoastlineColor, 1.2);
  drawGeoPolygon(ctx, BORNEO_COAST, width, height, continentColor, continentCoastlineColor, 1.2);
  drawGeoPolygon(ctx, NORTH_AMERICA_COAST, width, height, continentColor, continentCoastlineColor, 1.5);
  drawGeoPolygon(ctx, GREENLAND_COAST, width, height, '#1e2d42', '#38bdf8', 1.2);
  drawGeoPolygon(ctx, SOUTH_AMERICA_COAST, width, height, continentColor, continentCoastlineColor, 1.5);
  drawGeoPolygon(ctx, AUSTRALIA_COAST, width, height, continentColor, continentCoastlineColor, 1.5);
  drawGeoPolygon(ctx, NZ_NORTH_COAST, width, height, continentColor, continentCoastlineColor, 1.0);
  drawGeoPolygon(ctx, NZ_SOUTH_COAST, width, height, continentColor, continentCoastlineColor, 1.0);
  drawGeoPolygon(ctx, ANTARCTICA_COAST, width, height, '#1a273b', '#60a5fa', 1.2);

  // 3. HIGHLIGHT INDIA (National Priority Focus for SIH 26069)
  // Deep teal fill with neon cyan borders
  drawGeoPolygon(ctx, INDIA_BORDER, width, height, 'rgba(8, 145, 178, 0.45)', '#38bdf8', 2.5);

  // Indian Internal State Boundaries
  if (showBorders) {
    INDIAN_STATES_INTERNAL.forEach((stateBorder) => {
      drawGeoPolyline(ctx, stateBorder, width, height, 'rgba(56, 189, 248, 0.55)', 1.2, [4, 4]);
    });
  }

  // Major Indian Rivers
  if (showRivers) {
    INDIAN_RIVERS.forEach((river) => {
      drawGeoPolyline(ctx, river, width, height, 'rgba(6, 182, 212, 0.75)', 1.5);
    });
  }

  // Indian Metropolises glow dots
  const indianMetros: { name: string; lat: number; lon: number }[] = [
    { name: 'NEW DELHI', lat: 28.6139, lon: 77.2090 },
    { name: 'MUMBAI', lat: 19.0760, lon: 72.8777 },
    { name: 'HYDERABAD', lat: 17.3850, lon: 78.4867 },
    { name: 'BENGALURU', lat: 12.9716, lon: 77.5946 },
    { name: 'CHENNAI', lat: 13.0827, lon: 80.2707 },
    { name: 'KOLKATA', lat: 22.5726, lon: 88.3639 },
    { name: 'GUWAHATI', lat: 26.1445, lon: 91.7362 },
  ];

  indianMetros.forEach((metro) => {
    const [mx, my] = latLonToCanvas(metro.lat, metro.lon, width, height);
    // Outer pulse ring
    ctx.beginPath();
    ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.fill();
    // Core dot
    ctx.beginPath();
    ctx.arc(mx, my, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // City label
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#e0f2fe';
    ctx.fillText(metro.name, mx + 6, my + 3);
  });

  // 4. GLOBAL NATIONAL BORDERS
  if (showBorders) {
    MAJOR_WORLD_BORDERS.forEach((border) => {
      drawGeoPolyline(ctx, border, width, height, 'rgba(56, 189, 248, 0.35)', 1.0, [3, 3]);
    });
  }

  // 5. GEOGRAPHIC COORDINATE GRATICULE (Equator, Tropics, Meridians)
  if (showGraticule) {
    // Equator (0° Latitude)
    const [, eqY] = latLonToCanvas(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, eqY);
    ctx.lineTo(width, eqY);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Tropic of Cancer (23.5° N)
    const [, canY] = latLonToCanvas(23.5, 0, width, height);
    ctx.beginPath();
    ctx.setLineDash([6, 6]);
    ctx.moveTo(0, canY);
    ctx.lineTo(width, canY);
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.45)'; // Amber
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Tropic of Capricorn (23.5° S)
    const [, capY] = latLonToCanvas(-23.5, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, capY);
    ctx.lineTo(width, capY);
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.45)'; // Amber
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Arctic Circle (66.5° N) & Antarctic Circle (66.5° S)
    const [, arcY] = latLonToCanvas(66.5, 0, width, height);
    const [, antY] = latLonToCanvas(-66.5, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, arcY);
    ctx.lineTo(width, arcY);
    ctx.moveTo(0, antY);
    ctx.lineTo(width, antY);
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.3)';
    ctx.stroke();
    ctx.setLineDash([]);

    // Meridians every 30 degrees
    for (let lon = -180; lon <= 180; lon += 30) {
      const [mx] = latLonToCanvas(0, lon, width, height);
      ctx.beginPath();
      ctx.moveTo(mx, 0);
      ctx.lineTo(mx, height);
      if (lon === 0) {
        // Prime Meridian (Greenwich)
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.lineWidth = 0.8;
      }
      ctx.stroke();

      // Degree labels along Equator
      if (lon % 60 === 0 && lon !== 180) {
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        const label = lon === 0 ? '0°' : lon > 0 ? `${lon}°E` : `${Math.abs(lon)}°W`;
        ctx.fillText(label, mx + 4, eqY - 4);
      }
    }

    // Parallels every 30 degrees
    for (let lat = -60; lat <= 60; lat += 30) {
      if (lat === 0) continue;
      const [, py] = latLonToCanvas(lat, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Degree label on Prime Meridian
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      const label = lat > 0 ? `${lat}°N` : `${Math.abs(lat)}°S`;
      const [pmX] = latLonToCanvas(0, 0, width, height);
      ctx.fillText(label, pmX + 4, py - 3);
    }

    // Equator Label
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.fillText('EQUATOR (0°)', 24, eqY - 6);
    ctx.fillText('TROPIC OF CANCER (23.5°N)', 24, canY - 6);
    ctx.fillText('TROPIC OF CAPRICORN (23.5°S)', 24, capY - 6);
  }

  // 6. CONTINENTAL & OCEAN LABELS
  if (showLabels) {
    ctx.font = 'bold 13px "Inter", sans-serif';
    ctx.textAlign = 'center';

    // Continents
    ctx.fillStyle = 'rgba(203, 213, 225, 0.65)';
    const continentLabels = [
      { name: 'NORTH AMERICA', lat: 45.0, lon: -100.0 },
      { name: 'SOUTH AMERICA', lat: -15.0, lon: -60.0 },
      { name: 'EUROPE', lat: 50.0, lon: 15.0 },
      { name: 'AFRICA', lat: 5.0, lon: 20.0 },
      { name: 'ASIA', lat: 48.0, lon: 85.0 },
      { name: 'AUSTRALIA', lat: -25.0, lon: 133.0 },
      { name: 'ANTARCTICA', lat: -78.0, lon: 0.0 },
    ];

    continentLabels.forEach((c) => {
      const [lx, ly] = latLonToCanvas(c.lat, c.lon, width, height);
      ctx.fillText(c.name, lx, ly);
    });

    // Oceans (Italicized deep cyan)
    ctx.font = 'italic 12px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    const oceanLabels = [
      { name: 'ATLANTIC OCEAN', lat: 20.0, lon: -35.0 },
      { name: 'PACIFIC OCEAN', lat: 10.0, lon: -150.0 },
      { name: 'INDIAN OCEAN', lat: -15.0, lon: 75.0 },
      { name: 'ARCTIC OCEAN', lat: 80.0, lon: 0.0 },
      { name: 'SOUTHERN OCEAN', lat: -58.0, lon: 70.0 },
      { name: 'ARABIAN SEA', lat: 16.0, lon: 65.0 },
      { name: 'BAY OF BENGAL', lat: 15.0, lon: 88.0 },
    ];

    oceanLabels.forEach((o) => {
      const [lx, ly] = latLonToCanvas(o.lat, o.lon, width, height);
      ctx.fillText(o.name, lx, ly);
    });

    ctx.textAlign = 'left';
  }

  return canvas;
}

/**
 * Generate a transparent overlay canvas with country borders, Indian state lines, and graticule
 * Designed to overlay seamlessly on top of real satellite Earth imagery
 */
export function generateBordersOverlayCanvas(options: WorldMapOptions = {}): HTMLCanvasElement {
  const width = options.width || 2048;
  const height = options.height || 1024;
  const showGraticule = options.showGraticule !== false;
  const showBorders = options.showCountryBorders !== false;
  const showRivers = options.showRivers !== false;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, width, height);

  // 1. HIGHLIGHT INDIA BORDER & STATES
  drawGeoPolygon(ctx, INDIA_BORDER, width, height, 'rgba(8, 145, 178, 0.22)', '#38bdf8', 2.2);

  if (showBorders) {
    INDIAN_STATES_INTERNAL.forEach((stateBorder) => {
      drawGeoPolyline(ctx, stateBorder, width, height, 'rgba(56, 189, 248, 0.65)', 1.2, [4, 4]);
    });
  }

  if (showRivers) {
    INDIAN_RIVERS.forEach((river) => {
      drawGeoPolyline(ctx, river, width, height, 'rgba(6, 182, 212, 0.75)', 1.5);
    });
  }

  // Indian Metros
  const indianMetros: { name: string; lat: number; lon: number }[] = [
    { name: 'NEW DELHI', lat: 28.6139, lon: 77.2090 },
    { name: 'MUMBAI', lat: 19.0760, lon: 72.8777 },
    { name: 'HYDERABAD', lat: 17.3850, lon: 78.4867 },
    { name: 'BENGALURU', lat: 12.9716, lon: 77.5946 },
    { name: 'CHENNAI', lat: 13.0827, lon: 80.2707 },
    { name: 'KOLKATA', lat: 22.5726, lon: 88.3639 },
    { name: 'GUWAHATI', lat: 26.1445, lon: 91.7362 },
  ];

  indianMetros.forEach((metro) => {
    const [mx, my] = latLonToCanvas(metro.lat, metro.lon, width, height);
    ctx.beginPath();
    ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(mx, my, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(metro.name, mx + 6, my + 3);
    ctx.shadowBlur = 0;
  });

  // 2. GLOBAL COUNTRY BORDERS
  if (showBorders) {
    MAJOR_WORLD_BORDERS.forEach((border) => {
      drawGeoPolyline(ctx, border, width, height, 'rgba(56, 189, 248, 0.45)', 1.2, [4, 4]);
    });
  }

  // 3. GRATICULE LINES
  if (showGraticule) {
    const [, eqY] = latLonToCanvas(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, eqY);
    ctx.lineTo(width, eqY);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const [, canY] = latLonToCanvas(23.5, 0, width, height);
    const [, capY] = latLonToCanvas(-23.5, 0, width, height);
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(0, canY);
    ctx.lineTo(width, canY);
    ctx.moveTo(0, capY);
    ctx.lineTo(width, capY);
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.4)';
    ctx.lineWidth = 1.0;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  return canvas;
}
