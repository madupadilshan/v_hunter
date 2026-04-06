import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Database, FileText, Moon, Sun, LogOut, UserRound, Save } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Live Threat Map', Icon: Zap },
  { path: '/scanner', label: 'Scanner', Icon: Database },
  { path: '/darkweb', label: 'Dark Web', Icon: Zap },
  { path: '/reports', label: 'Reports', Icon: FileText },
];

const PROFILE_STORAGE_KEY = 'v_hunter_profile';
const DEFAULT_PROFILE = {
  name: 'Security Analyst',
  email: 'test@gmail.com',
  role: 'Threat Analyst',
};

function getInitialProfile() {
  if (typeof window === 'undefined') {
    return DEFAULT_PROFILE;
  }

  const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_PROFILE;
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      name: typeof parsed?.name === 'string' && parsed.name.trim() ? parsed.name.trim() : DEFAULT_PROFILE.name,
      email: typeof parsed?.email === 'string' && parsed.email.trim() ? parsed.email.trim() : DEFAULT_PROFILE.email,
      role: typeof parsed?.role === 'string' && parsed.role.trim() ? parsed.role.trim() : DEFAULT_PROFILE.role,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

/**
 * Route-aware Navbar Component
 * Fixed top navigation with theme switch
 */
function Navbar({ theme = 'dark', onToggleTheme = () => {}, onLogout = null }) {
  const location = useLocation();
  const isDark = theme === 'dark';
  const menuRef = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState(getInitialProfile);
  const [formState, setFormState] = useState(getInitialProfile);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (!isProfileOpen) return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileOpen]);

  const initials = useMemo(() => {
    const letters = profile.name
      .split(' ')
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
    return letters || 'VH';
  }, [profile.name]);

  const getItemClasses = (path) => {
    const active = location.pathname === path;
    if (active) {
      return isDark
        ? 'text-emerald-500'
        : 'text-emerald-700';
    }

    return isDark ? 'text-white' : 'text-slate-900';
  };

  const openProfileMenu = () => {
    setFormState(profile);
    setProfileSaved(false);
    setIsProfileOpen(true);
  };

  const handleSaveProfile = (event) => {
    event.preventDefault();

    const nextProfile = {
      name: formState.name.trim() || DEFAULT_PROFILE.name,
      email: formState.email.trim() || DEFAULT_PROFILE.email,
      role: formState.role.trim() || DEFAULT_PROFILE.role,
    };

    setProfile(nextProfile);
    setFormState(nextProfile);
    setProfileSaved(true);
  };

  return (
    <nav className="fixed top-0 w-full z-50">
      <div
        className={`w-full backdrop-blur-md border-b ${
          isDark ? 'bg-[#02080a]/92 border-emerald-950/70' : 'bg-white/92 border-slate-300 shadow-sm'
        }`}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="h-10 w-10" aria-hidden="true" />

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
            <div className="inline-flex items-center gap-2.5">
              <img
                src="/logo/cdrd_logo.png"
                alt="CDRD Logo"
                className={`h-9 w-9 rounded-full object-cover border ${isDark ? 'border-cyan-800/60' : 'border-slate-300'}`}
              />
              <span className={`text-xl font-extrabold tracking-tight whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span>V</span>
                <span className="text-red-500"> HUNTER</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onToggleTheme}
              className={`h-8 w-8 rounded-sm border flex items-center justify-center transition-colors ${
                isDark
                  ? 'bg-[#021317] border-emerald-800/70 text-emerald-200 hover:bg-[#062026]'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>ONLINE</span>
            {typeof onLogout === 'function' && (
              <div className="relative ml-1" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => {
                    if (isProfileOpen) {
                      setIsProfileOpen(false);
                      return;
                    }
                    openProfileMenu();
                  }}
                  className={`h-8 w-8 rounded-full border flex items-center justify-center text-[10px] font-bold transition-colors ${
                    isDark
                      ? 'bg-[#021317] border-cyan-700/70 text-cyan-200 hover:bg-[#052028]'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                  aria-label="Open profile menu"
                  title="Profile"
                >
                  {initials}
                </button>

                {isProfileOpen && (
                  <div
                    className={`absolute right-0 top-10 w-[19rem] rounded-xl border p-4 space-y-3 backdrop-blur-xl shadow-xl ${
                      isDark ? 'bg-[#07131dcc] border-cyan-900/70' : 'bg-white/95 border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full border flex items-center justify-center ${
                          isDark ? 'bg-cyan-950/50 border-cyan-700/70 text-cyan-200' : 'bg-slate-100 border-slate-300 text-slate-700'
                        }`}
                      >
                        <UserRound className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>{profile.name}</p>
                        <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{profile.email}</p>
                      </div>
                    </div>

                    <form className="space-y-2.5" onSubmit={handleSaveProfile}>
                      <label className="block">
                        <span className={`mb-1 block text-[11px] uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                          Name
                        </span>
                        <input
                          type="text"
                          value={formState.name}
                          onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none ${
                            isDark
                              ? 'bg-[#08141f] border-slate-700 text-gray-100 focus:border-cyan-500'
                              : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600'
                          }`}
                        />
                      </label>

                      <label className="block">
                        <span className={`mb-1 block text-[11px] uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                          Email
                        </span>
                        <input
                          type="email"
                          value={formState.email}
                          onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none ${
                            isDark
                              ? 'bg-[#08141f] border-slate-700 text-gray-100 focus:border-cyan-500'
                              : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600'
                          }`}
                        />
                      </label>

                      <label className="block">
                        <span className={`mb-1 block text-[11px] uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                          Role
                        </span>
                        <input
                          type="text"
                          value={formState.role}
                          onChange={(event) => setFormState((prev) => ({ ...prev, role: event.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none ${
                            isDark
                              ? 'bg-[#08141f] border-slate-700 text-gray-100 focus:border-cyan-500'
                              : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600'
                          }`}
                        />
                      </label>

                      <button
                        type="submit"
                        className={`w-full rounded-lg border px-3 py-2 text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                          isDark
                            ? 'border-cyan-700/70 bg-cyan-950/40 text-cyan-200 hover:bg-cyan-900/45'
                            : 'border-cyan-300 bg-cyan-50 text-cyan-800 hover:bg-cyan-100'
                        }`}
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Profile
                      </button>
                    </form>

                    {profileSaved && (
                      <p className={`text-[11px] ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Profile updated successfully.</p>
                    )}

                    <button
                      type="button"
                      onClick={onLogout}
                      className={`w-full rounded-lg border px-3 py-2 text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                        isDark
                          ? 'border-red-700/60 bg-red-950/35 text-red-200 hover:bg-red-900/50'
                          : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 h-12 flex items-center bg-transparent">
        <div className="w-full overflow-x-auto">
          <div className="flex justify-start items-center gap-6 sm:gap-10 text-sm uppercase tracking-wide whitespace-nowrap min-w-max">
            {NAV_ITEMS.map(({ path, label, Icon }) => (
              <Link key={path} to={path} className={`inline-flex items-center gap-2 ${getItemClasses(path)}`}>
                <Icon className="w-3.5 h-3.5 opacity-80" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
