import React, { useEffect, useRef, useState } from 'react';
import LiveMap from '../components/LiveMap';
import { disconnectThreatSocket, subscribeToThreats } from '../services/socketService';

const MAX_THREAT_HISTORY = 120;
const THREAT_FLUSH_INTERVAL_MS = 300;

/**
 * Home Page Component
 * Live global threat visualization with backend-connected data sources
 */
function Home({ theme = 'dark' }) {
  const isDark = theme === 'dark';
  const [arcsData, setArcsData] = useState([]);

  const threatQueueRef = useRef([]);

  useEffect(() => {
    let mounted = true;

    const flushThreatQueue = () => {
      if (!mounted) return;

      const queue = threatQueueRef.current;
      if (!queue.length) return;

      const nextThreats = queue.splice(0, queue.length);

      setArcsData((prev) => {
        const merged = [...prev, ...nextThreats];
        return merged.slice(-MAX_THREAT_HISTORY);
      });
    };

    const flushTimer = setInterval(flushThreatQueue, THREAT_FLUSH_INTERVAL_MS);

    const unsubscribeThreats = subscribeToThreats({
      onThreat: (threatData) => {
        if (!mounted || !threatData) return;
        threatQueueRef.current.push(threatData);
      },
    });

    return () => {
      mounted = false;
      clearInterval(flushTimer);
      flushThreatQueue();
      threatQueueRef.current = [];
      unsubscribeThreats();
      disconnectThreatSocket();
    };
  }, []);

  return (
    <div
      className={`w-full h-screen relative overflow-hidden pt-28 sm:pt-32 ${
        isDark ? 'bg-[#050511]' : 'bg-gradient-to-br from-sky-50 via-slate-100 to-blue-100'
      }`}
    >
      <LiveMap key={`live-map-${theme}`} arcsData={arcsData} theme={theme} />
    </div>
  );
}

export default Home;
