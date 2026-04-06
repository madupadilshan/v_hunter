import React, { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import { fetchDarkWebStats } from '../services/darkWebService';
import './pages.css';

function formatCompact(value) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value || 0);
}

/**
 * DarkWeb Page Component
 * Dark web intelligence monitoring and tracking
 */
function DarkWeb({ theme = 'dark' }) {
  const isDark = theme === 'dark';
  const [stats, setStats] = useState({
    activeThreats: 0,
    leakedCredentials: 0,
    forumsMonitored: 0,
  });

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        const data = await fetchDarkWebStats();
        if (!mounted) return;
        setStats(data);
      } catch {
        if (!mounted) return;
      }
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      className={`w-full min-h-screen relative overflow-hidden pt-32 pb-10 ${
        isDark ? 'bg-[#050511]' : 'bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-100'
      }`}
    >
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#9333ea" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            <span className={isDark ? 'text-gray-100' : 'text-slate-900'}>DARK WEB</span>
            <span className="text-purple-500 drop-shadow-lg"> INTELLIGENCE</span>
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            Monitor underground forums, markets, and threat intelligence feeds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Active Threats', value: formatCompact(stats.activeThreats), color: 'text-red-400' },
            { label: 'Leaked Credentials', value: formatCompact(stats.leakedCredentials), color: 'text-orange-400' },
            { label: 'Forums Monitored', value: formatCompact(stats.forumsMonitored), color: 'text-purple-400' },
          ].map((stat, i) => (
            <div key={i} className="glass-panel-lg p-6 text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="glass-panel-lg p-12 text-center">
          <div className="flex justify-center mb-4">
            <Globe className="w-16 h-16 text-purple-500 opacity-50" />
          </div>
          <h2 className="text-2xl font-bold text-purple-400 mb-4">Coming Soon</h2>
          <p className={`max-w-md mx-auto mb-6 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            Advanced dark web monitoring capabilities, including marketplace tracking, credential leak detection, and
            threat actor activity monitoring.
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
              Request Beta Access
            </button>
            <button
              className={`px-6 py-2 border rounded-lg transition-all ${
                isDark
                  ? 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10'
                  : 'border-purple-400/70 text-purple-700 hover:bg-purple-100'
              }`}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DarkWeb;
