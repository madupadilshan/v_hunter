import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Zap, Database, FileText } from 'lucide-react';

/**
 * Navbar Component
 * Fixed top navigation bar with glassmorphic design
 */
function Navbar() {
  const location = useLocation();

  // Check if a route is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-950/50 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <Shield 
              className="w-8 h-8 text-red-500 group-hover:text-red-400 transition-colors"
              fill="currentColor"
            />
            <div className="absolute inset-0 bg-red-500/20 blur-md group-hover:blur-lg transition-all"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold">
              <span className="text-gray-100">V</span>
              <span className="text-red-500 drop-shadow-lg"> HUNTER</span>
            </span>
            <span className="text-xs text-cyan-400/60 font-mono">Vulnerability Scanner</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-2">
          
          {/* Live Threat Map */}
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium ${
              isActive('/') 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                : 'text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10'
            }`}
          >
            <Zap className="w-4 h-4" />
            Live Threat Map
          </Link>

          {/* Vulnerability Scanner - Prominent Button */}
          <Link
            to="/scanner"
            className={`px-5 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 font-bold ${
              isActive('/scanner')
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/50 border border-red-400'
                : 'bg-red-600/40 text-red-200 hover:bg-red-600/60 hover:shadow-lg hover:shadow-red-500/30 border border-red-500/40'
            }`}
          >
            <Database className="w-4 h-4" />
            Scanner
          </Link>

          {/* Dark Web Intel */}
          <Link
            to="/darkweb"
            className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium ${
              isActive('/darkweb')
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                : 'text-gray-300 hover:text-purple-400 hover:bg-purple-500/10'
            }`}
          >
            <Zap className="w-4 h-4" />
            Dark Web
          </Link>

          {/* Reports Archive */}
          <Link
            to="/reports"
            className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium ${
              isActive('/reports')
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : 'text-gray-300 hover:text-green-400 hover:bg-green-500/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            Reports
          </Link>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-gray-400 font-mono">ONLINE</span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
