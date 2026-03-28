import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import DarkWeb from './pages/DarkWeb';
import Reports from './pages/Reports';
import './App.css';

/**
 * V HUNTER - AI-Driven Universal Vulnerability Scanner
 * Main Application with Multi-Page Routing
 */
function App() {
  return (
    <BrowserRouter>
      <div className="w-full min-h-screen bg-[#050511]">
        {/* Fixed Navigation Bar */}
        <Navbar />

        {/* Page Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/darkweb" element={<DarkWeb />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
