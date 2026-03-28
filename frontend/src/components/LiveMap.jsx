import React, { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'globe.gl';

const MAX_VISIBLE_ARCS = 120;
const DEFAULT_ARC_COLOR = 'rgba(255, 0, 85, 0.8)';

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

function buildArcLabel(arc) {
  const source = buildLocationLabel(arc.sourceCity, arc.sourceCountry, arc.sourceIp);
  const target = buildLocationLabel(arc.targetCity, arc.targetCountry, arc.targetIp);

  return `
    <div style="padding:6px 8px; font-family:ui-monospace, SFMono-Regular, Menlo, monospace; line-height:1.4;">
      <div style="font-size:12px; color:#9ca3af;">${escapeHtml(source)} -> ${escapeHtml(target)}</div>
      <div style="font-weight:700; color:#f3f4f6;">${escapeHtml(arc.threatType || 'Attack')}</div>
      <div style="font-size:11px; color:#67e8f9;">Severity: ${escapeHtml(arc.severity || 'Medium')}</div>
      <div style="font-size:11px; color:#a1a1aa;">${escapeHtml(arc.timestamp || 'Live')}</div>
    </div>
  `;
}

/**
 * LiveMap Component
 * 3D Interactive Globe with Attack Arc Visualization
 */
function LiveMap({ arcsData }) {
  const globeContainerRef = useRef(null);
  const globeRef = useRef(null);
  const [hoveredThreat, setHoveredThreat] = useState(null);
  const visibleArcs = useMemo(() => arcsData.slice(-MAX_VISIBLE_ARCS), [arcsData]);

  useEffect(() => {
    const container = globeContainerRef.current;
    if (!container) return undefined;

    try {
      const globe = Globe()(container);

      globe
        .arcColor((arc) => arc.color || DEFAULT_ARC_COLOR)
        .arcDashLength(() => 0.35)
        .arcDashGap(() => 0.2)
        .arcDashAnimateTime(() => 1200)
        .arcStroke(() => 1.8)
        .arcAltitude((arc) => arc.arcAltitude ?? 0.2)
        .arcLabel(buildArcLabel)
        .onArcHover((arc) => {
          setHoveredThreat(arc || null);
        })
        .arcsData([]);

      try {
        globe
          .globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg')
          .bumpImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png');
      } catch {
        // Globe can still render without textures.
      }

      const controls = typeof globe.controls === 'function' ? globe.controls() : null;
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
      }

      const camera = typeof globe.camera === 'function' ? globe.camera() : null;
      if (camera?.position) {
        camera.position.z = 300;
      }

      globeRef.current = globe;
    } catch {
      container.innerHTML = `
        <div style="width:100%; height:100%; background: linear-gradient(135deg, #050511 0%, #0f0f23 50%, #1a0033 100%); display:flex; align-items:center; justify-content:center; flex-direction:column; gap:20px; color:#00ffff; font-family:monospace; overflow:hidden;">
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
            <div style="font-size:12px; color:#00ffff80; margin-top:10px;">WebGL Rendering System Active</div>
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
      setHoveredThreat(null);

      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    globe.arcsData(visibleArcs);
  }, [visibleArcs]);

  return (
    <>
      <div
        ref={globeContainerRef}
        className="globe-container"
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, #0f0f23 0%, #050511 100%)',
        }}
      />

      {hoveredThreat && (
        <div className="absolute left-6 bottom-6 z-20 pointer-events-none max-w-sm rounded-lg border border-cyan-500/30 bg-[#050511cc] px-3 py-2">
          <p className="text-xs text-cyan-300 font-mono">
            {[hoveredThreat.sourceCity, hoveredThreat.sourceCountry, hoveredThreat.sourceIp].filter(Boolean).join(' | ') ||
              'Unknown'}{' '}
            -&gt;{' '}
            {[hoveredThreat.targetCity, hoveredThreat.targetCountry, hoveredThreat.targetIp].filter(Boolean).join(' | ') ||
              'Unknown'}
          </p>
          <p className="text-xs text-gray-100 mt-1">{hoveredThreat.threatType || 'Attack'}</p>
          <p className="text-[11px] text-gray-400 mt-1">
            Severity: {hoveredThreat.severity || 'Medium'} | {hoveredThreat.timestamp || 'Live'}
          </p>
        </div>
      )}
    </>
  );
}

export default LiveMap;
