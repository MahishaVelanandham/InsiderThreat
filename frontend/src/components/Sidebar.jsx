import React from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  AlertTriangle,
  BrainCircuit,
  SlidersHorizontal,
  LogOut,
  FlaskConical,
  Activity,
  Shield
} from 'lucide-react';

export default function Sidebar({ currentTab, setTab, user, onLogout }) {
  const operationalItems = [
    { id: 'dashboard',   label: 'SOC Dashboard',          icon: LayoutDashboard },
    { id: 'employees',   label: 'Workstation Directory',   icon: Users },
    { id: 'alerts',      label: 'Threat Incidents',        icon: AlertTriangle },
    { id: 'diagnostics', label: 'Behavioral Diagnostics',  icon: BrainCircuit },
    { id: 'sandbox',     label: 'Counterfactual Digital Twin', icon: SlidersHorizontal },
  ];

  const researchItems = [
    { id: 'research',          label: 'Drift Research Lab',      icon: FlaskConical },
    { id: 'experiment-suite',  label: '30-Trial Eval Suite',     icon: Activity },
  ];

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = currentTab === item.id;
    return (
      <button
        onClick={() => setTab(item.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '11px',
          width: '100%',
          padding: '9px 12px',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: isActive ? '#eff6ff' : 'transparent',
          color: isActive ? '#1d4ed8' : '#475569',
          fontSize: '13px',
          fontWeight: isActive ? 600 : 500,
          textAlign: 'left',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          fontFamily: 'var(--font-sans)',
          position: 'relative'
        }}
        onMouseOver={e => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.color = '#0f172a';
          }
        }}
        onMouseOut={e => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#475569';
          }
        }}
      >
        <Icon 
          size={16} 
          color={isActive ? '#2563eb' : '#64748b'} 
          style={{ flexShrink: 0, transition: 'color 0.15s ease' }} 
        />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.label}
        </span>
        {isActive && (
          <span style={{
            position: 'absolute',
            right: '8px',
            width: '4px',
            height: '16px',
            backgroundColor: '#2563eb',
            borderRadius: '2px'
          }} />
        )}
      </button>
    );
  };

  const SectionLabel = ({ children }) => (
    <div style={{
      padding: '0 12px 6px 12px',
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase',
      color: '#94a3b8',
      letterSpacing: '0.06em'
    }}>
      {children}
    </div>
  );

  return (
    <aside style={{
      width: '250px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid var(--border-subtle)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      boxShadow: '1px 0 3px rgba(15, 23, 42, 0.03)'
    }}>

      {/* Brand Header */}
      <div style={{
        padding: '20px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 1px 2px rgba(37, 99, 235, 0.1)'
        }}>
          <Shield size={18} color="#2563eb" strokeWidth={2.4} />
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            BEHAVIORAL SOC
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
            Threat Intelligence Platform
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
        <div>
          <SectionLabel>Operations & Triage</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {operationalItems.map(item => <NavItem key={item.id} item={item} />)}
          </div>
        </div>

        <div>
          <SectionLabel>Research & Validation</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {researchItems.map(item => <NavItem key={item.id} item={item} />)}
          </div>
        </div>
      </div>

      {/* Footer: User Profile & Security Engine Status */}
      <div style={{
        padding: '14px 14px 16px 14px',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: '#fafbfc'
      }}>

        {/* Engine Status Chip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          padding: '6px 10px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <span style={{ fontSize: '11.5px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <span className="status-dot status-dot-active" />
            AI Model Active
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: '#64748b', fontWeight: 500 }}>
            iForest :5001
          </span>
        </div>

        {/* User Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '12px',
          padding: '4px 2px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#dbeafe',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1d4ed8',
            fontSize: '12px',
            fontWeight: 700
          }}>
            {(user?.name || 'M')[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Mahisha V'}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
              {user?.role || 'Lead Security Analyst'}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            width: '100%',
            padding: '8px 12px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            color: '#64748b',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontFamily: 'var(--font-sans)',
            boxShadow: 'var(--shadow-xs)'
          }}
          onMouseOver={e => {
            e.currentTarget.style.borderColor = '#fca5a5';
            e.currentTarget.style.color = '#dc2626';
            e.currentTarget.style.backgroundColor = '#fef2f2';
          }}
          onMouseOut={e => {
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.color = '#64748b';
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
        >
          <LogOut size={13} /> Sign Out Session
        </button>
      </div>
    </aside>
  );
}
