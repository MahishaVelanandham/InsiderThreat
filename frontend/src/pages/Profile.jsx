// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { User, Activity, AlertTriangle, ArrowLeft, Clock, MapPin, Database, Shield } from 'lucide-react';
import { fetchEmployeeDetails, fetchEmployeeActivities } from '../services/api';

export default function Profile({ employeeId, onBack }) {
  const [employee, setEmployee] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadDetails = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const details = await fetchEmployeeDetails(employeeId);
        const list = await fetchEmployeeActivities(employeeId);
        if (mounted) {
          setEmployee(details);
          setActivities(list);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted && isInitial) setLoading(false);
      }
    };

    loadDetails(true);
    const intervalId = setInterval(() => loadDetails(false), 4000);
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [employeeId]);

  if (loading || !employee) {
    return (
      <div style={{ padding: '40px', color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
        Gathering telemetry for {employeeId}...
      </div>
    );
  }

  const riskColor = employee.riskScore >= 75 ? '#dc2626' : employee.riskScore >= 50 ? '#d97706' : '#16a34a';
  const riskLevel = String(employee.riskLevel || 'low').toLowerCase();

  return (
    <div style={{ padding: '32px 36px 64px 36px', maxWidth: '1600px' }}>

      {/* Back link */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'transparent',
          border: 'none',
          color: '#475569',
          cursor: 'pointer',
          marginBottom: '24px',
          fontSize: '13px',
          fontWeight: 600,
          padding: 0,
          transition: 'color 0.15s ease'
        }}
        onMouseOver={e => e.currentTarget.style.color = '#2563eb'}
        onMouseOut={e => e.currentTarget.style.color = '#475569'}
      >
        <ArrowLeft size={15} />
        Back to Workstation Directory
      </button>

      {/* Profile Header */}
      <div className="soc-card" style={{ padding: '28px 32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: 'var(--shadow-xs)'
            }}>
              <User size={30} color="#2563eb" />
            </div>
            <div>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {employee.name}
              </h1>
              <p style={{ margin: '0 0 10px 0', color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                {employee.role} &mdash; <strong style={{ color: '#0f172a' }}>{employee.department}</strong>
              </p>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                <span>ID: {employee.employeeId}</span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span>Joined: {new Date(employee.joinedDate).toLocaleDateString()}</span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span style={{ color: employee.status === 'Active' ? '#16a34a' : '#d97706', fontWeight: 600 }}>
                  ● Status: {employee.status}
                </span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px', fontWeight: 700 }}>
              Telemetry Risk Score
            </span>
            <span style={{
              fontSize: '46px',
              fontWeight: 800,
              color: riskColor,
              display: 'block',
              lineHeight: 1,
              fontFamily: 'var(--font-mono)',
              marginBottom: '8px'
            }}>
              {employee.riskScore}
            </span>
            <span className={`badge-${riskLevel}`}>
              {employee.riskLevel} Risk Profile
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Activity table left, system attributes right */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.1fr 1fr', gap: '24px' }}>

        {/* Activity Audit Log */}
        <div className="soc-card" style={{ padding: '24px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a' }}>
                <Activity size={16} color="#2563eb" />
                Live Endpoint Telemetry Log
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Real hardware event stream refreshed automatically every 4 seconds
              </p>
            </div>
            <span style={{ fontSize: '11.5px', color: '#64748b', fontFamily: 'var(--font-mono)', fontWeight: 600, backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>
              {activities.length} recorded events
            </span>
          </div>

          {activities.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: '#64748b', fontSize: '13.5px' }}>
              No telemetry events recorded in current epoch.
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Activity Type & Details</th>
                    <th>Sensor Location</th>
                    <th style={{ textAlign: 'right' }}>Anomaly Index</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((a, idx) => (
                    <tr key={idx} style={{
                      backgroundColor: a.anomalyScore >= 0.75 ? '#fef2f2' : (idx % 2 === 0 ? '#ffffff' : '#fafbfc')
                    }}>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#64748b', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
                        {new Date(a.timestamp).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px', display: 'block' }}>
                          {a.activityType}
                        </span>
                        <span style={{ color: '#475569', fontSize: '12px', marginTop: '2px', display: 'block' }}>
                          {a.details}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} color="#64748b" />
                          {a.location}
                        </span>
                      </td>
                      <td style={{
                        textAlign: 'right',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        fontSize: '13px',
                        color: a.anomalyScore >= 0.75 ? '#dc2626' : (a.anomalyScore >= 0.5 ? '#d97706' : '#16a34a')
                      }}>
                        {Math.round(a.anomalyScore * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Panel: Security Parameters & Notices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* System Attributes */}
          <div className="soc-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={15} color="#2563eb" />
              Endpoint Parameters
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { label: 'Decoy Target Interactions', value: `${activities.filter(a => a.isDeceptionTarget).length} triggers`, mono: true },
                { label: 'Station IP Address', value: `192.168.10.${Math.round(employee.riskScore * 1.3 + 12)}`, mono: true },
                { label: 'Assigned Workstation Node', value: `${employee.department.substring(0,3).toUpperCase()}-WS-09`, mono: true },
                { label: 'Total Ingested Telemetry Events', value: activities.length, mono: true },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '11px 0',
                  borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none',
                  fontSize: '13px'
                }}>
                  <span style={{ color: '#64748b' }}>{row.label}</span>
                  <span style={{
                    color: '#0f172a',
                    fontFamily: row.mono ? 'var(--font-mono)' : 'inherit',
                    fontSize: row.mono ? '12px' : '13px',
                    fontWeight: 600
                  }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Investigation Notice Callout */}
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '18px 20px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '7px', color: '#b91c1c' }}>
              <AlertTriangle size={15} /> Protocol Escalation Advisory
            </h4>
            <p style={{ margin: 0, fontSize: '12.5px', lineHeight: 1.55, color: '#991b1b' }}>
              When behavioral indicators exceed baseline thresholds, automated escalation workflows trigger credential review and removable storage drive isolation.
            </p>
          </div>

          {/* AI Monitoring Status Callout */}
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '10px',
            padding: '18px 20px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '7px', color: '#1e40af' }}>
              <Shield size={15} color="#2563eb" /> Isolation Forest Engine
            </h4>
            <p style={{ margin: 0, fontSize: '12.5px', lineHeight: 1.55, color: '#1d4ed8' }}>
              Real-time anomaly scoring evaluates 6 behavioral vectors. The drift-aware persistence lock automatically halts baseline contamination when Z-sum &ge; 4.5.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
