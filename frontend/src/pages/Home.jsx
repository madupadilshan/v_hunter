import React, { useEffect, useRef, useState } from 'react';
import LiveMap from '../components/LiveMap';
import ThreatsPanel from '../components/ThreatsPanel';
import { fetchSeveritySummary, fetchTopThreats } from '../services/threatService';
import { disconnectThreatSocket, subscribeToThreats } from '../services/socketService';
import { getErrorMessage } from '../services/errors';
import './pages.css';

const MAX_THREAT_HISTORY = 120;
const MAX_RECENT_DETECTIONS = 20;
const THREAT_FLUSH_INTERVAL_MS = 300;

function buildRecentDetection(threat) {
  const sourceLabel = [threat.sourceCity, threat.sourceCountry, threat.sourceIp].filter(Boolean).join(' | ') || 'Unknown';
  const targetLabel = [threat.targetCity, threat.targetCountry, threat.targetIp].filter(Boolean).join(' | ') || 'Unknown';

  return {
    id: `${threat.id || Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    source: sourceLabel,
    target: targetLabel,
    type: threat.threatType || 'Attack',
    timestamp: threat.timestamp || new Date().toLocaleTimeString(),
  };
}

/**
 * Home Page Component
 * Live global threat visualization with backend-connected data sources
 */
function Home() {
  const [arcsData, setArcsData] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [topThreats, setTopThreats] = useState([]);
  const [recentDetections, setRecentDetections] = useState([]);
  const [backendStatus, setBackendStatus] = useState('Connecting to backend...');

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

      setRecentDetections((prev) => {
        const fromBatch = nextThreats.slice(-MAX_RECENT_DETECTIONS).reverse().map(buildRecentDetection);
        return [...fromBatch, ...prev].slice(0, MAX_RECENT_DETECTIONS);
      });
    };

    const flushTimer = setInterval(flushThreatQueue, THREAT_FLUSH_INTERVAL_MS);

    const loadInitialThreatData = async () => {
      try {
        const [topThreatsData, summaryData] = await Promise.all([fetchTopThreats(), fetchSeveritySummary()]);

        if (!mounted) return;
        setTopThreats(topThreatsData);
        setVulnerabilities(summaryData);
      } catch (error) {
        if (!mounted) return;
        setBackendStatus(getErrorMessage(error, 'Waiting for backend data...'));
      }
    };

    const unsubscribeThreats = subscribeToThreats({
      onConnect: () => {
        if (!mounted) return;
        setBackendStatus('Connected to live threat feed');
      },
      onDisconnect: () => {
        if (!mounted) return;
        setBackendStatus('Disconnected - retrying...');
      },
      onThreat: (threatData) => {
        if (!mounted || !threatData) return;
        threatQueueRef.current.push(threatData);
      },
      onError: (error) => {
        if (!mounted) return;
        setBackendStatus(getErrorMessage(error, 'Backend unavailable - retrying...'));
      },
    });

    loadInitialThreatData();

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
    <div className="w-full h-screen bg-[#050511] relative overflow-hidden pt-16">
      <LiveMap arcsData={arcsData} />

      <div className="absolute top-20 left-6 z-20">
        <div className="text-2xl font-bold">
          <span className="text-gray-100">GLOBAL</span>
          <span className="text-cyan-400 drop-shadow-lg"> THREAT</span>
          <span className="text-red-500 drop-shadow-lg"> MAP</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">Real-time cyber threat intelligence - live attacker tracking</p>
        <p className="text-[11px] text-cyan-500 mt-1 font-mono">{backendStatus}</p>
      </div>

      <ThreatsPanel
        vulnerabilities={vulnerabilities}
        topThreats={topThreats}
        recentDetections={recentDetections}
        showScanButton={false}
      />
    </div>
  );
}

export default Home;
