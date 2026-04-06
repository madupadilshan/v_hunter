import React from 'react';
import { AlertTriangle, TrendingUp, Clock } from 'lucide-react';

/**
 * ThreatsPanel Component
 * Right panel displaying live threat intelligence dashboard
 */
function ThreatsPanel({ vulnerabilities, topThreats, recentDetections, onViewReport, showScanButton = true, theme = 'dark' }) {
  const isDark = theme === 'dark';

  const calculateSeverityCounts = () => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    vulnerabilities.forEach((vulnerability) => {
      if (counts[vulnerability.severity] !== undefined) {
        const increment = Number(vulnerability.count ?? 1);
        counts[vulnerability.severity] += Number.isFinite(increment) ? increment : 1;
      }
    });
    return counts;
  };

  const severityCounts = calculateSeverityCounts();

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: 'text-red-500 bg-red-500/10',
      High: 'text-orange-500 bg-orange-500/10',
      Medium: 'text-yellow-500 bg-yellow-500/10',
      Low: 'text-blue-500 bg-blue-500/10',
    };
    return colors[severity] || 'text-gray-500 bg-gray-500/10';
  };

  const getSeverityBorder = (severity) => {
    const borders = {
      Critical: 'border-red-500/30',
      High: 'border-orange-500/30',
      Medium: 'border-yellow-500/30',
      Low: 'border-blue-500/30',
    };
    return borders[severity] || 'border-gray-500/30';
  };

  return (
    <div className="absolute z-20 left-3 right-3 top-[27rem] sm:left-auto sm:right-4 sm:top-32 sm:w-[22rem] lg:right-6 lg:w-96 max-h-[calc(100vh-8rem)] overflow-y-auto panel-overlay space-y-4 sm:space-y-6">
      <div className="glass-panel glass-panel-transparent p-6 rounded-lg space-y-4">
        <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
          <TrendingUp size={16} className="text-cyan-400" />
          Top Attackers
        </h3>

        <div className="space-y-3">
          {topThreats.length === 0 ? (
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>No threat data available yet.</p>
          ) : (
            topThreats.map((threat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-mono ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{threat.country}</span>
                  <span className={`text-xs ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>{threat.ips}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${threat.percentage}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="glass-panel glass-panel-transparent p-6 rounded-lg space-y-4">
        <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
          <AlertTriangle size={16} className="text-red-500" />
          Vulnerability Summary
        </h3>

        {vulnerabilities.length === 0 ? (
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>No vulnerabilities detected yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {['Critical', 'High', 'Medium', 'Low'].map((severity) => (
              <div
                key={severity}
                className={`p-3 rounded-lg border ${getSeverityColor(severity)} ${getSeverityBorder(severity)} text-center`}
              >
                <div className="text-2xl font-bold">{severityCounts[severity]}</div>
                <div className="text-xs mt-1 opacity-75">{severity}</div>
              </div>
            ))}
          </div>
        )}

        {vulnerabilities.length > 0 && showScanButton && (
          <button onClick={onViewReport} className="btn-primary w-full text-xs font-semibold mt-4">
            View Detailed AI Report
          </button>
        )}
      </div>

      <div className="glass-panel glass-panel-transparent p-6 rounded-lg space-y-4">
        <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
          <Clock size={16} className="text-orange-400" />
          Recent Detections
        </h3>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recentDetections.length === 0 ? (
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>No detections yet.</p>
          ) : (
            recentDetections.map((detection) => (
              <div key={detection.id} className="threat-item">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-xs font-mono text-red-400">
                      {detection.source} -&gt; {detection.target}
                    </div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{detection.type}</div>
                  </div>
                  <div className={`text-xs whitespace-nowrap ml-2 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                    {detection.timestamp}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {vulnerabilities.length > 0 && (
        <div className="glass-panel p-6 rounded-lg space-y-4">
          <h3 className={`text-sm font-bold ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Found Vulnerabilities</h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {vulnerabilities.map((vulnerability) => (
              <div
                key={vulnerability.id}
                className={`p-3 rounded-lg border glass-panel ${getSeverityBorder(vulnerability.severity)}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className={`text-xs font-bold ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>{vulnerability.name}</h4>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{vulnerability.description}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${getSeverityColor(vulnerability.severity)}`}
                  >
                    {vulnerability.severity}
                  </span>
                </div>
                <div className={`text-xs mt-2 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>CVSS: {vulnerability.cvss}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ThreatsPanel;
