import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  WeatherEvent,
  CityScene,
  Building3D,
  RoadSegment,
  SimulatedVehicle,
  WeatherLayer,
  CityLayer,
  TimeStep,
  ViewScale,
} from '../../types/weather';
import { WEATHER_TYPE_EMOJI_MAP, SEVERITY_COLOR_MAP } from '../../data/weatherEvents';
import { generateBordersOverlayCanvas } from '../../utils/worldMapGenerator';
import { CITIES_DATA } from '../../data/cities';

interface ThreeGlobeCityProps {
  weatherEvents: WeatherEvent[];
  selectedEvent: WeatherEvent | null;
  activeCity: CityScene | null;
  viewScale: ViewScale;
  weatherLayers: WeatherLayer[];
  cityLayers: CityLayer[];
  timeStep: TimeStep;
  isDemoMode: boolean;
  onSelectEvent: (event: WeatherEvent) => void;
  onExploreCity: (city: CityScene) => void;
  onInspectBuilding: (building: Building3D | null) => void;
  onInspectRoad: (road: RoadSegment | null) => void;
  onReturnToIndia: () => void;
  onReturnToGlobal: () => void;
  isTransitioning: boolean;
  setIsTransitioning: (val: boolean) => void;
}

// Convert Lat/Lon to 3D Cartesian coordinates on sphere
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export const ThreeGlobeCity: React.FC<ThreeGlobeCityProps> = ({
  weatherEvents,
  selectedEvent,
  activeCity,
  viewScale,
  weatherLayers,
  cityLayers,
  timeStep,
  isDemoMode,
  onSelectEvent,
  onExploreCity,
  onInspectBuilding,
  onInspectRoad,
  onReturnToIndia,
  onReturnToGlobal,
  isTransitioning,
  setIsTransitioning,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // References to Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Scene group hierarchies
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const cityGroupRef = useRef<THREE.Group | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const bordersMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const heatmapTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const rainParticlesRef = useRef<THREE.Points | null>(null);
  const floodWaterMeshRef = useRef<THREE.Mesh | null>(null);
  const vehiclesRef = useRef<{ mesh: THREE.Mesh; data: SimulatedVehicle }[]>([]);
  const buildingMeshesRef = useRef<{ mesh: THREE.Mesh; data: Building3D }[]>([]);
  const roadMeshesRef = useRef<{ mesh: THREE.Mesh; data: RoadSegment }[]>([]);
  const lightningLightRef = useRef<THREE.PointLight | null>(null);

  // Interaction & Camera animation states
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const cameraTarget = useRef<THREE.Vector3>(new THREE.Vector3(-8, 17, 45));
  const cameraPositionTarget = useRef<THREE.Vector3>(new THREE.Vector3(-8, 30, 110));
  const isAutoRotating = useRef(true);
  const lastInteractionTime = useRef(Date.now());
  const hoveredMarkerRef = useRef<string | null>(null);

  // Click Raycasting
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Local state for UI preview popup over globe
  const [previewEvent, setPreviewEvent] = useState<WeatherEvent | null>(null);
  const [previewScreenPos, setPreviewScreenPos] = useState<{ x: number; y: number } | null>(null);

  // 1. Generate Dynamic India & Regional Weather Heatmap Canvas
  const updateHeatmapCanvas = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Transparent background
    ctx.clearRect(0, 0, 2048, 1024);

    // Render weather radial gradients directly on equirectangular coordinate positions
    weatherEvents.forEach((ev) => {
      const cx = ((ev.longitude + 180) / 360) * 2048;
      const cy = ((90 - ev.latitude) / 180) * 1024;

      // Adjust severity based on time machine
      let intensity = ev.rainfall;
      if (timeStep > 0) {
        intensity = timeStep <= 6 ? ev.prediction.next_6h_rain : ev.prediction.next_24h_rain;
      } else if (timeStep < 0) {
        intensity = Math.max(10, ev.rainfall * 0.75);
      }

      const radius = 35 + Math.min(65, intensity * 0.65);
      const gradient = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius);

      if (weatherLayers.includes('rainfall')) {
        if (ev.severity === 'extreme') {
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
          gradient.addColorStop(0.4, 'rgba(249, 115, 22, 0.6)');
          gradient.addColorStop(0.7, 'rgba(234, 179, 8, 0.35)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        } else if (ev.severity === 'high') {
          gradient.addColorStop(0, 'rgba(249, 115, 22, 0.8)');
          gradient.addColorStop(0.5, 'rgba(234, 179, 8, 0.45)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        } else if (ev.severity === 'moderate') {
          gradient.addColorStop(0, 'rgba(234, 179, 8, 0.75)');
          gradient.addColorStop(0.6, 'rgba(16, 185, 129, 0.4)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.65)');
          gradient.addColorStop(0.7, 'rgba(16, 185, 129, 0.25)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        }
      } else if (weatherLayers.includes('temperature')) {
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        gradient.addColorStop(0.6, 'rgba(245, 158, 11, 0.35)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      } else if (weatherLayers.includes('wind') || weatherLayers.includes('cyclone')) {
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.85)');
        gradient.addColorStop(0.5, 'rgba(14, 165, 233, 0.45)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.7)');
        gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.35)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    return canvas;
  }, [weatherEvents, weatherLayers, timeStep]);

  // 2. Initialize Three.js Scene, Camera, Lighting, and Meshes
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050914);
    scene.fog = new THREE.FogExp2(0x050914, 0.0018);
    sceneRef.current = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    // Initial camera position focused on India & South Asia
    camera.position.set(25, 45, 135);
    camera.lookAt(0, 10, 0);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    containerRef.current.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xd5e2ff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(150, 120, 120);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 400;
    sunLight.shadow.camera.left = -120;
    sunLight.shadow.camera.right = 120;
    sunLight.shadow.camera.top = 120;
    sunLight.shadow.camera.bottom = -120;
    scene.add(sunLight);

    // Atmospheric secondary light
    const skyLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.9);
    scene.add(skyLight);

    // Lightning Flash Light (for storms)
    const lightningLight = new THREE.PointLight(0x93c5fd, 0, 300, 1.5);
    lightningLight.position.set(0, 90, 0);
    scene.add(lightningLight);
    lightningLightRef.current = lightningLight;

    // ==========================================
    // 3. CREATE 3D GLOBE (REAL SATELLITE EARTH WORLD MAP)
    // ==========================================
    const globeGroup = new THREE.Group();
    // Rotate by Math.PI so India & South Asia face the camera (+Z)
    globeGroup.rotation.y = Math.PI;
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const globeRadius = 50;

    const textureLoader = new THREE.TextureLoader();

    // 1. Real Satellite Earth Daymap Texture (NASA Blue Marble)
    const earthDayTexture = textureLoader.load('/textures/earth_daymap.jpg');
    earthDayTexture.colorSpace = THREE.SRGBColorSpace;

    // 2. Real Specular Map (Ocean specular highlight, matte land)
    const earthSpecularTexture = textureLoader.load('/textures/earth_specular.jpg');

    const earthGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthDayTexture,
      roughnessMap: earthSpecularTexture,
      roughness: 0.65,
      metalness: 0.08,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // 3. Transparent Country Borders & National Grid Overlay Mesh
    const bordersCanvas = generateBordersOverlayCanvas({
      width: 2048,
      height: 1024,
      showGraticule: weatherLayers.includes('world_borders'),
      showCountryBorders: weatherLayers.includes('world_borders'),
      showRivers: true,
    });
    const bordersTexture = new THREE.CanvasTexture(bordersCanvas);
    const bordersGeo = new THREE.SphereGeometry(globeRadius * 1.002, 64, 64);
    const bordersMat = new THREE.MeshBasicMaterial({
      map: bordersTexture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const bordersMesh = new THREE.Mesh(bordersGeo, bordersMat);
    bordersMesh.visible = weatherLayers.includes('world_borders');
    globeGroup.add(bordersMesh);
    bordersMeshRef.current = bordersMesh;

    // 4. Atmospheric Glow Outer Shell
    const atmosphereGeometry = new THREE.SphereGeometry(globeRadius * 1.025, 48, 48);
    const atmosphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      roughness: 0.2,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphereMesh);

    // 5. Real Satellite Atmospheric Clouds Layer Mesh
    const earthCloudsTexture = textureLoader.load('/textures/earth_clouds.jpg');
    const cloudsGeo = new THREE.SphereGeometry(globeRadius * 1.012, 64, 64);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: earthCloudsTexture,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    cloudsMesh.visible = weatherLayers.includes('clouds');
    globeGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // 6. Weather Heatmap Mesh on Globe
    const heatmapCanvas = updateHeatmapCanvas();
    if (heatmapCanvas) {
      const heatmapTexture = new THREE.CanvasTexture(heatmapCanvas);
      heatmapTextureRef.current = heatmapTexture;

      const heatmapGeometry = new THREE.SphereGeometry(globeRadius * 1.006, 64, 64);
      const heatmapMaterial = new THREE.MeshBasicMaterial({
        map: heatmapTexture,
        transparent: true,
        opacity: 0.88,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      const heatmapMesh = new THREE.Mesh(heatmapGeometry, heatmapMaterial);
      globeGroup.add(heatmapMesh);
    }

    // 7. 3D Weather Event Markers Group on Globe
    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // ==========================================
    // 4. CREATE 3D CITY ENVIRONMENT (URBAN SCENE)
    // ==========================================
    const cityGroup = new THREE.Group();
    cityGroup.position.set(0, 0, 0);
    cityGroup.visible = false;
    scene.add(cityGroup);
    cityGroupRef.current = cityGroup;

    // Clean ground plane
    const groundGeo = new THREE.PlaneGeometry(400, 400, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x090f1d,
      roughness: 0.85,
      metalness: 0.15,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    cityGroup.add(groundMesh);

    // Localized Flood Water Plane
    const waterGeo = new THREE.PlaneGeometry(360, 360, 32, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      metalness: 0.6,
      depthWrite: false,
    });
    const floodWater = new THREE.Mesh(waterGeo, waterMat);
    floodWater.rotation.x = -Math.PI / 2;
    floodWater.position.y = 1.2;
    floodWater.receiveShadow = true;
    cityGroup.add(floodWater);
    floodWaterMeshRef.current = floodWater;

    // Local Weather Rain Particle System
    const rainCount = 4500;
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 240;
      rainPositions[i * 3 + 1] = Math.random() * 120 + 2;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 240;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.75,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const rainParticles = new THREE.Points(rainGeo, rainMat);
    cityGroup.add(rainParticles);
    rainParticlesRef.current = rainParticles;

    // Local Event Zone Dome (Translucent boundary)
    const domeGeo = new THREE.SphereGeometry(85, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.12,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    const eventDome = new THREE.Mesh(domeGeo, domeMat);
    eventDome.name = 'event-dome';
    cityGroup.add(eventDome);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Auto-rotation of Globe when idle in Global/India mode
      if (
        (viewScale === 'global' || viewScale === 'india') &&
        isAutoRotating.current &&
        Date.now() - lastInteractionTime.current > 3500 &&
        globeGroupRef.current
      ) {
        globeGroupRef.current.rotation.y += 0.0012;
      }

      // Rotate Clouds Layer slightly faster than base Earth for atmospheric depth
      if (cloudsMeshRef.current && globeGroupRef.current?.visible) {
        cloudsMeshRef.current.rotation.y += 0.0006;
      }

      // Smooth Camera Interpolation
      if (cameraRef.current) {
        cameraRef.current.position.lerp(cameraPositionTarget.current, 0.065);
        cameraRef.current.lookAt(cameraTarget.current);
      }

      // Rain Particle Animation in City View
      if (rainParticlesRef.current && cityGroupRef.current?.visible) {
        const positions = rainParticlesRef.current.geometry.attributes.position.array as Float32Array;
        const rainSpeed = 75 * delta;
        for (let i = 0; i < rainCount; i++) {
          positions[i * 3 + 1] -= rainSpeed;
          // Slant rain slightly for wind
          positions[i * 3] += 12 * delta;
          if (positions[i * 3 + 1] < 1) {
            positions[i * 3 + 1] = 110 + Math.random() * 15;
            positions[i * 3] = (Math.random() - 0.5) * 240;
          }
        }
        rainParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Dynamic Simulated Traffic Animation in City View
      vehiclesRef.current.forEach((veh) => {
        const v = veh.data;
        v.progress = (v.progress + v.speed * delta) % 1;
        const road = activeCity?.roads.find((r) => r.id === v.roadId);
        if (road) {
          const t = v.reverse ? 1 - v.progress : v.progress;
          const currX = THREE.MathUtils.lerp(road.startX, road.endX, t);
          const currZ = THREE.MathUtils.lerp(road.startZ, road.endZ, t) + v.lane * 1.6;
          veh.mesh.position.set(currX, 0.8, currZ);
        }
      });

      // Periodic Lightning Flashes (for thunderstorm events)
      if (lightningLightRef.current && cityGroupRef.current?.visible) {
        if (Math.random() < 0.015) {
          lightningLightRef.current.intensity = 18;
          lightningLightRef.current.position.set((Math.random() - 0.5) * 120, 80, (Math.random() - 0.5) * 120);
        } else {
          lightningLightRef.current.intensity = THREE.MathUtils.lerp(lightningLightRef.current.intensity, 0, 0.2);
        }
      }

      // Water Ripple Animation
      if (floodWaterMeshRef.current && cityGroupRef.current?.visible) {
        floodWaterMeshRef.current.position.y = 1.4 + Math.sin(elapsedTime * 2.2) * 0.15;
      }

      // Render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  // Update Dynamic Weather Event Markers on Globe
  useEffect(() => {
    if (!markersGroupRef.current) return;
    markersGroupRef.current.clear();

    const globeRadius = 50;

    weatherEvents.forEach((ev) => {
      const pos = latLonToVector3(ev.latitude, ev.longitude, globeRadius * 1.015);
      const markerObj = new THREE.Group();
      markerObj.position.copy(pos);
      markerObj.userData = { eventId: ev.event_id, event: ev };

      // Base severity color
      const colorHex = SEVERITY_COLOR_MAP[ev.severity]?.hex || '#38bdf8';
      const threeColor = new THREE.Color(colorHex);

      // Vertical beacon pin
      const pinGeo = new THREE.CylinderGeometry(0.3, 0.1, 4.5, 8);
      const pinMat = new THREE.MeshBasicMaterial({ color: threeColor });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
      pinMesh.position.copy(pos.clone().normalize().multiplyScalar(2.2));
      markerObj.add(pinMesh);

      // Pulsing Outer Ring
      const ringGeo = new THREE.RingGeometry(1.2, 1.8, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: threeColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.lookAt(pos.clone().multiplyScalar(2));
      markerObj.add(ringMesh);

      // Canvas Sprite for Weather Emoji & City Label
      const spriteCanvas = document.createElement('canvas');
      spriteCanvas.width = 256;
      spriteCanvas.height = 128;
      const sCtx = spriteCanvas.getContext('2d');
      if (sCtx) {
        sCtx.clearRect(0, 0, 256, 128);

        // Background chip
        sCtx.fillStyle = 'rgba(7, 13, 24, 0.85)';
        sCtx.strokeStyle = colorHex;
        sCtx.lineWidth = 3;
        sCtx.beginPath();
        sCtx.roundRect(10, 10, 236, 108, 16);
        sCtx.fill();
        sCtx.stroke();

        // Weather Emoji
        sCtx.font = '36px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
        sCtx.textAlign = 'center';
        sCtx.textBaseline = 'middle';
        sCtx.fillText(WEATHER_TYPE_EMOJI_MAP[ev.event_type] || '🌧️', 52, 64);

        // City & Rainfall Text
        sCtx.fillStyle = '#ffffff';
        sCtx.font = 'bold 22px "Inter", sans-serif';
        sCtx.textAlign = 'left';
        sCtx.fillText(ev.city, 90, 50);

        sCtx.fillStyle = colorHex;
        sCtx.font = '18px "JetBrains Mono", monospace';
        sCtx.fillText(`${ev.rainfall} mm · ${ev.severity.toUpperCase()}`, 90, 80);
      }

      const spriteTexture = new THREE.CanvasTexture(spriteCanvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: spriteTexture,
        transparent: true,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(12, 6, 1);
      sprite.position.copy(pos.clone().normalize().multiplyScalar(5.5));
      markerObj.add(sprite);

      markersGroupRef.current?.add(markerObj);
    });
  }, [weatherEvents]);

  // Update Dynamic India Heatmap when layers or time change
  useEffect(() => {
    if (!heatmapTextureRef.current) return;
    const canvas = updateHeatmapCanvas();
    if (canvas) {
      heatmapTextureRef.current.image = canvas;
      heatmapTextureRef.current.needsUpdate = true;
    }
  }, [updateHeatmapCanvas]);

  // Update borders overlay and clouds visibility when layers change
  useEffect(() => {
    if (bordersMeshRef.current) {
      bordersMeshRef.current.visible = weatherLayers.includes('world_borders');
    }
    if (cloudsMeshRef.current) {
      cloudsMeshRef.current.visible = weatherLayers.includes('clouds');
    }
  }, [weatherLayers]);

  // Update 3D City Meshes when activeCity changes
  useEffect(() => {
    if (!cityGroupRef.current) return;

    // Clear old city objects
    buildingMeshesRef.current = [];
    roadMeshesRef.current = [];
    vehiclesRef.current = [];

    // Remove old dynamic children except ground, water, rain, dome
    const preserveNames = ['event-dome'];
    const toRemove: THREE.Object3D[] = [];
    cityGroupRef.current.children.forEach((child) => {
      if (
        child !== floodWaterMeshRef.current &&
        child !== rainParticlesRef.current &&
        !preserveNames.includes(child.name) &&
        !(child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry && child.position.y === 0)
      ) {
        toRemove.push(child);
      }
    });
    toRemove.forEach((c) => cityGroupRef.current?.remove(c));

    if (!activeCity) return;

    // 1. Build Roads
    activeCity.roads.forEach((road) => {
      const dx = road.endX - road.startX;
      const dz = road.endZ - road.startZ;
      const length = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);

      const roadGeo = new THREE.PlaneGeometry(road.width, length);
      const roadMat = new THREE.MeshStandardMaterial({
        color:
          road.flood_risk === 'extreme'
            ? 0xef4444
            : road.flood_risk === 'high'
            ? 0xf97316
            : road.flood_risk === 'moderate'
            ? 0xeab308
            : 0x1e293b,
        roughness: 0.9,
      });
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      roadMesh.rotation.x = -Math.PI / 2;
      roadMesh.rotation.z = -angle;
      roadMesh.position.set((road.startX + road.endX) / 2, 0.08, (road.startZ + road.endZ) / 2);
      roadMesh.receiveShadow = true;
      roadMesh.userData = { roadData: road };
      cityGroupRef.current?.add(roadMesh);
      roadMeshesRef.current.push({ mesh: roadMesh, data: road });

      // Add center dashed lane line
      const lineGeo = new THREE.PlaneGeometry(0.35, length);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.rotation.x = -Math.PI / 2;
      lineMesh.rotation.z = -angle;
      lineMesh.position.set((road.startX + road.endX) / 2, 0.1, (road.startZ + road.endZ) / 2);
      cityGroupRef.current?.add(lineMesh);
    });

    // 2. Build 3D Buildings
    activeCity.buildings.forEach((bld) => {
      const bldGeo = new THREE.BoxGeometry(bld.width, bld.height, bld.depth);

      // Window illumination texture
      let bldColor = 0x1e293b;
      if (bld.occupancy_type === 'Hospital') bldColor = 0x0284c7;
      if (bld.occupancy_type === 'Government') bldColor = 0x334155;
      if (bld.flood_risk === 'extreme') bldColor = 0x7f1d1d;

      const bldMat = new THREE.MeshStandardMaterial({
        color: bldColor,
        roughness: 0.45,
        metalness: 0.25,
      });

      const bldMesh = new THREE.Mesh(bldGeo, bldMat);
      bldMesh.position.set(bld.x, bld.height / 2, bld.z);
      bldMesh.castShadow = true;
      bldMesh.receiveShadow = true;
      bldMesh.userData = { buildingData: bld };
      cityGroupRef.current?.add(bldMesh);
      buildingMeshesRef.current.push({ mesh: bldMesh, data: bld });

      // Rooftop details (Helipad, HVAC or communication tower)
      if (bld.height > 75) {
        const spireGeo = new THREE.CylinderGeometry(0.4, 0.8, 12, 6);
        const spireMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const spireMesh = new THREE.Mesh(spireGeo, spireMat);
        spireMesh.position.set(bld.x, bld.height + 6, bld.z);
        cityGroupRef.current?.add(spireMesh);
      }
    });

    // 3. Populate Simulated 3D Traffic
    const vehicles: { mesh: THREE.Mesh; data: SimulatedVehicle }[] = [];
    activeCity.roads.forEach((road, idx) => {
      // 2 cars per road
      for (let c = 0; c < 2; c++) {
        const isEmergency = c === 0 && idx % 3 === 0;
        const carGeo = new THREE.BoxGeometry(2.4, 1.2, 4.2);
        const carMat = new THREE.MeshStandardMaterial({
          color: isEmergency ? 0xef4444 : c % 2 === 0 ? 0x38bdf8 : 0xf1f5f9,
          roughness: 0.3,
          metalness: 0.8,
        });
        const carMesh = new THREE.Mesh(carGeo, carMat);
        carMesh.castShadow = true;
        cityGroupRef.current?.add(carMesh);

        vehicles.push({
          mesh: carMesh,
          data: {
            id: `veh-${idx}-${c}`,
            roadId: road.id,
            progress: Math.random(),
            speed: isEmergency ? 0.08 : 0.04 + Math.random() * 0.02,
            type: isEmergency ? 'emergency' : 'car',
            lane: c === 0 ? 1 : -1,
            reverse: c % 2 === 1,
          },
        });
      }
    });
    vehiclesRef.current = vehicles;

    // 4. Update Event Zone Dome Color
    const dome = cityGroupRef.current?.getObjectByName('event-dome') as THREE.Mesh;
    if (dome) {
      const ev = weatherEvents.find((e) => e.city === activeCity.cityName);
      const sevColor = ev ? SEVERITY_COLOR_MAP[ev.severity].hex : '#f97316';
      (dome.material as THREE.MeshBasicMaterial).color.set(sevColor);
    }
  }, [activeCity, weatherEvents]);

  // Handle ViewScale Transitions (Camera positions)
  useEffect(() => {
    if (viewScale === 'global') {
      if (globeGroupRef.current) globeGroupRef.current.visible = true;
      if (cityGroupRef.current) cityGroupRef.current.visible = false;
      cameraPositionTarget.current.set(0, 35, 175);
      cameraTarget.current.set(0, 0, 0);
    } else if (viewScale === 'india') {
      if (globeGroupRef.current) globeGroupRef.current.visible = true;
      if (cityGroupRef.current) cityGroupRef.current.visible = false;
      // Closer zoom into India / South Asia
      cameraPositionTarget.current.set(-8, 30, 105);
      cameraTarget.current.set(-8, 17, 45);
    } else if (viewScale === 'city') {
      if (globeGroupRef.current) globeGroupRef.current.visible = false;
      if (cityGroupRef.current) cityGroupRef.current.visible = true;
      // High-angle city overview
      cameraPositionTarget.current.set(0, 110, 140);
      cameraTarget.current.set(0, 0, 0);
    } else if (viewScale === 'event') {
      if (globeGroupRef.current) globeGroupRef.current.visible = false;
      if (cityGroupRef.current) cityGroupRef.current.visible = true;
      // Close affected zone view
      cameraPositionTarget.current.set(-30, 45, 60);
      cameraTarget.current.set(-20, 10, 10);
    }
  }, [viewScale]);

  // Adjust Local Weather Effects based on Time Step & Active City Event
  useEffect(() => {
    if (!activeCity || !cityGroupRef.current) return;
    const ev = weatherEvents.find((e) => e.city === activeCity.cityName);
    if (!ev) return;

    let targetRain = ev.rainfall;
    if (timeStep > 0) {
      targetRain = timeStep <= 6 ? ev.prediction.next_6h_rain : ev.prediction.next_24h_rain;
    } else if (timeStep < 0) {
      targetRain = Math.max(10, ev.rainfall * 0.7);
    }

    // Adjust flood water elevation based on rainfall accumulation
    if (floodWaterMeshRef.current) {
      const targetWaterY = 0.5 + Math.min(6.5, (targetRain / 100) * 4.5);
      floodWaterMeshRef.current.position.y = targetWaterY;
    }
  }, [timeStep, activeCity, weatherEvents]);

  // Pointer Interaction Handlers (Orbit, Drag, Raycasting)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    isAutoRotating.current = false;
    lastInteractionTime.current = Date.now();
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || !cameraRef.current) return;

    // Calculate normalized device coordinates
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Drag Orbiting
    if (isDraggingRef.current) {
      lastInteractionTime.current = Date.now();
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      if (viewScale === 'global' || viewScale === 'india') {
        if (globeGroupRef.current) {
          globeGroupRef.current.rotation.y += deltaX * 0.005;
          globeGroupRef.current.rotation.x = Math.max(
            -0.8,
            Math.min(0.8, globeGroupRef.current.rotation.x + deltaY * 0.005)
          );
        }
      } else {
        // Orbit City Camera around target
        const offset = cameraPositionTarget.current.clone().sub(cameraTarget.current);
        const radius = offset.length();
        let theta = Math.atan2(offset.x, offset.z);
        let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius)));

        theta -= deltaX * 0.005;
        phi = Math.max(0.15, Math.min(Math.PI / 2.1, phi - deltaY * 0.005));

        cameraPositionTarget.current.set(
          cameraTarget.current.x + radius * Math.sin(phi) * Math.sin(theta),
          cameraTarget.current.y + radius * Math.cos(phi),
          cameraTarget.current.z + radius * Math.sin(phi) * Math.cos(theta)
        );
      }

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    lastInteractionTime.current = Date.now();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    lastInteractionTime.current = Date.now();
    isAutoRotating.current = false;

    const zoomFactor = e.deltaY * 0.06;
    if (viewScale === 'global' || viewScale === 'india') {
      const currentDist = cameraPositionTarget.current.length();
      const newDist = Math.max(75, Math.min(240, currentDist + zoomFactor));
      cameraPositionTarget.current.normalize().multiplyScalar(newDist);
    } else {
      const offset = cameraPositionTarget.current.clone().sub(cameraTarget.current);
      const newDist = Math.max(25, Math.min(220, offset.length() + zoomFactor));
      cameraPositionTarget.current.copy(cameraTarget.current).add(offset.normalize().multiplyScalar(newDist));
    }
  };

  // Raycasting on Click
  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

    // Check if user was dragging significantly
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    if (viewScale === 'global' || viewScale === 'india') {
      // Check collision with weather markers on Globe
      if (markersGroupRef.current) {
        const intersects = raycasterRef.current.intersectObjects(markersGroupRef.current.children, true);
        if (intersects.length > 0) {
          // Find root marker group
          let cur: THREE.Object3D | null = intersects[0].object;
          while (cur && !cur.userData?.eventId && cur.parent) {
            cur = cur.parent;
          }
          if (cur && cur.userData?.event) {
            const ev = cur.userData.event as WeatherEvent;
            onSelectEvent(ev);
            setPreviewEvent(ev);
            setPreviewScreenPos({ x: e.clientX, y: e.clientY });
            return;
          }
        }
      }
      setPreviewEvent(null);
    } else {
      // In City Mode: Check collision with Buildings or Roads
      const buildingMeshes = buildingMeshesRef.current.map((b) => b.mesh);
      const roadMeshes = roadMeshesRef.current.map((r) => r.mesh);

      const bldIntersects = raycasterRef.current.intersectObjects(buildingMeshes, false);
      if (bldIntersects.length > 0) {
        const hit = bldIntersects[0].object;
        const bldData = hit.userData?.buildingData as Building3D;
        onInspectBuilding(bldData);
        onInspectRoad(null);
        return;
      }

      const roadIntersects = raycasterRef.current.intersectObjects(roadMeshes, false);
      if (roadIntersects.length > 0) {
        const hit = roadIntersects[0].object;
        const roadData = hit.userData?.roadData as RoadSegment;
        onInspectRoad(roadData);
        onInspectBuilding(null);
        return;
      }

      onInspectBuilding(null);
      onInspectRoad(null);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#050914]">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onClick={handleClick}
      />

      {/* Floating Marker Preview Card when clicked in Globe mode */}
      {previewEvent && previewScreenPos && (viewScale === 'global' || viewScale === 'india') && (
        <div
          className="absolute z-30 pointer-events-auto transform -translate-x-1/2 -translate-y-full mb-4 w-72 bg-[#091122]/95 border border-slate-700/80 rounded-xl p-4 shadow-2xl backdrop-blur-md text-slate-100"
          style={{
            left: Math.max(160, Math.min(window.innerWidth - 160, previewScreenPos.x)),
            top: Math.max(180, previewScreenPos.y - 12),
          }}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{WEATHER_TYPE_EMOJI_MAP[previewEvent.event_type]}</span>
              <div>
                <h4 className="font-semibold text-sm leading-tight text-white">{previewEvent.city}</h4>
                <p className="text-xs text-slate-400">{previewEvent.state}</p>
              </div>
            </div>
            <span
              className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded border ${
                SEVERITY_COLOR_MAP[previewEvent.severity].bg
              } ${SEVERITY_COLOR_MAP[previewEvent.severity].text}`}
            >
              {previewEvent.severity.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-3 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <div>
              <div className="text-slate-400 text-[10px]">CURRENT RAIN</div>
              <div className="text-base font-bold font-mono text-cyan-400">{previewEvent.rainfall} mm</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">WIND SPEED</div>
              <div className="text-base font-bold font-mono text-slate-200">{previewEvent.wind_speed} km/h</div>
            </div>
          </div>

          <p className="text-xs text-slate-300 mb-3 leading-relaxed line-clamp-2">
            {previewEvent.alert_headline}
          </p>

          <button
            onClick={() => {
              setPreviewEvent(null);
              const targetCity = CITIES_DATA[previewEvent.city] || activeCity;
              if (targetCity) {
                onExploreCity(targetCity);
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/40 transition-all cursor-pointer"
          >
            <span>EXPLORE 3D CITY</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  );
};
