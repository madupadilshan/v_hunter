import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Moon, Shield, Sun } from 'lucide-react';

const DEMO_EMAIL = 'test@gmail.com';
const DEMO_PASSWORD = '12345';

/**
 * Temporary login page
 * Uses hardcoded credentials until backend auth is available
 */
function Login({ theme = 'dark', onToggleTheme = () => {}, onLogin = () => {} }) {
  const isDark = theme === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setError('');
      onLogin();
      return;
    }

    setError('Invalid credentials. Use the demo credentials shown below.');
  };

  return (
    <main
      className={`cyber-login-bg relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-10 ${
        isDark
          ? 'bg-[#050511] text-gray-100'
          : 'bg-gradient-to-br from-slate-100 via-cyan-50 to-red-50 text-slate-900'
      }`}
    >
      <div className={`cyber-grid-overlay ${isDark ? 'cyber-grid-overlay-dark' : 'cyber-grid-overlay-light'}`} />
      <div className={`cyber-scanline ${isDark ? 'cyber-scanline-dark' : 'cyber-scanline-light'}`} />
      <div className="cyber-login-orb cyber-login-orb-cyan" />
      <div className="cyber-login-orb cyber-login-orb-red" />

      <section
        className={`relative z-20 w-full max-w-md rounded-2xl border backdrop-blur-xl p-6 sm:p-8 ${
          isDark
            ? 'bg-[#07101fcc] border-cyan-500/30 shadow-[0_0_0_1px_rgba(6,182,212,0.3),0_0_40px_rgba(14,116,144,0.35)]'
            : 'bg-white/90 border-slate-300 shadow-[0_14px_50px_rgba(15,23,42,0.18)]'
        }`}
      >
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${
                  isDark ? 'bg-cyan-950/70 border-cyan-500/60' : 'bg-cyan-50 border-cyan-300'
                }`}
              >
                <Shield className={`w-5 h-5 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`} />
              </span>
              <div>
                <p className={`text-xs uppercase tracking-[0.2em] ${isDark ? 'text-cyan-300/80' : 'text-cyan-700/80'}`}>
                  Access Control
                </p>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  <span>V</span>
                  <span className="text-red-500"> HUNTER</span>
                </h1>
              </div>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
              Sign in to continue to the cyber threat dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className={`h-9 w-9 rounded-md border flex items-center justify-center transition-colors ${
              isDark
                ? 'bg-[#021317] border-emerald-800/70 text-emerald-200 hover:bg-[#062026]'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </header>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className={`mb-2 block text-xs uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              Email
            </span>
            <div className="relative">
              <Mail className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-cyan-300/70' : 'text-cyan-700/70'}`} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                className="input-glow cyber-login-input"
                placeholder="you@domain.com"
                required
              />
            </div>
          </label>

          <label className="block">
            <span className={`mb-2 block text-xs uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              Password
            </span>
            <div className="relative">
              <Lock className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-cyan-300/70' : 'text-cyan-700/70'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="input-glow cyber-login-input cyber-login-input-with-action"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-300 hover:text-cyan-300' : 'text-slate-500 hover:text-slate-700'}`}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {error && (
            <p className={`rounded-lg border px-3 py-2 text-sm ${isDark ? 'border-red-500/40 bg-red-950/30 text-red-200' : 'border-red-300 bg-red-50 text-red-700'}`}>
              {error}
            </p>
          )}

          <button type="submit" className="w-full btn-primary py-2.5 font-semibold uppercase tracking-wider text-sm">
            Authenticate
          </button>
        </form>

        <div className={`mt-5 rounded-xl border p-3 text-sm ${isDark ? 'border-cyan-500/30 bg-cyan-950/20' : 'border-cyan-200 bg-cyan-50/80'}`}>
          <p className={`text-[11px] uppercase tracking-[0.22em] mb-2 ${isDark ? 'text-cyan-300/80' : 'text-cyan-700/80'}`}>
            Demo Credentials
          </p>
          <p className={`font-mono break-all ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>Email: {DEMO_EMAIL}</p>
          <p className={`font-mono ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>Password: {DEMO_PASSWORD}</p>
        </div>
      </section>
    </main>
  );
}

export default Login;
