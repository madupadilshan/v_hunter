import React from 'react';
import { X, Download, Copy } from 'lucide-react';

/**
 * ReportModal Component
            AI-Generated Vulnerability Reports with PoC and mitigation
 */
function ReportModal({ data, onClose, theme = 'dark' }) {
  const isDark = theme === 'dark';
  const [copied, setCopied] = React.useState(false);

  if (!data) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const content = `
# V HUNTER - Vulnerability Report
Generated: ${new Date().toLocaleString()}

## Summary
${data.summary}

## Vulnerabilities Found: ${data.vulnerabilities.length}
${data.vulnerabilities
  .map(
    (v) => `
### ${v.name}
- Severity: ${v.severity}
- CVSS Score: ${v.cvss}
- Description: ${v.description}
`
  )
  .join('\n')}

## Proof of Concept
${data.poc}

## Mitigation Strategies
${data.mitigation.map((m, i) => `${i + 1}. ${m}`).join('\n')}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/markdown;charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', 'v-hunter-report.md');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 backdrop-blur-sm ${isDark ? 'bg-black/60' : 'bg-slate-900/30'}`}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative glass-panel-lg max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl p-8 space-y-6 w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-gray-700/50' : 'hover:bg-slate-200/80'
          }`}
        >
          <X size={20} className={isDark ? 'text-gray-400' : 'text-slate-600'} />
        </button>

        {/* Header */}
        <div className="space-y-2">
          <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
            AI-Generated Vulnerability Report
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            Scan completed on {new Date().toLocaleString()}
          </p>
        </div>

        {/* Summary */}
        <div className="glass-panel p-4 rounded-lg space-y-2">
          <h3 className="text-sm font-bold text-cyan-400">Executive Summary</h3>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{data.summary}</p>
        </div>

        {/* Vulnerabilities */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-red-400">
            Vulnerabilities ({data.vulnerabilities.length} found)
          </h3>

          <div className="grid gap-3">
            {data.vulnerabilities.map((vuln) => (
              <div key={vuln.id} className="glass-panel p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className={`font-bold ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>{vuln.name}</h4>
                  <span
                    className={`text-xs px-2 py-1 rounded font-bold ${
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
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{vuln.description}</p>
                <div className="text-xs text-cyan-300">CVSS: {vuln.cvss}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Proof of Concept */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-orange-400">Proof of Concept (PoC)</h3>

          <div className="glass-panel p-4 rounded-lg space-y-3">
            <pre
              className={`text-xs overflow-x-auto max-h-64 overflow-y-auto font-mono p-3 rounded whitespace-pre-wrap break-words ${
                isDark ? 'text-gray-300 bg-gray-800/50' : 'text-slate-700 bg-slate-200/70'
              }`}
            >
              {data.poc}
            </pre>

            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(data.poc)}
                className="btn-secondary text-xs flex items-center gap-2"
              >
                <Copy size={14} />
                {copied ? 'Copied!' : 'Copy PoC'}
              </button>
            </div>
          </div>
        </div>

        {/* Mitigation Strategies */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-green-400">Mitigation Strategies</h3>

          <div className="space-y-2">
            {data.mitigation.map((strategy, idx) => (
              <div key={idx} className="glass-panel p-3 rounded-lg flex gap-3">
                <span className="text-cyan-400 font-bold flex-shrink-0">{idx + 1}.</span>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{strategy}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex gap-3 pt-4 border-t ${isDark ? 'border-gray-700/50' : 'border-slate-300'}`}>
          <button
            onClick={handleExport}
            className="btn-primary flex items-center gap-2 flex-1 justify-center"
          >
            <Download size={16} />
            Export Report (Markdown)
          </button>

          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;

