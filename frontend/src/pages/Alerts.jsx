// src/pages/Alerts.jsx
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter } from 'lucide-react';
import { fetchAlerts } from '../services/api';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('All');
  const [status, setStatus] = useState('All');
  const [loading, setLoading] = useState(false);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const list = await fetchAlerts({ search, severity, status });
      setAlerts(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [search, severity, status]);

  const severities = ['All', 'Low', 'Medium', 'High', 'Critical'];
  const statuses = ['All', 'New', 'Investigating', 'Resolved', 'False Positive'];

  const selectStyle = {
    padding: '9px 12px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-default)',
    borderRadius: '6px',
    color: '#0f172a',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500
  };

  const severityBorderColor = (sev) => {
    if (sev === 'Critical') return '#dc2626';
    if (sev === 'High') return '#ea580c';
    if (sev === 'Medium') return '#2563eb';
    return '#16a34a';
  };

  return (
    <div style={{ padding: '32px 36px 64px 36px', maxWidth: '1600px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Threat Incidents & Anomaly Alerts
        </h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13.5px' }}>
          Behavioral anomaly alerts aggregated from continuous endpoint telemetry
        </p>
      </div>

      {/* Filters Bar */}
      <div className="soc-card" style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search by participant name, workstation ID, or alert ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 12px 10px 38px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              color: '#0f172a',
              fontSize: '13px',
              outline: 'none',
              fontFamily: 'var(--font-sans)'
            }}
          />
        </div>

        {/* Severity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} color="#64748b" />
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={selectStyle}>
            {severities.map(s => <option key={s} value={s}>{s} Severity</option>)}
          </select>
        </div>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Status:</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
            {statuses.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '13.5px' }}>
          Querying threat incident registers...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.length === 0 ? (
            <div className="soc-card" style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '13.5px' }}>
              No active alerts match the selected criteria.
            </div>
          ) : (
            alerts.map(a => (
              <div key={a.alertId} className="soc-card" style={{
                padding: '20px 24px',
                borderLeft: `4px solid ${severityBorderColor(a.severity)}`,
                backgroundColor: '#ffffff'
              }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                      {a.alertId}
                    </span>
                    <span className={`badge-${String(a.severity || 'low').toLowerCase()}`}>
                      {a.severity}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      color: '#475569',
                      fontWeight: 600
                    }}>
                      {a.status}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                      {a.category}
                    </h3>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', marginLeft: '16px' }}>
                    {new Date(a.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Content grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', gap: '20px' }}>
                  <div style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: '20px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 600 }}>
                      Subject Workstation
                    </span>
                    <strong style={{ fontSize: '13.5px', color: '#0f172a', display: 'block' }}>
                      {a.employeeName}
                    </strong>
                    <span style={{ fontSize: '11.5px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      {a.employeeId}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 600 }}>
                      Incident Context & Rationale
                    </span>
                    <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                      {a.reason}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
