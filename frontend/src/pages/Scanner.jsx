import React, { useState } from 'react';
import { Upload, FileText, Zap } from 'lucide-react';
import Uploader from '../components/Uploader';
import ReportModal from '../components/ReportModal';
import { scanTarget, uploadAndScanFiles } from '../services/scannerService';
import './pages.css';

const DEFAULT_MITIGATION = [
  'Implement strict input validation and sanitization on all user inputs.',
  'Use parameterized queries for all database operations.',
  'Enable modern security headers and enforce least-privilege access.',
  'Patch dependencies regularly and run automated security scans.',
  'Introduce WAF/rate limiting for exposed endpoints.',
];

/**
 * Scanner Page Component
 * Vulnerability scanning with file upload and URL analysis
 */
function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ stage: '', percentage: 0 });
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [scanContext, setScanContext] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [reportData, setReportData] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const startScanning = () => {
    setScanning(true);
    setErrorMessage('');
    setVulnerabilities([]);
    setScanContext(null);
    setScanProgress({ stage: 'Initializing scan...', percentage: 10 });
  };

  const finishScanning = () => {
    setScanProgress({ stage: 'Scan Complete!', percentage: 100 });
    setScanning(false);
  };

  const failScanning = (fallbackMessage) => {
    setScanning(false);
    setScanProgress({ stage: 'Scan failed', percentage: 0 });
    setErrorMessage(fallbackMessage);
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    startScanning();
    setScanProgress({ stage: 'Uploading files to backend...', percentage: 25 });

    try {
      const fileList = Array.from(files);
      const { raw, vulnerabilities: normalizedVulnerabilities } = await uploadAndScanFiles(fileList);

      setScanProgress({ stage: 'Normalizing backend response...', percentage: 85 });
      setVulnerabilities(normalizedVulnerabilities);
      setScanContext({
        mode: 'file',
        sourceLabel: fileList.map((file) => file.name).join(', '),
        backendRaw: raw,
      });
      finishScanning();
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || 'File scan request failed.';
      failScanning(message);
    }
  };

  const handleURLScan = async () => {
    const target = urlInput.trim();
    if (!target) return;

    startScanning();
    setScanProgress({ stage: 'Sending target to backend scanner...', percentage: 25 });

    try {
      const { raw, vulnerabilities: normalizedVulnerabilities } = await scanTarget(target);

      setScanProgress({ stage: 'Normalizing backend response...', percentage: 85 });
      setVulnerabilities(normalizedVulnerabilities);
      setScanContext({
        mode: 'network',
        sourceLabel: target,
        backendRaw: raw,
      });
      finishScanning();
    } catch (error) {
      const message = error?.response?.data?.error || error?.message || 'Network scan request failed.';
      failScanning(message);
    }
  };

  const generateAIReport = () => {
    const criticalCount = vulnerabilities.filter((vulnerability) => vulnerability.severity === 'Critical').length;
    const summarySource = scanContext?.sourceLabel || 'target';
    const summary = `${criticalCount} critical vulnerabilities detected across ${vulnerabilities.length} total findings for ${summarySource}.`;

    const report = {
      summary,
      vulnerabilities,
      poc: `# Proof of Concept - Security Analysis Report

## Scan Context
- Mode: ${scanContext?.mode || 'unknown'}
- Source: ${summarySource}
- Generated: ${new Date().toISOString()}

## Reproduction Guidance
Use the backend scan APIs with the same source input to reproduce this result:

\`\`\`bash
POST /api/upload (multipart/form-data)   # for file scans
POST /api/scan   (application/json)      # for URL/IP scans
\`\`\`
`,
      mitigation: DEFAULT_MITIGATION,
    };

    setReportData(report);
    setShowReportModal(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#050511] relative overflow-hidden pt-20 pb-10">
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00ffff" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gray-100">VULNERABILITY</span>
            <span className="text-red-500 drop-shadow-lg"> SCANNER</span>
          </h1>
          <p className="text-gray-400 text-sm">Frontend wired for backend API integration</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="glass-panel-lg">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-cyan-400">File Scanner</h2>
              </div>
              <Uploader onFileUpload={handleFileUpload} disabled={scanning} />
            </div>

            <div className="glass-panel-lg">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-purple-400">Network Scan</h2>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleURLScan()}
                  placeholder="Enter URL, IP address, or domain..."
                  disabled={scanning}
                  className="input-glow w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                />
                <button
                  onClick={handleURLScan}
                  disabled={scanning || !urlInput.trim()}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
                >
                  {scanning ? 'SCANNING...' : 'INITIATE NETWORK SCAN'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel-lg">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-red-400 animate-pulse" />
                <h2 className="text-lg font-bold text-red-400">Backend Scan Status</h2>
              </div>

              {scanning ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300 font-mono">&gt; {scanProgress.stage}</p>
                    <div className="w-full bg-gray-900/50 rounded-lg h-2 border border-gray-700/50 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300"
                        style={{ width: `${scanProgress.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-right">{scanProgress.percentage}%</p>
                  </div>
                  <div className="text-2xl font-bold text-cyan-400 animate-pulse">SCANNING</div>
                </div>
              ) : errorMessage ? (
                <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-400 mb-1">Scan failed</p>
                  <p className="text-xs text-red-200">{errorMessage}</p>
                </div>
              ) : vulnerabilities.length > 0 ? (
                <div>
                  <div className="bg-gradient-to-r from-red-500/20 to-red-600/10 border border-red-500/50 rounded-lg p-4 mb-4">
                    <p className="text-lg font-bold text-red-400">
                      {vulnerabilities.filter((v) => v.severity === 'Critical').length} CRITICAL
                    </p>
                    <p className="text-sm text-red-300/80">{vulnerabilities.length} total vulnerabilities detected</p>
                  </div>
                  <button
                    onClick={generateAIReport}
                    className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-lg transition-all duration-300 shadow-lg shadow-red-500/30"
                  >
                    VIEW DETAILED REPORT
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">Ready for backend scan. Upload a file or scan a URL to begin.</p>
                </div>
              )}
            </div>

            {vulnerabilities.length > 0 && (
              <div className="glass-panel-lg">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-green-400" />
                  <h2 className="text-lg font-bold text-green-400">Vulnerabilities Found</h2>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {vulnerabilities.map((vuln) => (
                    <div
                      key={vuln.id}
                      className="flex justify-between items-center p-2 bg-gray-900/30 rounded border border-gray-700/30 hover:border-gray-600/50 transition-all"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-200">{vuln.name}</p>
                        <p className="text-xs text-gray-400">CVSS: {Number(vuln.cvss).toFixed(1)}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          vuln.severity === 'Critical'
                            ? 'bg-red-500/20 text-red-400'
                            : vuln.severity === 'High'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {vuln.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showReportModal && <ReportModal data={reportData} onClose={() => setShowReportModal(false)} />}
    </div>
  );
}

export default Scanner;

