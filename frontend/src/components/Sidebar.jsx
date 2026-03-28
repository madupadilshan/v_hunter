import React, { useState } from 'react';
import { Search, Zap } from 'lucide-react';
import Uploader from './Uploader';
import { backendConfig } from '../services/config';

/**
 * Sidebar Component
 * Left panel containing uploader, URL input, and scan progress
 */
function Sidebar({ onFileUpload, onURLScan, scanning, scanProgress }) {
  const [urlInput, setUrlInput] = useState('');

  const handleScan = () => {
    if (!urlInput.trim()) return;
    onURLScan(urlInput);
    setUrlInput('');
  };

  return (
    <div className="absolute left-6 top-32 z-20 w-96 max-h-[calc(100vh-8rem)] overflow-y-auto panel-overlay">
      <div className="mb-6">
        <Uploader onFileUpload={onFileUpload} scanning={scanning} />
      </div>

      <div className="glass-panel p-6 space-y-4 rounded-lg">
        <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
          <Search size={16} className="text-cyan-400" />
          Scan Target
        </h3>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Enter URL, IP, or domain..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            disabled={scanning}
            className="input-glow"
          />

          <button
            onClick={handleScan}
            disabled={scanning || !urlInput.trim()}
            className="btn-primary w-full text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Zap size={16} />
            {scanning ? 'Scanning...' : 'Scan'}
          </button>
        </div>
      </div>

      {(scanning || scanProgress.percentage > 0) && (
        <div className="glass-panel p-6 mt-6 space-y-4 rounded-lg animate-pulse-glow">
          <h3 className="text-sm font-bold text-gray-100">Scan Progress</h3>
          <div className="text-xs text-cyan-300 font-mono">{scanProgress.stage}</div>

          <div className="progress-bar">
            <div
              className="progress-bar-fill transition-all duration-500 ease-out"
              style={{ width: `${scanProgress.percentage}%` }}
            />
          </div>

          <div className="text-right text-xs text-gray-400">{scanProgress.percentage}%</div>

          {scanning && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live scanning active
            </div>
          )}
        </div>
      )}

      <div className="glass-panel p-4 mt-6 rounded-lg text-xs text-gray-400 space-y-2">
        <p>
          <strong>Tip:</strong> Upload executables or source code for deep analysis.
        </p>
        <p>
          <strong>Or:</strong> Scan any URL or IP address for threats.
        </p>
        <p>
          <strong>Backend:</strong>{' '}
          <code className="text-cyan-300">{backendConfig.apiBaseUrl}</code>
        </p>
      </div>
    </div>
  );
}

export default Sidebar;

