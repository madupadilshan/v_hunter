import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

/**
 * Uploader Component
 * Drag-and-drop file upload with support for APKs, EXEs, and documents
 */
function Uploader({ onFileUpload, scanning, disabled = false, theme = 'dark' }) {
  const isDark = theme === 'dark';
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.apk', '.exe'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'text/plain': ['.txt'],
    },
    disabled: scanning || disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        glass-panel p-6 rounded-lg cursor-pointer transition-all duration-300
        ${isDragActive ? (isDark ? 'bg-gray-900/60 glow-border-cyan' : 'bg-cyan-50/80 glow-border-cyan') : 'glow-border'}
        ${scanning ? 'opacity-60 cursor-not-allowed' : isDark ? 'hover:bg-gray-900/50' : 'hover:bg-white/95'}
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-slate-200/80'}`}>
          <Upload size={32} className={`transition-colors ${isDragActive ? 'text-cyan-400' : 'text-red-500'}`} />
        </div>

        {isDragActive ? (
          <div className="text-center">
            <p className="text-cyan-400 font-semibold">Drop files here...</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Release to upload</p>
          </div>
        ) : (
          <div className="text-center">
            <p className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>
              {scanning ? 'Scanning...' : 'Drag and drop files here'}
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-slate-600'}`}>APK, EXE, PDF, DOC, TXT</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {!scanning && (
            <>
              <span className={`px-2 py-1 text-xs rounded ${isDark ? 'bg-gray-800/50 text-gray-400' : 'bg-slate-200 text-slate-700'}`}>APK</span>
              <span className={`px-2 py-1 text-xs rounded ${isDark ? 'bg-gray-800/50 text-gray-400' : 'bg-slate-200 text-slate-700'}`}>EXE</span>
              <span className={`px-2 py-1 text-xs rounded ${isDark ? 'bg-gray-800/50 text-gray-400' : 'bg-slate-200 text-slate-700'}`}>PDF</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Uploader;

