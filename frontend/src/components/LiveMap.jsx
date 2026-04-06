import React, { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'globe.gl';
import * as THREE from 'three';

const MAX_VISIBLE_ARCS = 120;
const MAX_VISIBLE_POINTS = 240;
const MAX_RING_PULSES = 40;
const STAR_COUNT_DARK = 110;
const STAR_COUNT_LIGHT = 65;
const COUNTRY_DATA_URL = '/data/ne_110m_admin_0_countries.geojson';

let COUNTRY_INDEX_CACHE = null;

const THEME_STYLES = {
  dark: {
    themeId: 'dark',
    defaultArcColor: 'rgba(255, 0, 85, 0.8)',
    sourcePointColor: 'rgba(34, 211, 238, 0.9)',
    targetPointColor: 'rgba(255, 0, 85, 0.92)',
    ringColor: 'rgba(255, 0, 85, 0.8)',
    tooltipSubText: '#9ca3af',
    tooltipTitle: '#f3f4f6',
    tooltipAccent: '#67e8f9',
    tooltipMeta: '#a1a1aa',
    atmosphereColor: '#22d3ee',
    atmosphereAltitude: 0.2,
    severityPalette: {
      Critical: 'rgba(255, 68, 122, 0.95)',
      High: 'rgba(251, 146, 60, 0.9)',
      Medium: 'rgba(250, 204, 21, 0.88)',
      Low: 'rgba(34, 211, 238, 0.9)',
    },
    globeImageUrl: 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg',
    globeMaterial: {
      color: '#091426',
      emissive: '#08203b',
      emissiveIntensity: 0.35,
      shininess: 8,
      specular: '#1f4d72',
    },
  },
  light: {
    themeId: 'light',
    defaultArcColor: 'rgba(220, 38, 38, 0.82)',
    sourcePointColor: 'rgba(3, 105, 161, 0.92)',
    targetPointColor: 'rgba(190, 24, 93, 0.85)',
    ringColor: 'rgba(249, 115, 22, 0.72)',
    tooltipSubText: '#334155',
    tooltipTitle: '#0f172a',
    tooltipAccent: '#0e7490',
    tooltipMeta: '#64748b',
    atmosphereColor: '#0284c7',
    atmosphereAltitude: 0.16,
    severityPalette: {
      Critical: 'rgba(225, 29, 72, 0.86)',
      High: 'rgba(234, 88, 12, 0.84)',
      Medium: 'rgba(202, 138, 4, 0.82)',
      Low: 'rgba(3, 105, 161, 0.84)',
    },
    globeImageUrl: 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg',
    globeMaterial: {
      color: '#7fb5e8',
      emissive: '#6bbef7',
      emissiveIntensity: 0.34,
      shininess: 24,
      specular: '#d8ecff',
    },
  },
};

function escapeHtml(value) {
  return `${value ?? ''}`
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildLocationLabel(city, country, ip) {
  return [city, country, ip].filter(Boolean).join(' | ') || 'Unknown';
}

function normalizeSeverityLabel(value) {
  const text = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (text === 'critical') return 'Critical';
  if (text === 'high') return 'High';
  if (text === 'low') return 'Low';
  return 'Medium';
}

function seededNoise(seed) {
  const raw = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return raw - Math.floor(raw);
}

function getSeverityVisual(themeStyle, severityInput) {
  const severity = normalizeSeverityLabel(severityInput);
  const color = themeStyle.severityPalette[severity] || themeStyle.defaultArcColor;

  if (severity === 'Critical') {
    return {
      color,
      stroke: 2.6,
      dashLength: 0.23,
      dashGap: 0.14,
      dashAnimateTime: 760,
      arcAltitude: 0.33,
      pointRadius: 0.2,
      ringMaxRadius: 6.2,
      ringRepeatPeriod: 700,
    };
  }

  if (severity === 'High') {
    return {
      color,
      stroke: 2.2,
      dashLength: 0.27,
      dashGap: 0.17,
      dashAnimateTime: 920,
      arcAltitude: 0.28,
      pointRadius: 0.18,
      ringMaxRadius: 5.2,
      ringRepeatPeriod: 820,
    };
  }

  if (severity === 'Low') {
    return {
      color,
      stroke: 1.65,
      dashLength: 0.42,
      dashGap: 0.28,
      dashAnimateTime: 1450,
      arcAltitude: 0.18,
      pointRadius: 0.14,
      ringMaxRadius: 4,
      ringRepeatPeriod: 1160,
    };
  }

  return {
    color,
    stroke: 1.9,
    dashLength: 0.34,
    dashGap: 0.22,
    dashAnimateTime: 1180,
    arcAltitude: 0.23,
    pointRadius: 0.16,
    ringMaxRadius: 4.5,
    ringRepeatPeriod: 980,
  };
}

function buildArcLabel(arc, themeStyle) {
  const source = buildLocationLabel(arc.sourceCity, arc.sourceCountry, arc.sourceIp);
  const target = buildLocationLabel(arc.targetCity, arc.targetCountry, arc.targetIp);

  return `
    <div style="padding:6px 8px; font-family:ui-monospace, SFMono-Regular, Menlo, monospace; line-height:1.4;">
      <div style="font-size:12px; color:${themeStyle.tooltipSubText};">${escapeHtml(source)} -> ${escapeHtml(target)}</div>
      <div style="font-weight:700; color:${themeStyle.tooltipTitle};">${escapeHtml(arc.threatType || 'Attack')}</div>
      <div style="font-size:11px; color:${themeStyle.tooltipAccent};">Severity: ${escapeHtml(arc.severity || 'Medium')}</div>
      <div style="font-size:11px; color:${themeStyle.tooltipMeta};">${escapeHtml(arc.timestamp || 'Live')}</div>
    </div>
  `;
}

function toSourcePoint(arc, themeStyle) {
  const severityVisual = getSeverityVisual(themeStyle, arc.severity);

  return {
    key: `s-${arc.startLat}-${arc.startLng}-${arc.sourceCountry || 'u'}`,
    lat: arc.startLat,
    lng: arc.startLng,
    color: themeStyle.sourcePointColor,
    altitude: 0.025,
    radius: Math.max(0.12, (arc.pointRadius || severityVisual.pointRadius) * 0.88),
    label: buildLocationLabel(arc.sourceCity, arc.sourceCountry, arc.sourceIp),
  };
}

function toTargetPoint(arc, themeStyle) {
  const severityVisual = getSeverityVisual(themeStyle, arc.severity);

  return {
    key: `t-${arc.endLat}-${arc.endLng}-${arc.targetCountry || 'u'}`,
    lat: arc.endLat,
    lng: arc.endLng,
    color: arc.color || severityVisual.color || themeStyle.targetPointColor,
    altitude: 0.03,
    radius: Math.max(0.14, arc.pointRadius || severityVisual.pointRadius),
    label: buildLocationLabel(arc.targetCity, arc.targetCountry, arc.targetIp),
  };
}

function makeRingPulse(arc, idx, themeStyle) {
  const severityVisual = getSeverityVisual(themeStyle, arc.severity);

  return {
    id: `${arc.id || 'threat'}-${idx}`,
    lat: arc.endLat,
    lng: arc.endLng,
    color: arc.color || severityVisual.color || themeStyle.ringColor,
    maxRadius: arc.ringMaxRadius || severityVisual.ringMaxRadius,
    repeatPeriod: arc.ringRepeatPeriod || severityVisual.ringRepeatPeriod,
  };
}

function normalizeLng(lng) {
  let normalized = lng;
  while (normalized > 180) normalized -= 360;
  while (normalized < -180) normalized += 360;
  return normalized;
}

function isPointInRing(lng, lat, ring) {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];

    const intersects =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / ((yj - yi) || Number.EPSILON) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
}

function isPointInPolygon(lng, lat, rings) {
  if (!rings?.length) return false;
  if (!isPointInRing(lng, lat, rings[0])) return false;

  for (let i = 1; i < rings.length; i += 1) {
    if (isPointInRing(lng, lat, rings[i])) return false;
  }

  return true;
}

function computeRingsBBox(rings) {
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  rings.forEach((ring) => {
    ring.forEach(([lng, lat]) => {
      const normalizedLng = normalizeLng(lng);
      if (normalizedLng < minLng) minLng = normalizedLng;
      if (normalizedLng > maxLng) maxLng = normalizedLng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    });
  });

  return { minLng, maxLng, minLat, maxLat };
}

function geometryToPolygons(geometry) {
  if (!geometry || !geometry.coordinates) return [];
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

function buildCountryIndex(geoJson) {
  const features = Array.isArray(geoJson?.features) ? geoJson.features : [];

  return features
    .map((feature) => {
      const name =
        feature?.properties?.NAME_LONG || feature?.properties?.ADMIN || feature?.properties?.NAME || 'Unknown';

      const polygonEntries = geometryToPolygons(feature?.geometry)
        .map((rings) => ({ rings, bbox: computeRingsBBox(rings) }))
        .filter((entry) => Number.isFinite(entry.bbox.minLat) && Number.isFinite(entry.bbox.minLng));

      if (!polygonEntries.length) return null;

      const aggregateBBox = polygonEntries.reduce(
        (acc, entry) => ({
          minLng: Math.min(acc.minLng, entry.bbox.minLng),
          maxLng: Math.max(acc.maxLng, entry.bbox.maxLng),
          minLat: Math.min(acc.minLat, entry.bbox.minLat),
          maxLat: Math.max(acc.maxLat, entry.bbox.maxLat),
        }),
        { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity }
      );

      return {
        name,
        polygons: polygonEntries,
        bbox: aggregateBBox,
        feature: {
          type: 'Feature',
          properties: feature?.properties || {},
          geometry: feature?.geometry || null,
        },
      };
    })
    .filter(Boolean);
}

function findCountryByCoords(countryIndex, lat, lng) {
  if (!Array.isArray(countryIndex) || !countryIndex.length) return null;
  const normalizedLng = normalizeLng(lng);

  for (const country of countryIndex) {
    if (lat < country.bbox.minLat || lat > country.bbox.maxLat) continue;
    if (normalizedLng < country.bbox.minLng || normalizedLng > country.bbox.maxLng) continue;

    for (const polygon of country.polygons) {
      if (lat < polygon.bbox.minLat || lat > polygon.bbox.maxLat) continue;
      if (normalizedLng < polygon.bbox.minLng || normalizedLng > polygon.bbox.maxLng) continue;
      if (isPointInPolygon(normalizedLng, lat, polygon.rings)) return country;
    }
  }

  return null;
}

function applyThemeToGlobe(globe, themeStyle) {
  if (!globe) return;

  globe.atmosphereColor(themeStyle.atmosphereColor);
  globe.atmosphereAltitude(themeStyle.atmosphereAltitude);
  globe.globeImageUrl(`${themeStyle.globeImageUrl}?theme=${themeStyle.themeId}`);
  globe.bumpImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png');

  const globeMaterial = globe.globeMaterial();
  if (globeMaterial instanceof THREE.MeshPhongMaterial) {
    // Clear old texture reference first so theme switch is visibly immediate.
    globeMaterial.map = null;
    globeMaterial.color = new THREE.Color(themeStyle.globeMaterial.color);
    globeMaterial.emissive = new THREE.Color(themeStyle.globeMaterial.emissive);
    globeMaterial.emissiveIntensity = themeStyle.globeMaterial.emissiveIntensity;
    globeMaterial.shininess = themeStyle.globeMaterial.shininess;
    globeMaterial.specular = new THREE.Color(themeStyle.globeMaterial.specular);
    globeMaterial.needsUpdate = true;
  }
}

/**
 * LiveMap Component
 * 3D Interactive Globe with cyber-themed visualized attack traffic
 */
function LiveMap({ arcsData, theme = 'dark' }) {
  const isDark = theme === 'dark';
  const themeStyle = isDark ? THEME_STYLES.dark : THEME_STYLES.light;
  const globeContainerRef = useRef(null);
  const globeRef = useRef(null);
  const controlsRef = useRef(null);
  const countryIndexRef = useRef([]);
  const [hoveredThreat, setHoveredThreat] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);

  const stars = useMemo(() => {
    const count = isDark ? STAR_COUNT_DARK : STAR_COUNT_LIGHT;

    return Array.from({ length: count }, (_, idx) => {
      const seed = idx + 1;
      const size = 0.8 + seededNoise(seed) * 2.2;
      const top = seededNoise(seed * 2.1) * 100;
      const left = seededNoise(seed * 3.7) * 100;
      const delay = seededNoise(seed * 5.4) * 4;
      const duration = 2.6 + seededNoise(seed * 7.3) * 4.8;
      const opacity = isDark ? 0.28 + seededNoise(seed * 8.9) * 0.58 : 0.2 + seededNoise(seed * 8.9) * 0.4;

      return {
        id: `star-${idx}`,
        size,
        top,
        left,
        delay,
        duration,
        opacity,
      };
    });
  }, [isDark]);

  useEffect(() => {
    let cancelled = false;

    if (COUNTRY_INDEX_CACHE) {
      countryIndexRef.current = COUNTRY_INDEX_CACHE;
      return undefined;
    }

    fetch(COUNTRY_DATA_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Country dataset request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((geoJson) => {
        if (cancelled) return;
        const countryIndex = buildCountryIndex(geoJson);
        COUNTRY_INDEX_CACHE = countryIndex;
        countryIndexRef.current = countryIndex;
      })
      .catch(() => {
        if (cancelled) return;
        countryIndexRef.current = [];
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleArcs = useMemo(
    () =>
      arcsData.slice(-MAX_VISIBLE_ARCS).map((arc) => {
        const severityVisual = getSeverityVisual(themeStyle, arc.severity);

        return {
          ...arc,
          color: severityVisual.color,
          stroke: severityVisual.stroke,
          dashLength: severityVisual.dashLength,
          dashGap: severityVisual.dashGap,
          dashAnimateTime: severityVisual.dashAnimateTime,
          visualAltitude: Math.max(arc.arcAltitude || 0, severityVisual.arcAltitude),
          pointRadius: severityVisual.pointRadius,
          ringMaxRadius: severityVisual.ringMaxRadius,
          ringRepeatPeriod: severityVisual.ringRepeatPeriod,
        };
      }),
    [arcsData, themeStyle]
  );

  const visiblePoints = useMemo(() => {
    const map = new Map();

    visibleArcs.forEach((arc) => {
      const source = toSourcePoint(arc, themeStyle);
      const target = toTargetPoint(arc, themeStyle);

      if (!map.has(source.key)) map.set(source.key, source);
      if (!map.has(target.key)) map.set(target.key, target);
    });

    return Array.from(map.values()).slice(-MAX_VISIBLE_POINTS);
  }, [themeStyle, visibleArcs]);

  const ringPulses = useMemo(
    () => visibleArcs.slice(-MAX_RING_PULSES).map((arc, idx) => makeRingPulse(arc, idx, themeStyle)),
    [themeStyle, visibleArcs]
  );

  useEffect(() => {
    const container = globeContainerRef.current;
    if (!container) return undefined;
    let hoverAnimationFrame = null;
    let latestPointer = null;

    const runHoverCountryLookup = () => {
      hoverAnimationFrame = null;

      const pointer = latestPointer;
      const globe = globeRef.current;

      if (!pointer || !globe) {
        setHoveredCountry((prev) => (prev === null ? prev : null));
        return;
      }

      const rect = container.getBoundingClientRect();
      const x = pointer.clientX - rect.left;
      const y = pointer.clientY - rect.top;
      const coords = globe.toGlobeCoords(x, y);

      if (!coords) {
        setHoveredCountry((prev) => (prev === null ? prev : null));
        return;
      }

      const country = findCountryByCoords(countryIndexRef.current, coords.lat, coords.lng);
      if (!country) {
        setHoveredCountry((prev) => (prev === null ? prev : null));
        return;
      }

      setHoveredCountry((prev) => {
        if (prev && prev.name === country.name && prev.feature === country.feature && prev.x === x && prev.y === y) {
          return prev;
        }
        return { name: country.name, feature: country.feature, x, y };
      });
    };

    const handleMouseMove = (event) => {
      latestPointer = { clientX: event.clientX, clientY: event.clientY };
      if (hoverAnimationFrame !== null) return;
      hoverAnimationFrame = requestAnimationFrame(runHoverCountryLookup);
    };

    const handleMouseLeave = () => {
      latestPointer = null;
      if (hoverAnimationFrame !== null) {
        cancelAnimationFrame(hoverAnimationFrame);
        hoverAnimationFrame = null;
      }
      setHoveredCountry((prev) => (prev === null ? prev : null));
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    try {
      const globe = Globe()(container);

      globe
        .backgroundColor('rgba(0,0,0,0)')
        .showAtmosphere(true)
        .arcColor((arc) => arc.color || themeStyle.defaultArcColor)
        .arcDashLength((arc) => arc.dashLength ?? 0.33)
        .arcDashGap((arc) => arc.dashGap ?? 0.2)
        .arcDashAnimateTime((arc) => arc.dashAnimateTime ?? 1300)
        .arcStroke((arc) => arc.stroke ?? 1.8)
        .arcAltitude((arc) => arc.visualAltitude ?? arc.arcAltitude ?? 0.2)
        .arcLabel((arc) => buildArcLabel(arc, themeStyle))
        .onArcHover((arc) => {
          setHoveredThreat(arc || null);
        })
        .pointsData([])
        .pointLat('lat')
        .pointLng('lng')
        .pointColor('color')
        .pointAltitude('altitude')
        .pointRadius('radius')
        .pointLabel('label')
        .pointsMerge(true)
        .ringsData([])
        .ringLat('lat')
        .ringLng('lng')
        .ringColor('color')
        .ringMaxRadius('maxRadius')
        .ringPropagationSpeed(() => 1.3)
        .ringRepeatPeriod('repeatPeriod')
        .polygonsData([])
        .polygonAltitude(() => 0.01)
        .polygonCapColor(() => (isDark ? 'rgba(45, 212, 191, 0.38)' : 'rgba(8, 145, 178, 0.3)'))
        .polygonSideColor(() => (isDark ? 'rgba(45, 212, 191, 0.12)' : 'rgba(8, 145, 178, 0.1)'))
        .polygonStrokeColor(() => (isDark ? '#22d3ee' : '#0e7490'))
        .polygonCapCurvatureResolution(6)
        .arcsData([]);

      try {
        globe
          .globeImageUrl(`${themeStyle.globeImageUrl}?theme=${themeStyle.themeId}`)
          .bumpImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png');
      } catch {
        // Globe can still render without textures.
      }

      applyThemeToGlobe(globe, themeStyle);

      const controls = typeof globe.controls === 'function' ? globe.controls() : null;
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.56;
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.enablePan = false;
        controls.rotateSpeed = 0.55;
        controls.minDistance = 180;
        controls.maxDistance = 420;
        controlsRef.current = controls;
      }

      const camera = typeof globe.camera === 'function' ? globe.camera() : null;
      if (camera?.position) {
        camera.position.z = 280;
      }

      globeRef.current = globe;
    } catch {
      container.innerHTML = `
        <div style="width:100%; height:100%; background: ${isDark ? 'linear-gradient(135deg, #050511 0%, #0f0f23 50%, #1a0033 100%)' : 'linear-gradient(135deg, #e0f2fe 0%, #f1f5f9 50%, #dbeafe 100%)'}; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:20px; color:${isDark ? '#00ffff' : '#0f172a'}; font-family:monospace; overflow:hidden;">
          <svg width="120" height="120" viewBox="0 0 120 120" style="filter:drop-shadow(0 0 10px #00ffff);">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#ff0055" stroke-width="2" opacity="0.3"/>
            <circle cx="60" cy="60" r="45" fill="none" stroke="#00ffff" stroke-width="1" opacity="0.2"/>
            <circle cx="60" cy="60" r="40" fill="none" stroke="#ff0055" stroke-width="1" opacity="0.1" />
            <line x1="10" y1="60" x2="40" y2="60" stroke="#ff0055" stroke-width="2" opacity="0.6"/>
            <line x1="80" y1="60" x2="110" y2="60" stroke="#ff0055" stroke-width="2" opacity="0.6"/>
            <circle cx="60" cy="60" r="8" fill="#00ffff" opacity="0.8"/>
          </svg>
          <div style="font-size:16px; font-weight:bold; text-align:center; max-width:300px;">
            <div>THREAT INTELLIGENCE MAP</div>
            <div style="font-size:12px; color:${isDark ? '#00ffff80' : '#0f172a80'}; margin-top:10px;">WebGL Rendering System Active</div>
          </div>
        </div>
      `;
    }

    return () => {
      const globe = globeRef.current;
      if (globe) {
        try {
          if (typeof globe.pauseAnimation === 'function') {
            globe.pauseAnimation();
          }
          if (typeof globe._destructor === 'function') {
            globe._destructor();
          }
        } catch {
          // Ignore teardown errors.
        }
      }

      globeRef.current = null;
      controlsRef.current = null;
      setHoveredThreat(null);
      setHoveredCountry(null);

      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (hoverAnimationFrame !== null) {
        cancelAnimationFrame(hoverAnimationFrame);
      }

      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    applyThemeToGlobe(globe, themeStyle);
    globe.arcColor((arc) => arc.color || themeStyle.defaultArcColor);
    globe.arcDashLength((arc) => arc.dashLength ?? 0.33);
    globe.arcDashGap((arc) => arc.dashGap ?? 0.2);
    globe.arcDashAnimateTime((arc) => arc.dashAnimateTime ?? 1300);
    globe.arcStroke((arc) => arc.stroke ?? 1.8);
    globe.arcLabel((arc) => buildArcLabel(arc, themeStyle));
    globe.polygonCapColor(() => (isDark ? 'rgba(45, 212, 191, 0.38)' : 'rgba(8, 145, 178, 0.3)'));
    globe.polygonSideColor(() => (isDark ? 'rgba(45, 212, 191, 0.12)' : 'rgba(8, 145, 178, 0.1)'));
    globe.polygonStrokeColor(() => (isDark ? '#22d3ee' : '#0e7490'));
  }, [themeStyle]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    globe.arcsData(visibleArcs);
    globe.pointsData(visiblePoints);
    globe.ringsData(ringPulses);
  }, [visibleArcs, visiblePoints, ringPulses]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.autoRotate = !hoveredCountry;
  }, [hoveredCountry]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.polygonsData(hoveredCountry?.feature ? [hoveredCountry.feature] : []);
  }, [hoveredCountry]);

  return (
    <>
      <div
        ref={globeContainerRef}
        className="globe-container"
        style={{
          width: '100%',
          height: '100%',
          background:
            isDark
              ? 'radial-gradient(ellipse at center, rgba(12, 23, 45, 0.95) 0%, rgba(5, 5, 17, 1) 58%, rgba(2, 2, 8, 1) 100%)'
              : 'radial-gradient(ellipse at center, rgba(186, 230, 253, 0.9) 0%, rgba(241, 245, 249, 0.95) 55%, rgba(219, 234, 254, 0.95) 100%)',
        }}
      />

      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className={`cyber-grid-overlay ${isDark ? 'cyber-grid-overlay-dark' : 'cyber-grid-overlay-light'}`} />
        <div className={`cyber-scanline ${isDark ? 'cyber-scanline-dark' : 'cyber-scanline-light'}`} />
        {stars.map((star) => (
          <span
            key={star.id}
            className="cyber-star"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
        <div className={`absolute -top-24 left-[-120px] h-80 w-80 rounded-full blur-3xl ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-400/20'}`} />
        <div
          className={`absolute -bottom-28 right-[-90px] h-72 w-72 rounded-full blur-3xl ${
            isDark ? 'bg-rose-500/10' : 'bg-rose-400/20'
          }`}
        />
      </div>

      {hoveredCountry?.name && (
        <div
          className={`absolute z-20 pointer-events-none rounded-md border px-3 py-2 ${
            isDark ? 'border-cyan-500/30 bg-[#050511cc]' : 'border-cyan-600/30 bg-white/85'
          }`}
          style={{
            left: `${hoveredCountry.x + 14}px`,
            top: `${hoveredCountry.y - 10}px`,
            transform: 'translateY(-100%)',
          }}
        >
          <p className={`text-sm font-semibold ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>{hoveredCountry.name}</p>
        </div>
      )}

      {hoveredThreat && (
        <div
          className={`absolute left-6 bottom-6 z-20 pointer-events-none max-w-sm rounded-lg border px-3 py-2 ${
            isDark ? 'border-cyan-500/30 bg-[#050511cc]' : 'border-cyan-600/30 bg-white/85'
          }`}
        >
          <p className={`text-xs font-mono ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
            {[hoveredThreat.sourceCity, hoveredThreat.sourceCountry, hoveredThreat.sourceIp].filter(Boolean).join(' | ') ||
              'Unknown'}{' '}
            -&gt;{' '}
            {[hoveredThreat.targetCity, hoveredThreat.targetCountry, hoveredThreat.targetIp].filter(Boolean).join(' | ') ||
              'Unknown'}
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>{hoveredThreat.threatType || 'Attack'}</p>
          <p className={`text-[11px] mt-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            Severity: {hoveredThreat.severity || 'Medium'} | {hoveredThreat.timestamp || 'Live'}
          </p>
        </div>
      )}
    </>
  );
}

export default LiveMap;
