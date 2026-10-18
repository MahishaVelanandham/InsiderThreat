// src/App.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeDirectory from './pages/EmployeeDirectory';
import Alerts from './pages/Alerts';
import AiDiagnostics from './pages/AiDiagnostics';
import WhatIfSandbox from './pages/WhatIfSandbox';
import Profile from './pages/Profile';
import ResearchExperiment from './pages/ResearchExperiment';
import ExperimentSuite from './pages/ExperimentSuite';
import TopHeader from './components/TopHeader';
import { fetchDashboardData } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Authenticate session check
  useEffect(() => {
    const savedUser = localStorage.getItem('soc_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch Dashboard Stats periodically
  useEffect(() => {
    if (!user) return;
    const getStats = async () => {
      try {
        const d = await fetchDashboardData();
        setDashboardData(d);
      } catch (err) {
        console.error(err);
      }
    };
    getStats();
    const interval = setInterval(getStats, 10000); // refresh every 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  const handleLoginSuccess = (usr) => {
    localStorage.setItem('soc_user', JSON.stringify(usr));
    setUser(usr);
  };

  const handleLogout = () => {
    localStorage.removeItem('soc_user');
    setUser(null);
    setTab('dashboard');
    setSelectedEmployeeId(null);
  };

  const handleSelectEmployee = (empId) => {
    setSelectedEmployeeId(empId);
    setTab('profile');
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-root)' }}>
      
      {/* Sidebar Layout */}
      <Sidebar 
        currentTab={tab} 
        setTab={(newTab) => {
          setTab(newTab);
          setSelectedEmployeeId(null); // clear detail drill-downs
        }} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main Panel Content (Shifted 250px right to clear fixed sidebar) */}
      <div style={{ flex: 1, marginLeft: '250px', minWidth: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-root)' }}>
        <TopHeader currentTab={tab} selectedEmployeeId={selectedEmployeeId} />
        <main style={{ flex: 1 }}>
        {tab === 'dashboard' && (
          <Dashboard 
            data={dashboardData} 
            onSelectEmployee={handleSelectEmployee} 
          />
        )}
        {tab === 'employees' && (
          <EmployeeDirectory 
            onSelectEmployee={handleSelectEmployee} 
          />
        )}
        {tab === 'alerts' && (
          <Alerts />
        )}
        {tab === 'diagnostics' && (
          <AiDiagnostics 
            selectedEmployeeId={selectedEmployeeId} 
          />
        )}
        {tab === 'sandbox' && (
          <WhatIfSandbox />
        )}
        {tab === 'research' && (
          <ResearchExperiment />
        )}
        {tab === 'experiment-suite' && (
          <ExperimentSuite />
        )}
        {tab === 'profile' && selectedEmployeeId && (
          <Profile 
            employeeId={selectedEmployeeId} 
            onBack={() => setTab('employees')} 
          />
        )}
        </main>
      </div>

    </div>
  );
}
