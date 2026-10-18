import React, { useState, useEffect } from 'react';
import { Laptop, Clock, FlaskConical } from 'lucide-react';

const TAB_TITLES = {
  dashboard:          'SOC Overview & Analytics',
  employees:          'Workstation & Entity Directory',
  alerts:             'Threat Incidents & Event Log',
  diagnostics:        'AI Behavioral Anomaly Diagnostics',
  sandbox:            'Counterfactual Digital Twin Sandbox',
  research:           'Empirical Drift Research Laboratory',
  'experiment-suite': '30-Trial Statistical Validation Suite',
  profile:            'Workstation Telemetry Audit',
};

export default function TopHeader({ currentTab, selectedEmployeeId }) {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: '2-digit' }));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const pageTitle = currentTab === 'profile' && selectedEmployeeId
    ? `Workstation Audit: ${selectedEmployeeId}`
    : (TAB_TITLES[currentTab] || 'Security Console');

  return (
    <header style={{
      height: '52px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)'
    }}>

      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontSize: '12px',
          fontWeight: 700,
          color: '#64748b',
          letterSpacing: '0.04em',
          textTransform: 'uppercase'
        }}>
          SOC Portal
        </span>
        <span style={{ color: '#cbd5e1', fontSize: '13px' }}>/</span>
        <span style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: 700, letterSpacing: '-0.01em' }}>
          {pageTitle}
        </span>
      </div>

      {/* Right Side Telemetry & Status Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

        {/* Local Host Node Chip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '4px 10px',
          borderRadius: '6px',
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border-default)',
          fontSize: '12px',
          color: '#334155',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <Laptop size={13} color="#2563eb" />
          <span style={{ color: '#64748b', fontWeight: 500, fontSize: '11.5px' }}>Endpoint:</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#0f172a', fontWeight: 600, fontSize: '11.5px' }}>
            LAPTOP-9O7EN8S0
          </span>
          <span className="status-dot status-dot-active" style={{ marginLeft: '2px' }} />
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '18px', backgroundColor: '#e2e8f0' }} />

        {/* Live Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: '#475569',
          fontWeight: 500
        }}>
          <Clock size={13} color="#64748b" />
          <span>{currentDate}</span>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{currentTime}</span>
        </div>

        {/* Research Environment Tag */}
        <div style={{
          padding: '3px 10px',
          borderRadius: '9999px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1d4ed8',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <FlaskConical size={11} />
          Academic Lab
        </div>
      </div>
    </header>
  );
}
