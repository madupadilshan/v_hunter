import React from 'react';

/**
 * Global footer badge
 * Displays organization label at the bottom of authenticated views
 */
function Footer({ theme = 'dark' }) {
  const isDark = theme === 'dark';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 pointer-events-none">
      <div
        className={`mx-3 mb-3 rounded-xl border px-4 sm:px-6 py-2.5 backdrop-blur-lg ${
          isDark
            ? 'border-cyan-900/60 bg-[#04131fd9] shadow-[0_0_30px_rgba(6,182,212,0.12)]'
            : 'border-slate-300 bg-white/88 shadow-[0_12px_40px_rgba(15,23,42,0.16)]'
        }`}
      >
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <p className={`text-[10px] sm:text-[11px] uppercase tracking-[0.16em] font-semibold ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
            CENTRE FOR DEFENCE RESEARCH AND DEVELOPMENT (CDRD)
          </p>
          <p className={`text-[10px] sm:text-[11px] font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            V HUNTER SECURITY OPERATIONS - {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
