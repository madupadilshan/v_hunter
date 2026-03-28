import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

/**
 * Uploader Component
 * Drag-and-drop file upload with support for APKs, EXEs, and documents
 */
function Uploader({ onFileUpload, scanning, disabled = false }) {
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
        ${isDragActive ? 'bg-gray-900/60 glow-border-cyan' : 'glow-border'}
        ${scanning ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-900/50'}
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-3 rounded-lg bg-gray-800/50">
          <Upload size={32} className={`transition-colors ${isDragActive ? 'text-cyan-400' : 'text-red-500'}`} />
        </div>

        {isDragActive ? (
          <div className="text-center">
            <p className="text-cyan-400 font-semibold">Drop files here...</p>
            <p className="text-xs text-gray-400 mt-1">Release to upload</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-100">{scanning ? 'Scanning...' : 'Drag and drop files here'}</p>
            <p className="text-xs text-gray-500 mt-1">APK, EXE, PDF, DOC, TXT</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {!scanning && (
            <>
              <span className="px-2 py-1 text-xs bg-gray-800/50 rounded text-gray-400">APK</span>
              <span className="px-2 py-1 text-xs bg-gray-800/50 rounded text-gray-400">EXE</span>
              <span className="px-2 py-1 text-xs bg-gray-800/50 rounded text-gray-400">PDF</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Uploader;

