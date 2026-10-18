// src/pages/Dashboard.jsx
import React from 'react';
import {
  Users,
  AlertTriangle,
  Activity,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function Dashboard({ data, onSelectEmployee }) {
  if (!data) return (
    <div style={{ padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
      Loading SOC operations framework...
    </div>
  );

  const {
    totalEmployees = 0,
    activeEmployees = 0,
    highRiskEmployees = 0,
    totalAlerts = 0,
    overallOrganizationRisk = { score: 15, level: 'Low' },
    riskTrend = [],
    employeeRiskRanking = [],
    recentAlerts = [],
  } = data;

  const statCards = [
    { label: 'Monitored Endpoints', value: totalEmployees, icon: Users, accent: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    { label: 'Active Sessions', value: activeEmployees, icon: Activity, accent: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    { label: 'High-Risk Profiles', value: highRiskEmployees, icon: ShieldAlert, accent: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    { label: 'Alerts Triggered', value: totalAlerts, icon: AlertTriangle, accent: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  ];

  const orgRiskScore = overallOrganizationRisk.score;
  const orgRiskLevel = String(overallOrganizationRisk.level || 'low').toLowerCase();
  const orgRiskColor = orgRiskScore >= 70 ? '#dc2626' : orgRiskScore >= 40 ? '#d97706' : '#16a34a';

  return (
    <div style={{ padding: '32px 36px 64px 36px', maxWidth: '1600px' }}>

      {/* Page Title Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            SOC Operations & Behavioral Analytics
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13.5px' }}>
            Continuous endpoint monitoring & anomaly drift detection powered by Isolation Forest
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '8px 14px',
          fontSize: '12px',
          color: '#15803d',
          fontWeight: 700,
          letterSpacing: '0.02em',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <ShieldCheck size={14} color="#16a34a" />
          ISOLATION FOREST AI ACTIVE
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '28px' }}>
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="soc-card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                  {c.label}
                </span>
                <h3 style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                  {c.value}
                </h3>
              </div>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                backgroundColor: c.bg,
                border: `1px solid ${c.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <Icon size={20} color={c.accent} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.1fr 1fr', gap: '20px', marginBottom: '24px' }}>

        {/* Trend Area Chart */}
        <div className="soc-card" style={{ padding: '24px 26px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                7-Day Threat Trend & Anomaly Trajectory
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Mean daily risk scores evaluated across monitored endpoints
              </p>
            </div>
          </div>
          <div style={{ width: '100%', height: '230px' }}>
            <ResponsiveContainer>
              <AreaChart data={riskTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#cbd5e1" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis stroke="#cbd5e1" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                    color: '#0f172a',
                    fontWeight: 600
                  }}
                  labelStyle={{ color: '#64748b', marginBottom: '4px', fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="avgRisk" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#riskGrad)" name="Avg Risk Score" dot={{ stroke: '#2563eb', strokeWidth: 2, fill: '#ffffff', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Gauge */}
        <div className="soc-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px', display: 'block' }}>
            System-Wide Risk Index
          </span>
          <div style={{
            position: 'relative',
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            border: `7px solid #f1f5f9`,
            borderTopColor: orgRiskColor,
            borderRightColor: orgRiskScore >= 50 ? orgRiskColor : '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            transform: 'rotate(-45deg)'
          }}>
            <div style={{ transform: 'rotate(45deg)', textAlign: 'center' }}>
              <span style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>{orgRiskScore}</span>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: 500 }}>/ 100</p>
            </div>
          </div>
          <span className={`badge-${orgRiskLevel}`}>
            {overallOrganizationRisk.level} Risk Profile
          </span>
        </div>
      </div>

      {/* Bottom Row: Rankings & Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Highest Risk Profiles */}
        <div className="soc-card" style={{ padding: '24px 26px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={15} color="#dc2626" />
            Highest Risk Entity Profiles
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {employeeRiskRanking.map(e => (
              <div
                key={e.employeeId}
                onClick={() => onSelectEmployee(e.employeeId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  border: '1px solid transparent',
                  backgroundColor: '#ffffff'
                }}
                onMouseOver={el => {
                  el.currentTarget.style.backgroundColor = '#f8fafc';
                  el.currentTarget.style.borderColor = '#e2e8f0';
                }}
                onMouseOut={el => {
                  el.currentTarget.style.backgroundColor = '#ffffff';
                  el.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>{e.name}</p>
                  <span style={{ fontSize: '11.5px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                    {e.employeeId} &middot; {e.department}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span className={`badge-${String(e.riskLevel || 'low').toLowerCase()}`}>
                    {e.riskLevel}
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: e.riskScore >= 70 ? '#dc2626' : '#0f172a', width: '32px', textAlign: 'right' }}>
                    {e.riskScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts Feed */}
        <div className="soc-card" style={{ padding: '24px 26px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={15} color="#d97706" />
            Active Incident Feed
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recentAlerts.map(a => (
              <div key={a.alertId} style={{
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid #f1f5f9',
                borderLeft: `3.5px solid ${a.severity === 'Critical' ? '#dc2626' : a.severity === 'High' ? '#ea580c' : '#2563eb'}`,
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', fontFamily: 'var(--font-mono)' }}>
                    {a.alertId}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                    {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#0f172a', fontWeight: 700 }}>
                  {a.employeeName} <span style={{ color: '#64748b', fontWeight: 400, fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>({a.employeeId})</span>
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                  {a.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
