// controllers/researchController.js
// Relays research simulation to Python Flask AI microservice (Port 5001).
// Falls back to a JS implementation that mirrors Python logic exactly.
// Controlled Research Simulation — Not Production Evidence

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://127.0.0.1:5001';

// ── Application risk lookup (mirrors feature_extractor.py) ───────────────────
function appRiskScore(appActivity = '') {
  const a = appActivity.toLowerCase();
  if (a.includes('tor') || a.includes('vpn')) return 9.0;
  if (a.includes('powershell'))               return 5.0;
  if (a.includes('command') || a.includes('cmd')) return 4.0;
  return 1.0;
}

// ── Build scenario telemetry sequence ────────────────────────────────────────
function buildScenarioSequence(scenarioName, numDays, cfg) {
  // Seeded deterministic jitter using a simple LCG (matches Python rng behaviour approximately)
  // We use a fixed lookup table for the first 20 days derived from seed=42 normal(30,2)
  const FILE_JITTER_42 = [30,29,32,28,31,31,30,29,32,30,28,31,29,30,32,29,31,30,28,31];
  const NET_JITTER_42  = [150,147,154,143,152,153,149,146,155,150,143,152,146,151,155,146,152,149,143,152];

  const DRIFT_RATES = {
    stress_low:       { files: 1.0,  net: 4.0  },
    stress_medium:    { files: 3.0,  net: 12.0 },
    stress_high:      { files: 8.0,  net: 30.0 },
    stress_very_high: { files: 20.0, net: 80.0 },
  };

  const sequence = [];
  for (let i = 0; i < numDays; i++) {
    const day = i + 1;
    const item = {
      day,
      loginHour:          9,
      sessionDurationMin: 480,
      fileAccessCount:    FILE_JITTER_42[i % FILE_JITTER_42.length],
      usbUsage:           0,
      appActivity:        'Normal Office Apps',
      networkActivityMB:  NET_JITTER_42[i % NET_JITTER_42.length],
    };

    if (scenarioName === 'sudden_attack') {
      if (day > cfg.baseline_days) {
        item.loginHour          = 2;
        item.sessionDurationMin = 690;
        item.fileAccessCount    = 185;
        item.usbUsage           = 2;
        item.appActivity        = 'Tor Browser VPN Tunnel';
        item.networkActivityMB  = 1200;
      }
    } else if (scenarioName === 'gradual_drift') {
      const pb = Math.max(0, day - cfg.baseline_days);
      if (pb > 0) {
        item.fileAccessCount   = Math.min(240, item.fileAccessCount + pb * 15);
        item.networkActivityMB = Math.min(1500, item.networkActivityMB + pb * 55);
        if (pb >= 3) item.appActivity = 'Command Prompt Admin Shell';
        if (pb >= 5) { item.loginHour = Math.max(7, 9 - Math.floor(pb / 2)); item.appActivity = 'PowerShell Console Exec'; }
        if (pb >= 6) item.usbUsage = 1;
        if (pb >= 7) { item.loginHour = 2; item.usbUsage = 2; item.appActivity = 'Tor Browser VPN Tunnel'; }
      }
    } else if (DRIFT_RATES[scenarioName]) {
      const rate = DRIFT_RATES[scenarioName];
      const pb = Math.max(0, day - cfg.baseline_days);
      if (pb > 0) {
        item.fileAccessCount   = Math.min(500,  item.fileAccessCount   + pb * rate.files);
        item.networkActivityMB = Math.min(3000, item.networkActivityMB + pb * rate.net);
      }
    }
    // 'normal': use seeded values unchanged
    sequence.push(item);
  }
  return sequence;
}

// ── Statistical metrics ────────────────────────────────────────────────────────
function computeAggregateMetrics(timeline, alertKey, driftStartDay) {
  const TP = timeline.filter(t => t.ground_truth === 1 &&  t[alertKey]).length;
  const FP = timeline.filter(t => t.ground_truth === 0 &&  t[alertKey]).length;
  const TN = timeline.filter(t => t.ground_truth === 0 && !t[alertKey]).length;
  const FN = timeline.filter(t => t.ground_truth === 1 && !t[alertKey]).length;

  const precision     = (TP + FP) > 0 ? +((TP / (TP + FP)).toFixed(3)) : null;
  const recall        = (TP + FN) > 0 ? +((TP / (TP + FN)).toFixed(3)) : null;
  const f1            = (precision !== null && recall !== null && (precision + recall) > 0)
                        ? +((2 * precision * recall / (precision + recall)).toFixed(3)) : null;

  const firstAlert = timeline.find(t => t[alertKey]);
  const firstDay   = firstAlert ? firstAlert.day : null;
  const avgDelay   = (driftStartDay !== null && firstDay !== null) ? firstDay - driftStartDay : null;

  return {
    TP, FP, TN, FN,
    precision,
    recall,
    f1,
    detection_rate:       recall,
    avg_detection_delay:  avgDelay,
    first_detection_day:  firstDay,
    fn_days:  timeline.filter(t => t.ground_truth === 1 && !t[alertKey]).map(t => t.day),
    fp_days:  timeline.filter(t => t.ground_truth === 0 &&  t[alertKey]).map(t => t.day),
    has_false_negative: FN > 0,
  };
}

// ── JS Fallback simulation (mirrors Python logic) ─────────────────────────────
function runJsFallbackResearchSimulation(scenario, userConfig = {}) {
  const cfg = {
    detection_threshold:  50,
    drift_lock_threshold: 4.5,
    adaptation_alpha:     0.15,
    baseline_days:        3,
    min_persistence_days: 1,
    num_days:             14,
    random_seed:          42,
    ...userConfig,
  };

  const THRESHOLD   = cfg.detection_threshold;
  const LOCK_THRESH = cfg.drift_lock_threshold;
  const ALPHA       = cfg.adaptation_alpha;
  const MIN_PERSIST = cfg.min_persistence_days;
  const BASELINE_DAYS = cfg.baseline_days;

  // Original baseline (research-relative)
  const origMeans = { login_hour: 9, session_duration_min: 480, app_activity_risk: 1.0, file_activity_count: 30, usb_activity: 0, network_activity_mb: 150 };
  const origStds  = { login_hour: 2, session_duration_min: 60,  app_activity_risk: 1.0, file_activity_count: 8,  usb_activity: 0.3, network_activity_mb: 40  };

  const COLS = ['login_hour','session_duration_min','app_activity_risk','file_activity_count','usb_activity','network_activity_mb'];

  // Convert telemetry item → feature vector
  function toFeatures(item) {
    return {
      login_hour:           item.loginHour,
      session_duration_min: item.sessionDurationMin,
      app_activity_risk:    appRiskScore(item.appActivity),
      file_activity_count:  item.fileAccessCount,
      usb_activity:         item.usbUsage,
      network_activity_mb:  item.networkActivityMB,
    };
  }

  // Simple risk formula: mirrors Python (100-normality)*0.6 + drift*40
  // We approximate normality via Z-score distance from reference
  function computeRisk(features, means, stds) {
    const zSum = COLS.reduce((acc, col) => acc + Math.abs(features[col] - means[col]) / stds[col], 0);
    // Normality: inversely proportional to Z-score sum
    const normality = Math.max(5, Math.min(99, 100 - zSum * 7));
    const drift     = Math.min(1.0, zSum / 10.0);
    return Math.max(10, Math.min(100, +((( 100 - normality) * 0.6 + drift * 40).toFixed(1))));
  }

  const adaptMeans = { ...origMeans };
  const adaptStds  = { ...origStds  };
  const driftMeans = { ...origMeans };
  const driftStds  = { ...origStds  };
  let driftLocked = false;
  let consecutiveDriftDays = 0;

  const sequence = buildScenarioSequence(scenario, cfg.num_days, cfg);
  const timeline = [];

  for (const step of sequence) {
    const f = toFeatures(step);
    const day = step.day;

    // Z-score from original
    const origDriftSum = COLS.reduce((acc, col) => acc + Math.abs(f[col] - origMeans[col]) / origStds[col], 0);
    const driftScoreNorm = +Math.min(1, origDriftSum / 10).toFixed(3);

    // Detector 1: Static
    const staticRisk = computeRisk(f, origMeans, origStds);

    // Detector 2: Adaptive — measure THEN update
    const adaptRisk = computeRisk(f, adaptMeans, adaptStds);
    for (const col of COLS) {
      adaptMeans[col] = (1 - ALPHA) * adaptMeans[col] + ALPHA * f[col];
      const res = Math.abs(f[col] - adaptMeans[col]);
      adaptStds[col]  = Math.max(origStds[col] * 0.3, (1 - ALPHA) * adaptStds[col] + ALPHA * res);
    }

    // Detector 3: Drift-Aware — check persistence, then measure, then conditionally update
    if (origDriftSum > LOCK_THRESH) {
      consecutiveDriftDays++;
    } else {
      consecutiveDriftDays = 0;
    }
    if (consecutiveDriftDays >= MIN_PERSIST && !driftLocked) driftLocked = true;

    let driftRisk = computeRisk(f, driftMeans, driftStds);
    if (driftLocked) {
      const excessRatio = Math.min(2.0, origDriftSum / LOCK_THRESH);
      const lockFloor   = +Math.min(90, 55 + (excessRatio - 1) * 20).toFixed(1);
      driftRisk = Math.max(driftRisk, lockFloor);
    }
    if (!driftLocked) {
      for (const col of COLS) {
        driftMeans[col] = (1 - ALPHA) * driftMeans[col] + ALPHA * f[col];
        const res = Math.abs(f[col] - driftMeans[col]);
        driftStds[col]  = Math.max(origStds[col] * 0.3, (1 - ALPHA) * driftStds[col] + ALPHA * res);
      }
    }

    // Ground truth
    let groundTruth = 0;
    if (scenario !== 'normal' && day > BASELINE_DAYS) groundTruth = 1;

    timeline.push({
      day,
      loginHour:          step.loginHour,
      sessionDurationMin: step.sessionDurationMin,
      fileAccessCount:    step.fileAccessCount,
      usbUsage:           step.usbUsage,
      appActivity:        step.appActivity,
      networkActivityMB:  step.networkActivityMB,
      ground_truth:       groundTruth,
      adaptive_mean_files: +adaptMeans.file_activity_count.toFixed(1),
      drift_mean_files:    +driftMeans.file_activity_count.toFixed(1),
      static_risk:         staticRisk,
      static_alert:        staticRisk >= THRESHOLD,
      adaptive_risk:       adaptRisk,
      adaptive_alert:      adaptRisk >= THRESHOLD,
      drift_aware_risk:    driftRisk,
      drift_aware_alert:   driftRisk >= THRESHOLD,
      orig_drift_sum:         +origDriftSum.toFixed(3),
      drift_score_normalised: driftScoreNorm,
      consecutive_drift_days: consecutiveDriftDays,
      adaptation_locked:      driftLocked,
    });
  }

  const driftStartDay = scenario === 'normal' ? null : BASELINE_DAYS + 1;
  const driftRateLabel = scenario.startsWith('stress_')
    ? scenario.replace('stress_', '').replace(/_/g, ' ') : null;

  return {
    success: true,
    scenario,
    timeline,
    experiment_config: {
      random_seed:          cfg.random_seed,
      num_days:             cfg.num_days,
      baseline_days:        BASELINE_DAYS,
      drift_start_day:      driftStartDay,
      detection_threshold:  THRESHOLD,
      drift_lock_threshold: LOCK_THRESH,
      adaptation_alpha:     ALPHA,
      min_persistence_days: MIN_PERSIST,
      adaptation_rate:      `EMA alpha=${ALPHA.toFixed(2)} per day`,
      ground_truth_rule:    scenario === 'normal'
        ? 'All days = Normal'
        : `Days 1-${BASELINE_DAYS} = Normal; Days ${BASELINE_DAYS+1}-${cfg.num_days} = Suspicious${driftRateLabel ? ` (${driftRateLabel} drift)` : ''}`,
    },
    detector_metrics: {
      static:     computeAggregateMetrics(timeline, 'static_alert',     driftStartDay),
      adaptive:   computeAggregateMetrics(timeline, 'adaptive_alert',   driftStartDay),
      drift_aware: computeAggregateMetrics(timeline, 'drift_aware_alert', driftStartDay),
    },
    isSimulated: true,
    aiEngine: 'JS Fallback Research Engine',
    label: 'Controlled Research Simulation — Not Production Evidence',
  };
}

// ── Express handler ───────────────────────────────────────────────────────────
const runResearchSimulation = async (req, res) => {
  const { scenario = 'gradual_drift', config } = req.body;
  try {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${PYTHON_AI_URL}/research/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, config }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();
    return res.json({ aiEngine: 'Python Isolation Forest (Port 5001)', ...json });

  } catch (err) {
    console.warn(`[ResearchController] Python offline (${err.message}) — JS fallback`);
    const results = runJsFallbackResearchSimulation(scenario, config || {});
    return res.json(results);
  }
};

const runExperimentSuite = async (req, res) => {
  const { config } = req.body;
  try {
    // Set Express response timeout to 3 minutes for heavy batch computation
    res.setTimeout(180000);
    const controller = new AbortController();
    // 3 minute timeout: 4 levels x num_trials x simulation — can be slow
    const timeoutId = setTimeout(() => controller.abort(), 180000);

    const response = await fetch(`${PYTHON_AI_URL}/research/experiment-suite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const rawText = await response.text();
    const cleanedText = rawText
      .replace(/:\s*Infinity\b/g, ': 0.0')
      .replace(/:\s*-Infinity\b/g, ': 0.0')
      .replace(/:\s*NaN\b/g, ': null');

    const json = JSON.parse(cleanedText);
    return res.json(json);

  } catch (err) {
    console.error(`[ResearchController] Experiment suite failed: ${err.message}`);
    return res.status(500).json({ success: false, message: `Experiment suite error: ${err.message}. Make sure the Python AI service is running on port 5001.` });
  }
};

module.exports = { runResearchSimulation, runExperimentSuite };
