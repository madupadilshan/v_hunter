import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Download, Trash2, Calendar } from 'lucide-react';
import { fetchReports } from '../services/reportService';
import { getErrorMessage } from '../services/errors';
import './pages.css';

/**
 * Reports Page Component
 * Archive and retrieval of generated security reports
 */
function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadReports = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const data = await fetchReports();
        if (!mounted) return;
        setReports(data);
      } catch (error) {
        if (!mounted) return;
        setErrorMessage(getErrorMessage(error, 'Unable to load reports from backend.'));
        setReports([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadReports();

    return () => {
      mounted = false;
    };
  }, []);

  const severityCounts = useMemo(
    () =>
      reports.reduce(
        (acc, report) => {
          if (acc[report.type] !== undefined) {
            acc[report.type] += 1;
          }
          return acc;
        },
        {
          Critical: 0,
          High: 0,
          Medium: 0,
          Low: 0,
        }
      ),
    [reports]
  );

  const getTrustBadgeColor = (type) => {
    switch (type) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 border border-red-500/50';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/50';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50';
      default:
        return 'bg-green-500/20 text-green-400 border border-green-500/50';
    }
  };

  const emptyStateMessage = loading
    ? 'Loading reports from backend...'
    : errorMessage || 'No reports available yet. Connect backend report data to populate this table.';

  return (
    <div className="w-full min-h-screen bg-[#050511] relative overflow-x-hidden pt-20 pb-10">
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10b981" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gray-100">REPORTS</span>
              <span className="text-green-500 drop-shadow-lg"> ARCHIVE</span>
            </h1>
            <p className="text-gray-400 text-sm">Access and manage your security analysis reports</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg px-6 py-3">
            <p className="text-green-400 font-bold">{reports.length} Reports</p>
            <p className="text-xs text-gray-400">Total Scans</p>
          </div>
        </div>

        <div className="glass-panel-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Report Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Severity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Vulnerabilities</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Exports</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                      {emptyStateMessage}
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-700/30 hover:bg-gray-900/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-cyan-400" />
                          <p className="font-semibold text-gray-100">{report.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {report.scannedAt ? new Date(report.scannedAt).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getTrustBadgeColor(report.type)}`}>
                          {report.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-red-400">{report.vulnerabilities} Found</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {report.exported
                            ? report.exported.split(/,\s*/).map((format, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-gray-900/50 border border-gray-700/50 text-xs text-gray-300 rounded"
                                >
                                  {format}
                                </span>
                              ))
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-gray-900/50 rounded-lg transition-colors text-cyan-400 hover:text-cyan-300">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-gray-900/50 rounded-lg transition-colors text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-8">
          <div className="glass-panel-lg p-6">
            <h3 className="text-lg font-bold text-green-400 mb-4">Most Common Issues</h3>
            <p className="text-sm text-gray-400">
              No analytics yet. This section will populate when backend report data is connected.
            </p>
          </div>

          <div className="glass-panel-lg p-6">
            <h3 className="text-lg font-bold text-cyan-400 mb-4">Severity Distribution</h3>
            <div className="space-y-3">
              {[
                { severity: 'Critical', count: severityCounts.Critical, color: 'text-red-400' },
                { severity: 'High', count: severityCounts.High, color: 'text-orange-400' },
                { severity: 'Medium', count: severityCounts.Medium, color: 'text-yellow-400' },
                { severity: 'Low', count: severityCounts.Low, color: 'text-green-400' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-gray-300">{item.severity}</span>
                  <span className={`${item.color} font-bold`}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
