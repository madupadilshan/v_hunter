import React, { useState, useEffect } from 'react';
import LiveMap from '../components/LiveMap';
import ThreatsPanel from '../components/ThreatsPanel';
import { fetchSeveritySummary, fetchTopThreats } from '../services/threatService';
import { disconnectThreatSocket, subscribeToThreats } from '../services/socketService';
import './pages.css';

const MAX_THREAT_HISTORY = 120;

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

  function addRecentDetection(threat) {
    const detection = {
      id: Date.now(),
      source: threat.sourceCountry || 'Unknown',
      target: threat.targetCountry || 'Unknown',
      type: threat.threatType || 'Attack',
      timestamp: new Date().toLocaleTimeString(),
    };

    setRecentDetections((prev) => [detection, ...prev.slice(0, 19)]);
  }

  useEffect(() => {
    let mounted = true;

    const loadInitialThreatData = async () => {
      try {
        const [topThreatsData, summaryData] = await Promise.all([
          fetchTopThreats(),
          fetchSeveritySummary(),
        ]);

        if (!mounted) return;
        setTopThreats(topThreatsData);
        setVulnerabilities(summaryData);
      } catch {
        if (!mounted) return;
        setBackendStatus('Waiting for backend data...');
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
        if (!mounted) return;
        setArcsData((prev) => [...prev.slice(-(MAX_THREAT_HISTORY - 1)), threatData]);
        addRecentDetection(threatData);
      },
      onError: () => {
        if (!mounted) return;
        setBackendStatus('Backend unavailable - retrying...');
      },
    });

    loadInitialThreatData();

    return () => {
      mounted = false;
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

