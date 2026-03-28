import React, { useEffect, useRef } from 'react';
import Globe from 'globe.gl';

const INITIAL_ARCS_DATA = [
  {
    startLat: 39.9042,
    startLng: 116.4074,
    endLat: 40.7128,
    endLng: -74.006,
    sourceCountry: 'China',
    targetCountry: 'USA',
    threatType: 'DDoS Attack',
    color: 'rgba(255, 0, 85, 0.8)',
  },
  {
    startLat: 55.7558,
    startLng: 37.6173,
    endLat: 51.5074,
    endLng: -0.1278,
    sourceCountry: 'Russia',
    targetCountry: 'UK',
    threatType: 'Malware',
    color: 'rgba(255, 0, 85, 0.8)',
  },
  {
    startLat: 34.0522,
    startLng: -118.2437,
    endLat: 35.6892,
    endLng: 139.6917,
    sourceCountry: 'Dark Web',
    targetCountry: 'Japan',
    threatType: 'Phishing',
    color: 'rgba(255, 0, 85, 0.6)',
  },
];

const MAX_VISIBLE_ARCS = 120;

/**
 * LiveMap Component
 * 3D Interactive Globe with Attack Arc Visualization
 */
function LiveMap({ arcsData }) {
  const globeContainerRef = useRef(null);
  const globeRef = useRef(null);

  useEffect(() => {
    const container = globeContainerRef.current;
    if (!container) return undefined;

    try {
      const globe = Globe()(container);

      globe
        .arcColor((arc) => arc.color || 'rgba(255, 0, 85, 0.8)')
        .arcDashLength(() => 0.4)
        .arcDashGap(() => 0.2)
        .arcDashAnimateTime(() => 1000)
        .arcStroke(() => 2)
        .arcsData(INITIAL_ARCS_DATA);

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

      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const visibleArcs = arcsData.slice(-MAX_VISIBLE_ARCS);
    globe.arcsData([...INITIAL_ARCS_DATA, ...visibleArcs]);
  }, [arcsData]);

  return (
    <div
      ref={globeContainerRef}
      className="globe-container"
      style={{
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse at center, #0f0f23 0%, #050511 100%)',
      }}
    />
  );
}

export default LiveMap;
