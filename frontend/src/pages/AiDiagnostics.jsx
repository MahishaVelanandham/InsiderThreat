// src/pages/AiDiagnostics.jsx
import React, { useState, useEffect } from 'react';
import { BrainCircuit, ShieldAlert, Cpu, Info } from 'lucide-react';
import { fetchEmployees, fetchRiskAnalysis } from '../services/api';

export default function AiDiagnostics({ selectedEmployeeId }) {
  const [employees, setEmployees] = useState([]);
  const [activeEmpId, setActiveEmpId] = useState(selectedEmployeeId || '');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEmps = async () => {
      try {
        const list = await fetchEmployees();
        setEmployees(list);
        if (list.length > 0 && !activeEmpId) {
          setActiveEmpId(list[0].employeeId);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadEmps();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) setActiveEmpId(selectedEmployeeId);
  }, [selectedEmployeeId]);

  useEffect(() => {
    if (!activeEmpId) return;
    const loadAnalysis = async () => {
      setLoading(true);
      try {
        const res = await fetchRiskAnalysis(activeEmpId);
        if (res.success) setAnalysis(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalysis();
  }, [activeEmpId]);

  return (
    <div style={{ padding: '32px 36px 64px 36px', maxWidth: '1600px' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            AI Risk Diagnostics & Feature Attribution
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13.5px' }}>
            Isolation Forest telemetry isolation & statistical distance (Z-score sum) behavioral drift mapping
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Subject:</span>
          <select
            value={activeEmpId}
            onChange={(e) => setActiveEmpId(e.target.value)}
            style={{
              padding: '9px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              color: '#0f172a',
              fontSize: '13px',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600
            }}
          >
            {employees.map(e => (
              <option key={e.employeeId} value={e.employeeId}>
                {e.name} ({e.employeeId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading || !analysis ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '13.5px' }}>
          Evaluating behavioral vectors with Isolation Forest...
        </div>
      ) : (
        <div>
          {/* Academic Simulation Notice Callout */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '10px',
            padding: '14px 18px',
            fontSize: '13px',
            marginBottom: '24px',
            color: '#92400e',
            lineHeight: 1.5
          }}>
            <ShieldAlert size={17} style={{ flexShrink: 0, color: '#d97706', marginTop: '1px' }} />
            <div>
              <strong style={{ color: '#b45309' }}>Academic Prototype Environment:</strong> Anomaly indicators illustrate feature isolation mechanisms and behavioral drift clustering against established baseline distributions.
            </div>
          </div>

          {/* KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '24px' }}>
            {[
              {
                label: 'Evaluated Risk Level',
                value: analysis.data.riskLevel,
                sub: 'Extracted from 6 features',
                color: analysis.data.riskLevel === 'Critical' ? '#dc2626' : analysis.data.riskLevel === 'High' ? '#ea580c' : '#2563eb'
              },
              {
                label: 'Composite Risk Index',
                value: `${analysis.data.currentRisk}`,
                sub: 'Capped score out of 100',
                color: '#0f172a',
                bar: analysis.data.currentRisk,
                barColor: '#dc2626'
              },
              {
                label: 'Normality Index',
                value: `${analysis.data.normalityScore}%`,
                sub: 'Isolation Forest density',
                color: '#16a34a'
              },
              {
                label: 'Behavioral Drift',
                value: analysis.data.behavioralDriftScore,
                sub: 'Summed Z-score distance',
                color: '#ea580c'
              },
            ].map((card, i) => (
              <div key={i} className="soc-card" style={{ padding: '22px', textAlign: 'center' }}>
                <span style={{ fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  {card.label}
                </span>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '28px', fontWeight: 800, color: card.color, fontFamily: 'var(--font-mono)' }}>
                  {card.value}
                </h3>
                {card.bar !== undefined && (
                  <div style={{ height: '4px', backgroundColor: '#f1f5f9', borderRadius: '2px', width: '75%', margin: '8px auto' }}>
                    <div style={{ height: '100%', borderRadius: '2px', backgroundColor: card.barColor, width: `${card.bar}%` }} />
                  </div>
                )}
                <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>{card.sub}</span>
              </div>
            ))}
          </div>

          {/* Main Grid: Factors left, Engine specs right */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>

            {/* Contributing Factors */}
            <div className="soc-card" style={{ padding: '24px 26px' }}>
              <h3 style={{ margin: '0 0 18px 0', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={16} color="#2563eb" />
                Contributing Behavioral Drift Factors
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analysis.data.mainContributingFactors.map((f, idx) => (
                  <div key={idx} style={{
                    padding: '14px 16px',
                    backgroundColor: '#fafbfc',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{f.factor}</strong>
                      <span className={`badge-${String(f.impact || 'low').toLowerCase()}`}>
                        {f.impact} IMPACT
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px' }}>
                        <div style={{
                          height: '100%',
                          borderRadius: '3px',
                          backgroundColor: f.impact === 'Critical' || f.impact === 'High' ? '#dc2626' : '#d97706',
                          width: `${Math.min(100, (f.weight || 10) * 2.5)}%`
                        }} />
                      </div>
                      <span style={{ fontSize: '12px', color: '#475569', fontFamily: 'var(--font-mono)', fontWeight: 600, width: '42px', textAlign: 'right' }}>
                        +{f.weight || 10}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Engine Overview */}
            <div className="soc-card" style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BrainCircuit size={16} color="#2563eb" />
                  Isolation Forest Architecture
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Microservice operational parameters</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  { label: 'Active Microservice', value: analysis.aiEngine, mono: true },
                  { label: 'Core Classifier', value: 'scikit-learn IsolationForest', mono: false },
                  { label: 'Baseline Training Size', value: '600 historical logs', mono: true },
                  { label: 'Evaluated Vector Dimension', value: '6 distinct parameters', mono: true },
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

              {/* Academic Insight Box */}
              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '14px 16px',
                marginTop: 'auto'
              }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Info size={13} /> Algorithmic Rationale
                </span>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#1d4ed8', lineHeight: 1.55 }}>
                  Outliers isolate close to the tree root with short path lengths, whereas normal behavioral samples require significantly more recursive splits.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
