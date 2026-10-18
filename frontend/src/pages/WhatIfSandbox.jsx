// src/pages/WhatIfSandbox.jsx
import React, { useState } from 'react';
import { SlidersHorizontal, ShieldAlert, Zap, ArrowUpRight, ArrowDownRight, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { runWhatIfSimulation } from '../services/api';

export default function WhatIfSandbox() {
  const [loginHour, setLoginHour] = useState(9);
  const [sessionDuration, setSessionDuration] = useState(480);
  const [fileCount, setFileCount] = useState(15);
  const [usbUsage, setUsbUsage] = useState(0);
  const [appActivity, setAppActivity] = useState('Normal Office Apps');
  const [networkMB, setNetworkMB] = useState(120);
  const [baselineRisk, setBaselineRisk] = useState(20);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const payload = {
        loginHour,
        sessionDurationMin: sessionDuration,
        fileAccessCount: fileCount,
        usbUsage,
        appActivity,
        networkActivityMB: networkMB,
        baselineRisk
      };
      const res = await runWhatIfSimulation(payload);
      if (res.success) setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLoginHour(9);
    setSessionDuration(480);
    setFileCount(15);
    setUsbUsage(0);
    setAppActivity('Normal Office Apps');
    setNetworkMB(120);
    setBaselineRisk(20);
    setResult(null);
    setDetailsExpanded(false);
  };

  const sliderRow = (label, value, display, min, max, step, setter) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
        <span style={{ color: '#475569', fontWeight: 600 }}>{label}</span>
        <strong style={{ color: '#0f172a', fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}>{display}</strong>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => setter(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
      />
    </div>
  );

  const selectStyle = {
    width: '100%',
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

  return (
    <div style={{ padding: '32px 36px 64px 36px', maxWidth: '1600px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Counterfactual Digital Twin Sandbox
        </h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13.5px' }}>
          Simulate counterfactual behavioral perturbations on the entity's digital twin to evaluate AI threat classification impact
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>

        {/* Parameters Panel */}
        <div className="soc-card" style={{ padding: '24px 26px' }}>
          <h3 style={{ margin: '0 0 22px 0', fontSize: '13.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={15} color="#2563eb" />
            Behavioral Parameter Sliders
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {sliderRow('Login Time', loginHour, `${loginHour}:00 hrs`, 0, 23, 1, setLoginHour)}
            {sliderRow('Session Duration', sessionDuration, `${sessionDuration} min`, 10, 1440, 10, setSessionDuration)}
            {sliderRow('File Access Operations', fileCount, `${fileCount} files`, 0, 500, 1, setFileCount)}
            {sliderRow('Outbound Network Volume', networkMB, `${networkMB} MB`, 5, 5000, 5, setNetworkMB)}

            {/* USB Peripheral Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>USB Peripheral Status</span>
              <select value={usbUsage} onChange={(e) => setUsbUsage(Number(e.target.value))} style={selectStyle}>
                <option value={0}>No USB Devices Connected</option>
                <option value={1}>1 External Removable USB Drive Attached</option>
                <option value={2}>Multiple Mass Storage Devices Connected</option>
              </select>
            </div>

            {/* Application Activity Profile */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>Application Activity Profile</span>
              <select value={appActivity} onChange={(e) => setAppActivity(e.target.value)} style={selectStyle}>
                <option value="Normal Office Apps">Standard Office (Excel, Word, Teams, Outlook)</option>
                <option value="VSCode Terminal Git">Development Stack (VSCode, Git, Python Scripts)</option>
                <option value="Command Prompt Admin Shell">Console Shells (PowerShell, Admin CMD, Bash)</option>
                <option value="Tor Proxy VPN Onion Browser">Anonymization Utilities (Tor, Proxy, VPN)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                onClick={handleSimulate}
                disabled={loading}
                className="btn-primary"
                style={{ flex: 1, padding: '12px' }}
              >
                <Zap size={14} />
                {loading ? 'Evaluating Digital Twin...' : 'Simulate Counterfactual Threat'}
              </button>
              <button
                onClick={handleReset}
                className="btn-secondary"
                style={{ padding: '12px 16px' }}
              >
                <RefreshCw size={13} /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {result ? (
            <div className="soc-card" style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

              <div>
                <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={12} /> Counterfactual Output
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '19px', fontWeight: 800, color: '#0f172a' }}>
                  Digital Twin Risk Prediction
                </h2>
              </div>

              {/* Risk Circle + Classification */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '16px 20px',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px'
              }}>
                <div style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  backgroundColor: result.currentRisk >= 75 ? '#fef2f2' : '#eff6ff',
                  border: `2.5px solid ${result.currentRisk >= 75 ? '#dc2626' : '#2563eb'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: result.currentRisk >= 75 ? '#dc2626' : '#2563eb',
                  flexShrink: 0
                }}>
                  {result.currentRisk}
                </div>
                <div>
                  <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block', fontWeight: 600 }}>Classification</span>
                  <strong style={{ fontSize: '16px', color: '#0f172a', display: 'block', margin: '2px 0' }}>
                    {result.riskLevel} Threat Level
                  </strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Normality Index: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#16a34a' }}>{result.normalityScore}%</span>
                  </span>
                </div>
              </div>

              {/* Risk Delta Indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: result.riskChange > 0 ? '#fef2f2' : result.riskChange < 0 ? '#f0fdf4' : '#ffffff'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px', fontWeight: 600 }}>
                    Risk Delta vs Fixed Baseline
                  </span>
                  <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>
                    {result.riskChange > 0 ? 'Elevated threat severity' : result.riskChange < 0 ? 'Reduced threat severity' : 'Baseline stability maintained'}
                  </span>
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '18px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: result.riskChange > 0 ? '#dc2626' : result.riskChange < 0 ? '#16a34a' : '#64748b'
                }}>
                  {result.riskChange > 0 ? <ArrowUpRight size={18} /> : result.riskChange < 0 ? <ArrowDownRight size={18} /> : null}
                  {result.riskChange > 0 ? `+${result.riskChange}` : result.riskChange}%
                </div>
              </div>

              {/* Explanation Quote */}
              <div>
                <span style={{ fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Model Rationale
                </span>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{result.explanation}"
                </p>
              </div>

              {/* Expandable Details */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
                <button
                  onClick={() => setDetailsExpanded(!detailsExpanded)}
                  style={{
                    width: '100%',
                    background: '#f8fafc',
                    border: 'none',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '11px 14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  <span>Calculation Details</span>
                  {detailsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {detailsExpanded && (
                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', backgroundColor: '#ffffff' }}>
                    {[
                      { label: 'Fixed Baseline Score', value: '10.0', mono: true },
                      { label: 'Current Risk (Capped)', value: result.currentRisk, mono: true },
                      { label: 'Predicted Risk (Capped)', value: result.predictedRisk, mono: true },
                      { label: 'Risk Delta (Y − X)', value: result.riskChange > 0 ? `+${result.riskChange}` : result.riskChange, mono: true },
                    ].map((row, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                        <span style={{ color: '#64748b' }}>{row.label}</span>
                        <strong style={{ color: '#0f172a', fontFamily: row.mono ? 'var(--font-mono)' : 'inherit' }}>{row.value}</strong>
                      </div>
                    ))}
                    {result.contributingFactors?.map((f, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '8px' }}>
                        <span style={{ color: '#64748b' }}>&bull; {f.factor.split(' (')[0]}</span>
                        <strong style={{ color: f.weight >= 20 ? '#dc2626' : '#d97706', fontFamily: 'var(--font-mono)' }}>+{f.weight}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Advisory Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '10px 12px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                fontSize: '11.5px',
                color: '#1e40af',
                lineHeight: 1.5
              }}>
                <ShieldAlert size={14} style={{ flexShrink: 0, marginTop: '1px', color: '#2563eb' }} />
                <span>Simulated dynamically using parameter inputs. Real hardware endpoint monitoring runs separately via the agent.</span>
              </div>
            </div>
          ) : (
            <div className="soc-card" style={{
              padding: '64px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: '#64748b',
              minHeight: '320px'
            }}>
              <Zap size={36} color="#cbd5e1" style={{ marginBottom: '16px' }} />
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                Adjust behavioral parameters and click Simulate
              </p>
              <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
                The Isolation Forest model will compute risk shifts and delta scores instantly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
