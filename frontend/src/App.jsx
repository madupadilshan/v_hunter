import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import DarkWeb from './pages/DarkWeb';
import Reports from './pages/Reports';
import Login from './pages/Login';

const THEME_STORAGE_KEY = 'v_hunter_theme';
const AUTH_STORAGE_KEY = 'v_hunter_auth';

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialAuthState() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEY) === 'authenticated';
}

/**
 * V HUNTER frontend entry
 * Main frontend entry with theme + routing
 */
function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [isAuthenticated, setIsAuthenticated] = useState(getInitialAuthState);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, isAuthenticated ? 'authenticated' : 'locked');
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <div className={`w-full min-h-screen ${theme === 'dark' ? 'bg-[#050511] text-gray-100' : 'bg-slate-50 text-slate-900'}`}>
          <Login
            theme={theme}
            onToggleTheme={() => setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))}
            onLogin={() => setIsAuthenticated(true)}
          />
        </div>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className={`w-full min-h-screen ${theme === 'dark' ? 'bg-[#050511] text-gray-100' : 'bg-slate-50 text-slate-900'}`}>
        <Navbar
          theme={theme}
          onToggleTheme={() => setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))}
          onLogout={() => setIsAuthenticated(false)}
        />
        <Routes>
          <Route path="/" element={<Home theme={theme} />} />
          <Route path="/scanner" element={<Scanner theme={theme} />} />
          <Route path="/darkweb" element={<DarkWeb theme={theme} />} />
          <Route path="/reports" element={<Reports theme={theme} />} />
        </Routes>
        <Footer theme={theme} />
      </div>
    </BrowserRouter>
  );
}

export default App;
