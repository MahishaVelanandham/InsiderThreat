import React, { useState } from 'react';
import { FlaskConical, Play, Download, BrainCircuit, Activity } from 'lucide-react';
import { runExperimentSuite } from '../services/api';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import './ExperimentSuite.css';

export default function ExperimentSuite() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const [config, setConfig] = useState({
    num_trials: 30,
    num_days: 14,
    baseline_days: 3,
    detection_threshold: 50,
    drift_lock_threshold: 4.5,
    adaptation_alpha: 0.15,
    min_persistence_days: 1,
    base_seed: 42
  });

  const CONFIG_LABELS = {
    num_trials: 'Number of Trials',
    num_days: 'Simulation Days',
    baseline_days: 'Baseline Days',
    detection_threshold: 'Detection Threshold',
    drift_lock_threshold: 'Drift Lock Threshold (Z-sum)',
    adaptation_alpha: 'Adaptation Rate (Alpha)',
    min_persistence_days: 'Min Persistence Days',
    base_seed: 'Base Random Seed'
  };

  const handleConfigChange = (e) => {
    setConfig({ ...config, [e.target.name]: Number(e.target.value) });
  };

  const handleRunTest = async () => {
    const testConfig = { ...config, num_trials: 5 };
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await runExperimentSuite(testConfig);
      setResults({ ...data, config: testConfig });
    } catch (err) {
      setError('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handleRunFull = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await runExperimentSuite(config);
      setResults({ ...data, config });
    } catch (err) {
      setError('Error: ' + err.message);
    }
    setLoading(false);
  };

  const exportRawCSV = () => {
    if (!results) return;
    const header = [
      'Level', 'Trial', 'Day', 'Ground Truth', 'Login Hour', 'Session Duration', 'Files Accessed',
      'USB Activity', 'Network MB', 'App Activity', 'Static Score', 'Static Alert',
      'Adaptive Score', 'Adaptive Alert', 'Drift-Aware Score', 'Drift-Aware Alert'
    ].join(',');
    const rows = [];
    Object.entries(results.levels).forEach(([level, levelData]) => {
      levelData.raw_trials.forEach(trial => {
        trial.timeline.forEach(r => {
          rows.push([
            level, r.trial ?? '', r.day, r.ground_truth,
            r.loginHour, r.sessionDurationMin, r.fileAccessCount, r.usbUsage,
            r.networkActivityMB, `"${r.appActivity || ''}"`,
            r.static_risk, r.static_alert ? 1 : 0,
            r.adaptive_risk, r.adaptive_alert ? 1 : 0,
            r.drift_aware_risk, r.drift_aware_alert ? 1 : 0
          ].join(','));
        });
      });
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'experiment_suite_raw_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSummaryCSV = () => {
    if (!results) return;
    const header = ['Level', 'Detector', 'Precision Mean', 'Precision SD', 'Recall Mean', 'Recall SD',
      'F1 Mean', 'F1 SD', 'FP Mean', 'FN Mean', 'Det Rate Mean', 'Avg Delay Mean'].join(',');
    const rows = [];
    Object.entries(results.levels).forEach(([level, data]) => {
      ['static', 'adaptive', 'drift_aware'].forEach(det => {
        const ag = data.aggregated[det];
        rows.push([
          level, det,
          ag.precision?.mean ?? '', ag.precision?.std ?? '',
          ag.recall?.mean ?? '', ag.recall?.std ?? '',
          ag.f1?.mean ?? '', ag.f1?.std ?? '',
          ag.FP?.mean ?? '', ag.FN?.mean ?? '',
          ag.detection_rate?.mean ?? '', ag.avg_detection_delay?.mean ?? ''
        ].join(','));
      });
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'experiment_suite_summary.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportConfigJSON = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results.config, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'experiment_config.json';
    link.click();
  };

  const formatCell = (statObj) => {
    if (!statObj || statObj.mean === null || statObj.mean === undefined) return 'N/A';
    return `${statObj.mean} ± ${statObj.std}`;
  };

  const LEVEL_LABELS = {
    stress_low: 'LOW',
    stress_medium: 'MEDIUM',
    stress_high: 'HIGH',
    stress_very_high: 'VERY HIGH'
  };

  const LEVELS = ['stress_low', 'stress_medium', 'stress_high', 'stress_very_high'];

  const getChartData = (metric) => {
    return LEVELS.map(level => {
      const data = results?.levels?.[level];
      if (!data) return { name: LEVEL_LABELS[level] };
      return {
        name: LEVEL_LABELS[level],
        Static: data.aggregated.static[metric]?.mean ?? 0,
        Adaptive: data.aggregated.adaptive[metric]?.mean ?? 0,
        'Drift-Aware': data.aggregated.drift_aware[metric]?.mean ?? 0,
      };
    });
  };

  const generateObservation = () => {
    if (!results) return '';
    const lines = [];
    const numTrials = results.config?.num_trials || '?';

    LEVELS.forEach(level => {
      const levelData = results.levels?.[level];
      if (!levelData) return;
      const stats = levelData.stats_comparison;
      const agg = levelData.aggregated;
      const label = LEVEL_LABELS[level];

      const driftF1 = agg.drift_aware?.f1?.mean ?? null;
      const adaptF1 = agg.adaptive?.f1?.mean ?? null;

      if (stats?.f1) {
        const { significant, p_value, drift_aware_mean, adaptive_mean } = stats.f1;
        if (significant) {
          const winner = drift_aware_mean > adaptive_mean ? 'Drift-Aware' : 'Adaptive';
          lines.push(`At ${label} drift: The ${winner} detector achieved a statistically significantly higher mean F1 score (p=${p_value}, α=0.05). Drift-Aware F1=${drift_aware_mean}, Adaptive F1=${adaptive_mean}.`);
        } else {
          lines.push(`At ${label} drift: No statistically significant difference in F1 score was found between Adaptive and Drift-Aware detectors (p=${p_value}, α=0.05). Drift-Aware F1=${driftF1}, Adaptive F1=${adaptF1}.`);
        }
      }
    });

    return lines.length > 0
      ? lines.join('\n\n')
      : `Based on ${numTrials} trials per drift level, the results above represent the calculated performance of each detector. Refer to the comparison table and charts for the measured values.`;
  };

  const Chart = ({ title, dataKey }) => (
    <div className="chart-box">
      <p className="chart-title">{title}</p>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <LineChart data={getChartData(dataKey)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#cbd5e1" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis stroke="#cbd5e1" tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)'
              }}
              itemStyle={{ color: '#0f172a', fontWeight: 600 }}
              labelStyle={{ color: '#64748b', marginBottom: '4px' }}
            />
            <Legend />
            <Line type="monotone" dataKey="Static" stroke="#64748b" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Adaptive" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Drift-Aware" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3.5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="suite-container">

      {/* Header */}
      <div className="suite-header">
        <div>
          <h1 className="suite-title">
            <BrainCircuit size={28} />
            Experiment Suite
          </h1>
          <p className="suite-subtitle">
            Controlled Research Simulation — Results are experimental and not production evidence.
          </p>
        </div>
      </div>

      {/* Configuration */}
      <div className="suite-panel">
        <h2 className="suite-panel-title">Experiment Configuration</h2>
        <div className="config-grid">
          {Object.keys(config).map(key => (
            <div key={key} className="config-group">
              <label className="config-label">{CONFIG_LABELS[key] || key}</label>
              <input
                type="number"
                name={key}
                value={config[key]}
                onChange={handleConfigChange}
                className="config-input"
                disabled={loading}
                step={key === 'adaptation_alpha' || key === 'drift_lock_threshold' ? 0.01 : 1}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
          <button onClick={handleRunTest} disabled={loading} className="btn-secondary">
            <Activity size={15} />
            Run Quick Validation (5 Trials)
          </button>
          <button onClick={handleRunFull} disabled={loading} className="btn-primary">
            <Play size={15} />
            Run Full Research Suite ({config.num_trials} Trials)
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="suite-panel" style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
          <p style={{ color: '#9ca3af', fontSize: '15px', fontWeight: 500 }}>
            Running batch simulation ({config.num_trials} trials × 4 drift levels = {config.num_trials * 4} simulations)...
          </p>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>
            {config.num_trials <= 5 ? 'Usually takes ~20 seconds.' : 'Evaluating Isolation Forest models. Takes about 1 to 2 minutes — please keep this page open.'}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="suite-panel" style={{ border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.05)', borderRadius: '16px', color: '#fca5a5', padding: '24px' }}>
          {error}
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <>
          {/* Export */}
          <div className="suite-panel">
            <h2 className="suite-panel-title" style={{ marginBottom: '16px' }}>
              <Download size={18} />
              &nbsp;Export Raw Data
            </h2>
            <div className="export-group">
              <button className="export-btn" onClick={exportRawCSV}>
                <Download size={14} />
                Export Raw Timeline CSV
              </button>
              <button className="export-btn" onClick={exportSummaryCSV}>
                <Download size={14} />
                Export Summary CSV
              </button>
              <button className="export-btn" onClick={exportConfigJSON}>
                <Download size={14} />
                Export Config JSON
              </button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="suite-panel">
            <h2 className="suite-panel-title">Detector Comparison — Mean ± SD over {results.config?.num_trials} Trials</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Drift Level</th>
                    <th>Detector</th>
                    <th className="text-center">Precision</th>
                    <th className="text-center">Recall</th>
                    <th className="text-center">F1 Score</th>
                    <th className="text-center">Avg FP</th>
                    <th className="text-center">Avg FN</th>
                    <th className="text-center">Detection Rate</th>
                    <th className="text-center">Avg Delay (Days)</th>
                  </tr>
                </thead>
                <tbody>
                  {LEVELS.map(level => {
                    if (!results.levels[level]) return null;
                    const data = results.levels[level].aggregated;
                    return ['static', 'adaptive', 'drift_aware'].map((det, idx) => (
                      <tr key={`${level}-${det}`} className={det === 'drift_aware' ? 'highlight-row' : ''}>
                        {idx === 0 && (
                          <td rowSpan={3} style={{ fontWeight: 'bold', color: '#0f172a', borderRight: '1px solid var(--border-subtle)', verticalAlign: 'middle', backgroundColor: '#f8fafc' }}>
                            {LEVEL_LABELS[level]}
                          </td>
                        )}
                        <td style={{ fontWeight: det === 'drift_aware' ? '700' : '500', color: det === 'drift_aware' ? '#15803d' : '#0f172a' }}>
                          {det === 'drift_aware' ? 'DRIFT-AWARE ★' : det.toUpperCase()}
                        </td>
                        <td className="text-center">{formatCell(data[det]?.precision)}</td>
                        <td className="text-center">{formatCell(data[det]?.recall)}</td>
                        <td className="text-center">{formatCell(data[det]?.f1)}</td>
                        <td className="text-center">{formatCell(data[det]?.FP)}</td>
                        <td className="text-center">{formatCell(data[det]?.FN)}</td>
                        <td className="text-center">{formatCell(data[det]?.detection_rate)}</td>
                        <td className="text-center">{formatCell(data[det]?.avg_detection_delay)}</td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts */}
          <div className="suite-panel">
            <h2 className="suite-panel-title">Visualizations</h2>
            <div className="charts-grid">
              <Chart title="F1 Score vs Drift Intensity" dataKey="f1" />
              <Chart title="Detection Rate vs Drift Intensity" dataKey="detection_rate" />
              <Chart title="Average Detection Delay (Days) vs Drift Intensity" dataKey="avg_detection_delay" />
              <Chart title="Avg False Negatives vs Drift Intensity" dataKey="FN" />
              <Chart title="Precision vs Drift Intensity" dataKey="precision" />
              <Chart title="Avg False Positives vs Drift Intensity" dataKey="FP" />
            </div>
          </div>

          {/* Statistical Tests */}
          <div className="suite-panel">
            <h2 className="suite-panel-title">Statistical Comparison — Adaptive vs Drift-Aware (Paired T-Test, α=0.05)</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Drift Level</th>
                    <th>Metric</th>
                    <th className="text-center">Adaptive Mean</th>
                    <th className="text-center">Drift-Aware Mean</th>
                    <th className="text-center">t-statistic</th>
                    <th className="text-center">p-value</th>
                    <th className="text-center">Significant?</th>
                  </tr>
                </thead>
                <tbody>
                  {LEVELS.map(level => {
                    if (!results.levels[level]) return null;
                    const stats = results.levels[level].stats_comparison;
                    const metrics = ['f1', 'detection_rate', 'avg_detection_delay'];
                    return metrics.map((metric, idx) => {
                      const s = stats?.[metric];
                      if (!s) return null;
                      return (
                        <tr key={`${level}-${metric}`}>
                          {idx === 0 && (
                            <td rowSpan={metrics.length} style={{ fontWeight: 'bold', color: '#0f172a', borderRight: '1px solid var(--border-subtle)', verticalAlign: 'middle', backgroundColor: '#f8fafc' }}>
                              {LEVEL_LABELS[level]}
                            </td>
                          )}
                          <td style={{ color: '#475569', fontWeight: 600 }}>{metric.replace(/_/g, ' ').toUpperCase()}</td>
                          <td className="text-center">{s.adaptive_mean}</td>
                          <td className="text-center">{s.drift_aware_mean}</td>
                          <td className="text-center">{s.stat}</td>
                          <td className="text-center">{s.p_value}</td>
                          <td className="text-center" style={{ fontWeight: '700', color: s.significant ? '#15803d' : '#dc2626' }}>
                            {s.significant ? 'YES (p < 0.05)' : 'NO (p ≥ 0.05)'}
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Auto Observation */}
          <div className="suite-panel">
            <h2 className="suite-panel-title">Automatically Generated Experimental Observation</h2>
            <div className="auto-observation" style={{ whiteSpace: 'pre-line' }}>
              {generateObservation()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
