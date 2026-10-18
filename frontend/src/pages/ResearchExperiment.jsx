import React, { useState, useMemo } from 'react';
import {
  FlaskConical, Sliders, Sparkles, Activity, Download,
  CheckCircle2, XCircle, AlertTriangle, Info, List
} from 'lucide-react';
import { runResearchSimulation } from '../services/api';
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine
} from 'recharts';
import './ResearchExperiment.css';

export default function ResearchExperiment() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [scenario, setScenario] = useState('gradual_drift');

  const [config, setConfig] = useState({
    baseline_days: 3,
    detection_threshold: 50,
    drift_lock_threshold: 4.5,
    adaptation_alpha: 0.15,
    min_persistence_days: 1,
    random_seed: 42,
    num_days: 14,
  });

  const SCENARIOS = [
    { id: 'normal', name: 'Scenario A: NORMAL STABILITY', desc: 'Employee behavior remains within the normal baseline.' },
    { id: 'sudden_attack', name: 'Scenario B: SUDDEN ANOMALY', desc: 'Employee behaves normally during the baseline period and then suddenly changes behavior.' },
    { id: 'gradual_drift', name: 'Scenario C: GRADUAL BEHAVIORAL DRIFT', desc: 'Behavior changes slowly over multiple days. The main research experiment.' },
  ];

  const STRESS_TESTS = [
    { id: 'stress_low', name: 'Low Drift', desc: 'Very slow, subtle drift' },
    { id: 'stress_medium', name: 'Medium Drift', desc: 'Moderate drift rate' },
    { id: 'stress_high', name: 'High Drift', desc: 'Fast drift rate' },
    { id: 'stress_very_high', name: 'Very High Drift', desc: 'Extremely fast drift' },
  ];

  const handleConfigChange = (e) => {
    setConfig({ ...config, [e.target.name]: Number(e.target.value) });
  };

  const handleRunSimulation = async (selectedScenario = scenario) => {
    setLoading(true);
    setScenario(selectedScenario);
    try {
      const data = await runResearchSimulation(selectedScenario, config);
      setResults(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleExportCSV = () => {
    if (!results || !results.timeline) return;
    const header = [
      'Day', 'Ground Truth', 'Login Hour', 'Session Duration', 'Files Accessed', 'USB Activity',
      'Network Outbound MB', 'Application Activity', 'Static Score', 'Static Alert',
      'Adaptive Score', 'Adaptive Alert', 'Drift-Aware Score', 'Drift-Aware Alert',
      'Drift Score', 'Retraining Locked'
    ].join(',');

    const rows = results.timeline.map(r => {
      return [
        r.day,
        r.ground_truth === 1 ? 'Suspicious' : 'Normal',
        r.loginHour + ':00',
        r.sessionDurationMin,
        r.fileAccessCount,
        r.usbUsage,
        r.networkActivityMB,
        `"${r.appActivity}"`,
        r.static_risk,
        r.static_alert ? 'YES' : 'NO',
        r.adaptive_risk,
        r.adaptive_alert ? 'YES' : 'NO',
        r.drift_aware_risk,
        r.drift_aware_alert ? 'YES' : 'NO',
        r.drift_score_normalised,
        r.adaptation_locked ? 'LOCKED' : 'NO'
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `research_experiment_${results.scenario}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="research-container">
      <div className="research-header">
        <div>
          <h1 className="research-title">
            <FlaskConical className="w-8 h-8 mr-4 text-indigo-400" />
            Behavioral Drift Research Lab
          </h1>
          <p className="research-subtitle">
            Controlled Research Simulation — Not Production Evidence
          </p>
        </div>
      </div>

      <div className="research-grid">
        <div className="sidebar-col">
          <div className="panel">
            <h2 className="panel-title">
              <Sliders className="w-5 h-5 mr-2 text-indigo-400" />
              Configuration
            </h2>
            <div>
              {[
                { name: 'baseline_days', label: 'Baseline Days', min: 1, max: 10, step: 1 },
                { name: 'num_days', label: 'Total Simulation Days', min: 5, max: 30, step: 1 },
                { name: 'detection_threshold', label: 'Detection Threshold', min: 10, max: 100, step: 1 },
                { name: 'drift_lock_threshold', label: 'Drift Threshold (Z-sum)', min: 1.0, max: 10.0, step: 0.1 },
                { name: 'adaptation_alpha', label: 'Adaptation Rate (Alpha)', min: 0.01, max: 1.0, step: 0.01 },
                { name: 'min_persistence_days', label: 'Min Persistence Days', min: 1, max: 5, step: 1 },
                { name: 'random_seed', label: 'Random Seed', min: 1, max: 9999, step: 1 },
              ].map(field => (
                <div key={field.name} className="config-group">
                  <label className="config-label">{field.label}</label>
                  <input
                    type="number"
                    name={field.name}
                    value={config[field.name]}
                    onChange={handleConfigChange}
                    min={field.min} max={field.max} step={field.step}
                    className="config-input"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2 className="panel-title">
              <Activity className="w-5 h-5 mr-2 text-emerald-400" />
              Run Scenarios
            </h2>
            {SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => handleRunSimulation(s.id)}
                disabled={loading}
                className="scenario-btn"
              >
                <div className="scenario-name">{s.name}</div>
                <div className="scenario-desc">{s.desc}</div>
              </button>
            ))}
            
            <div className="stress-tests-container">
              <div className="stress-tests-title">Adaptive Poisoning Stress Test</div>
              <div className="stress-tests-grid">
                {STRESS_TESTS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleRunSimulation(s.id)}
                    disabled={loading}
                    className="stress-btn"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="main-col">
          {results && (
            <div className="panel" style={{ marginBottom: 0 }}>
              <div className="results-header">
                <div>
                  <h2 className="results-title">{results.scenario.toUpperCase().replace(/_/g, ' ')}</h2>
                  <p className="results-meta">{results.experiment_config.ground_truth_rule}</p>
                  <p className="results-seed">Seed: {results.experiment_config.random_seed} | Engine: {results.aiEngine}</p>
                </div>
                <button onClick={handleExportCSV} className="export-btn">
                  <Download />
                  Export CSV
                </button>
              </div>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.timeline} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="day" stroke="#cbd5e1" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis stroke="#cbd5e1" tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)'
                      }}
                      itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                      labelStyle={{ color: '#64748b', marginBottom: '6px' }}
                    />
                    <Legend />
                    <ReferenceLine y={config.detection_threshold} stroke="#dc2626" strokeDasharray="3 3" label={{ position: 'top', value: 'Alert Threshold', fill: '#dc2626', fontSize: 12, fontWeight: 600 }} />
                    {results.experiment_config.drift_start_day && (
                      <ReferenceLine x={results.experiment_config.drift_start_day} stroke="#d97706" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Drift Starts', fill: '#d97706', fontSize: 12, fontWeight: 600 }} />
                    )}
                    
                    <Line type="monotone" dataKey="static_risk" name="Static Baseline" stroke="#64748b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="adaptive_risk" name="Adaptive (Blind)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="drift_aware_risk" name="Drift-Aware (Ours)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="observation-box">
                <strong>Observation: </strong>
                Detector performance varies according to drift intensity.
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Ground Truth</th>
                      <th>Login</th>
                      <th>Sess.</th>
                      <th>Files</th>
                      <th>USB</th>
                      <th>Net MB</th>
                      <th>App</th>
                      <th className="border-left">Static Score</th>
                      <th>Alert</th>
                      <th className="border-left">Adapt. Score</th>
                      <th>Alert</th>
                      <th className="border-left text-emerald">Drift-Aw Score</th>
                      <th className="text-emerald">Alert</th>
                      <th className="border-left">Drift Z-Sum</th>
                      <th>Locked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.timeline.map((row) => (
                      <tr key={row.day}>
                        <td style={{ fontWeight: 'bold' }}>{row.day}</td>
                        <td className={row.ground_truth === 1 ? 'text-red' : 'text-green'} style={{ fontWeight: '500' }}>
                          {row.ground_truth === 1 ? 'SUSPICIOUS' : 'NORMAL'}
                        </td>
                        <td>{row.loginHour}:00</td>
                        <td>{row.sessionDurationMin}</td>
                        <td>{row.fileAccessCount}</td>
                        <td>{row.usbUsage}</td>
                        <td>{row.networkActivityMB}</td>
                        <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.appActivity}>{row.appActivity}</td>
                        
                        <td className="border-left">{row.static_risk}</td>
                        <td>{row.static_alert ? <AlertTriangle className="alert-icon red" /> : <span className="text-muted">—</span>}</td>
                        
                        <td className="border-left">{row.adaptive_risk}</td>
                        <td>{row.adaptive_alert ? <AlertTriangle className="alert-icon red" /> : <span className="text-muted">—</span>}</td>
                        
                        <td className="border-left text-emerald">{row.drift_aware_risk}</td>
                        <td>{row.drift_aware_alert ? <AlertTriangle className="alert-icon green" /> : <span className="text-muted">—</span>}</td>
                        
                        <td className="border-left">{row.orig_drift_sum.toFixed(2)}</td>
                        <td>{row.adaptation_locked ? <span className="text-rose">LOCKED</span> : <span className="text-muted">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '32px' }}>
                <h3 className="panel-title">Detector Comparison Metrics</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Detector</th>
                        <th className="text-center">Det. Rate (Recall)</th>
                        <th className="text-center">FPR</th>
                        <th className="text-center">FNR</th>
                        <th className="text-center">Precision</th>
                        <th className="text-center">F1 Score</th>
                        <th className="text-center">Avg Delay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Static Baseline', data: results.detector_metrics.static },
                        { name: 'Adaptive (Blind)', data: results.detector_metrics.adaptive },
                        { name: 'Drift-Aware (Ours)', data: results.detector_metrics.drift_aware, highlight: true }
                      ].map(det => {
                        const totalN = results.timeline.filter(t=>t.ground_truth===0).length;
                        const totalP = results.timeline.filter(t=>t.ground_truth===1).length;
                        const fpr = totalN > 0 ? (det.data.FP / totalN).toFixed(2) : '0.00';
                        const fnr = totalP > 0 ? (det.data.FN / totalP).toFixed(2) : '0.00';
                        return (
                          <tr key={det.name} className={det.highlight ? 'highlight-row' : ''}>
                            <td style={{ fontWeight: '500' }}>{det.name}</td>
                            <td className="text-center">{det.data.detection_rate !== null ? det.data.detection_rate : 'N/A'}</td>
                            <td className="text-center">{fpr}</td>
                            <td className="text-center">{fnr}</td>
                            <td className="text-center">{det.data.precision !== null ? det.data.precision : 'N/A'}</td>
                            <td className="text-center">{det.data.f1 !== null ? det.data.f1 : 'N/A'}</td>
                            <td className="text-center">{det.data.avg_detection_delay !== null ? `${det.data.avg_detection_delay} days` : 'N/A'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {!results && !loading && (
            <div className="state-container">
              <FlaskConical className="state-icon" />
              <h3 className="state-title">Research Lab Ready</h3>
              <p className="state-desc">
                Configure your simulation parameters on the left, then select a scenario or stress test to run the behavioral drift experiment.
              </p>
            </div>
          )}

          {loading && (
            <div className="state-container">
              <div className="spinner" />
              <p style={{ color: 'var(--accent-indigo)' }}>Running controlled simulation...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
