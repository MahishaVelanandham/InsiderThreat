# isolation_forest_model.py
# Implements the Scikit-learn Isolation Forest logic for anomaly scoring.
# Also calculates statistical drift and risk level.
# SIMULATION ONLY — Academic research prototype.

import math
import statistics
import warnings
warnings.filterwarnings('ignore')

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from baseline_generator import generate_baseline_data

class BehavioralThreatDetector:
    def __init__(self):
        self.model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
        self.feature_cols = [
            'login_hour', 'session_duration_min', 'app_activity_risk',
            'file_activity_count', 'usb_activity', 'network_activity_mb'
        ]
        self.baseline_df = None
        self.means = {}
        self.stds = {}
        
    def fit_baseline(self):
        """Train Isolation Forest on normal baseline data and save standard statistics."""
        self.baseline_df = generate_baseline_data(n_samples=600)
        self.model.fit(self.baseline_df[self.feature_cols])
        
        # Calculate mean & std for drift calculations (z-scoring)
        for col in self.feature_cols:
            self.means[col] = float(self.baseline_df[col].mean())
            self.stds[col] = float(self.baseline_df[col].std())
            if self.stds[col] == 0:
                self.stds[col] = 1.0

    def analyze_event(self, features):
        """
        Analyzes a single event dict:
        Returns normality score, drift score, risk level, and contributions.
        SIMULATION ONLY — Academic prototype.
        """
        if self.baseline_df is None:
            self.fit_baseline()
            
        # Convert dictionary to DataFrame for scikit-learn
        df_eval = pd.DataFrame([features])[self.feature_cols]
        
        # 1. Behavioral Drift (Z-Score accumulation)
        drift_contributions = {}
        total_drift = 0.0
        for col in self.feature_cols:
            val = float(features[col])
            mean = self.means[col]
            std = self.stds[col]
            z_score = abs(val - mean) / std
            drift_contributions[col] = z_score
            total_drift += z_score
            
        drift_score = float(np.clip(total_drift / 10.0, 0.0, 1.0))
        
        # 2. Gather Raw Contributions
        raw_factors = []
        
        # Login Hour check
        h = features['login_hour']
        if h < 6 or h > 21:
            raw_factors.append({
                'factor': f"Login at abnormal hour ({h}:00 hrs)",
                'impact': 'High' if (h < 4 or h > 23) else 'Medium',
                'raw_weight': float(np.clip(drift_contributions['login_hour'] * 12, 5, 40))
            })
            
        # Session duration check
        sd = features['session_duration_min']
        if sd > 600:
            raw_factors.append({
                'factor': f"Unusually long session ({sd} mins)",
                'impact': 'High' if sd > 800 else 'Medium',
                'raw_weight': float(np.clip(drift_contributions['session_duration_min'] * 10, 5, 30))
            })
            
        # File Activity Check
        fa = features['file_activity_count']
        if fa > 50:
            raw_factors.append({
                'factor': f"High volume file access ({fa} files)",
                'impact': 'Critical' if fa > 150 else 'High' if fa > 90 else 'Medium',
                'raw_weight': float(np.clip(drift_contributions['file_activity_count'] * 15, 5, 50))
            })
            
        # USB insertion check
        usb = features['usb_activity']
        if usb > 0:
            raw_factors.append({
                'factor': f"USB peripheral attached ({usb} count)",
                'impact': 'Critical' if usb >= 2 else 'High',
                'raw_weight': 35.0 if usb >= 2 else 20.0
            })
            
        # Network outbound check
        net = features['network_activity_mb']
        if net > 300:
            raw_factors.append({
                'factor': f"High volume network traffic ({net:.1f} MB)",
                'impact': 'Critical' if net > 1500 else 'High' if net > 600 else 'Medium',
                'raw_weight': float(np.clip(drift_contributions['network_activity_mb'] * 8, 5, 50))
            })
            
        # Suspicious app risk
        ar = features['app_activity_risk']
        if ar > 3.0:
            # Check if this app usage is combined with other anomalies
            has_other_anomaly = (
                (h < 6 or h > 21) or
                (sd > 600) or
                (fa > 50) or
                (usb > 0) or
                (net > 300)
            )
            
            if ar >= 8.0:
                # Privacy tool/Tor/VPN
                factor_name = "Unusual Application/Network Behavior"
                if has_other_anomaly:
                    raw_factors.append({
                        'factor': factor_name + " (Privacy tool combined with threat indicators)",
                        'impact': 'High',
                        'raw_weight': 30.0
                    })
                else:
                    raw_factors.append({
                        'factor': factor_name + " (Isolated privacy tool usage)",
                        'impact': 'Low',
                        'raw_weight': 5.0
                    })
            else:
                # Standard admin CLI
                raw_factors.append({
                    'factor': "Administrative Shell Console Executed",
                    'impact': 'Medium',
                    'raw_weight': 15.0
                })
                
        # 3. Calculate Normalized Scores
        base_risk = 10.0
        sum_raw_weights = sum(f['raw_weight'] for f in raw_factors)
        current_risk = base_risk + sum_raw_weights
        
        # Cap current_risk at 100 and scale contributions
        if current_risk > 100.0:
            scale = (100.0 - base_risk) / sum_raw_weights
            current_risk = 100.0
            for f in raw_factors:
                f['weight'] = round(f['raw_weight'] * scale, 1)
        else:
            current_risk = round(current_risk, 1)
            for f in raw_factors:
                f['weight'] = round(f['raw_weight'], 1)
                
        if not raw_factors:
            raw_factors.append({
                'factor': "Normal baseline behavior",
                'impact': 'Low',
                'weight': 5.0
            })
            current_risk = 15.0
            
        normality_percentage = round(100.0 - current_risk, 1)
        
        # Risk level determination
        if current_risk >= 75:
            risk_level = 'Critical'
        elif current_risk >= 50:
            risk_level = 'High'
        elif current_risk >= 30:
            risk_level = 'Medium'
        else:
            risk_level = 'Low'
            
        # Predicted risk: current_risk * 1.12, capped at 100
        predicted_risk = min(100.0, round(current_risk * 1.12, 1))
        
        return {
            'normality_score': normality_percentage,
            'behavioral_drift_score': round(drift_score, 2),
            'current_risk_score': current_risk,
            'predicted_risk': predicted_risk,
            'risk_level': risk_level,
            'feature_contributions': raw_factors
        }


    # ──────────────────────────────────────────────────────────────────────────
    # RESEARCH SIMULATION ENGINE
    # Controlled Research Simulation — Not Production Evidence
    # ──────────────────────────────────────────────────────────────────────────

    def _build_scenario_sequence(self, scenario_name, num_days, config):
        """
        Builds the per-day telemetry sequence for a named scenario.
        All values are deterministic given the random_seed in config.
        Returns list of dicts with raw telemetry fields.
        """
        rng = np.random.default_rng(config['random_seed'])

        # Normal baseline noise: small deterministic jitter within realistic range
        normal_files_seq  = np.round(rng.normal(30, 2, num_days)).astype(int).clip(24, 36).tolist()
        normal_net_seq    = np.round(rng.normal(150, 10, num_days), 1).clip(125, 175).tolist()
        normal_login_seq  = [9] * num_days
        normal_session_seq= [480] * num_days
        normal_usb_seq    = [0] * num_days
        normal_app_seq    = ['Normal Office Apps'] * num_days

        # Stress drift sequences by rate
        drift_rates = {
            'stress_low':       {'files': 1.0, 'net': 4.0},
            'stress_medium':    {'files': 3.0, 'net': 12.0},
            'stress_high':      {'files': 8.0, 'net': 30.0},
            'stress_very_high': {'files': 20.0, 'net': 80.0},
        }

        sequence = []
        for i, day in enumerate(range(1, num_days + 1)):
            item = {
                'day': day,
                'loginHour':          normal_login_seq[i],
                'sessionDurationMin': normal_session_seq[i],
                'fileAccessCount':    normal_files_seq[i],
                'usbUsage':           normal_usb_seq[i],
                'appActivity':        normal_app_seq[i],
                'networkActivityMB':  float(normal_net_seq[i]),
            }

            if scenario_name == 'sudden_attack':
                # Normal for baseline period, then sudden large deviation
                if day > config['baseline_days']:
                    item['loginHour']          = 2
                    item['sessionDurationMin'] = 690
                    item['fileAccessCount']    = 185
                    item['usbUsage']           = 2
                    item['appActivity']        = 'Tor Browser VPN Tunnel'
                    item['networkActivityMB']  = 1200.0

            elif scenario_name == 'gradual_drift':
                # Slow escalation across all features, starting after baseline period
                post_baseline_day = max(0, day - config['baseline_days'])
                if post_baseline_day > 0:
                    # Scale: files grow 15/day, net 55/day, login shifts later each 3 days
                    item['fileAccessCount']   = min(240, normal_files_seq[i] + post_baseline_day * 15)
                    item['networkActivityMB'] = min(1500.0, float(normal_net_seq[i]) + post_baseline_day * 55.0)
                    if post_baseline_day >= 3:
                        item['appActivity'] = 'Command Prompt Admin Shell'
                    if post_baseline_day >= 5:
                        item['loginHour']         = max(7, 9 - post_baseline_day // 2)
                        item['appActivity']       = 'PowerShell Console Exec'
                    if post_baseline_day >= 6:
                        item['usbUsage'] = 1
                    if post_baseline_day >= 7:
                        item['loginHour'] = 2
                        item['usbUsage']  = 2
                        item['appActivity'] = 'Tor Browser VPN Tunnel'

            elif scenario_name in drift_rates:
                # Stress-test: only files and network drift at the specified rate; other features stable
                rate = drift_rates[scenario_name]
                post_baseline_day = max(0, day - config['baseline_days'])
                if post_baseline_day > 0:
                    item['fileAccessCount']   = int(min(500, normal_files_seq[i] + post_baseline_day * rate['files']))
                    item['networkActivityMB'] = float(min(3000.0, normal_net_seq[i] + post_baseline_day * rate['net']))

            # normal: use the seeded normal values, no modifications
            sequence.append(item)

        return sequence

    def _compute_ground_truth(self, scenario_name, day, baseline_days):
        """
        Returns 0 (Normal) or 1 (Suspicious) for a given scenario/day.
        Ground truth is derived from the scenario definition, not from detector output.
        """
        if scenario_name == 'normal':
            return 0
        elif scenario_name in ('sudden_attack',):
            return 1 if day > baseline_days else 0
        elif scenario_name == 'gradual_drift':
            return 1 if day > baseline_days else 0
        elif scenario_name in ('stress_low', 'stress_medium', 'stress_high', 'stress_very_high'):
            return 1 if day > baseline_days else 0
        return 0

    def _compute_aggregate_metrics(self, timeline, alert_key, drift_start_day):
        """
        Computes TP, FP, TN, FN, Precision, Recall, F1, Detection Rate, Avg Detection Delay
        from a completed timeline.
        """
        TP = sum(1 for t in timeline if t['ground_truth'] == 1 and t[alert_key])
        FP = sum(1 for t in timeline if t['ground_truth'] == 0 and t[alert_key])
        TN = sum(1 for t in timeline if t['ground_truth'] == 0 and not t[alert_key])
        FN = sum(1 for t in timeline if t['ground_truth'] == 1 and not t[alert_key])

        precision     = round(TP / (TP + FP), 3) if (TP + FP) > 0 else 0.0
        recall        = round(TP / (TP + FN), 3) if (TP + FN) > 0 else 0.0
        f1            = round(2 * precision * recall / (precision + recall), 3) \
                        if (precision + recall) > 0 else 0.0
        detection_rate = recall  # TP / (TP + FN) = recall

        # Average detection delay: mean of (first_alert_day - drift_start_day) across the run
        # Since this is per-run (not per-trial), it is simply the first alert day minus drift_start_day
        first_alert = next((t['day'] for t in timeline if t[alert_key]), None)
        avg_detection_delay = None
        if drift_start_day is not None and first_alert is not None:
            avg_detection_delay = first_alert - drift_start_day

        fn_days = [t['day'] for t in timeline if t['ground_truth'] == 1 and not t[alert_key]]
        fp_days = [t['day'] for t in timeline if t['ground_truth'] == 0 and t[alert_key]]

        return {
            'TP': TP, 'FP': FP, 'TN': TN, 'FN': FN,
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'detection_rate': detection_rate,
            'avg_detection_delay': avg_detection_delay,
            'first_detection_day': first_alert,
            'fn_days': fn_days,
            'fp_days': fp_days,
            'has_false_negative': len(fn_days) > 0,
        }

    def run_research_simulation(self, scenario_name, config=None):
        """
        Runs a controlled research simulation.

        Detectors:
          1. STATIC BASELINE   — Fixed reference, never updates. Measures drift from original.
          2. ADAPTIVE (BLIND)  — Updates its mean via EMA(alpha) after every day, including anomalous ones.
          3. DRIFT-AWARE        — Same EMA update, BUT freezes once cumulative Z-score from
                                 original baseline exceeds drift_lock_threshold for
                                 min_persistence_days consecutive days.

        Config keys accepted:
          detection_threshold  (default 50)   : risk score >= this → alert
          drift_lock_threshold (default 4.5)  : cumulative Z-score sum that triggers lock
          adaptation_alpha     (default 0.15) : EMA weight for adaptive mean update (0–1)
          baseline_days        (default 3)    : number of clean normal days before scenario events start
          min_persistence_days (default 1)    : consecutive days above lock threshold before locking
          num_days             (default 14)   : total simulation days
          random_seed          (default 42)   : reproducibility seed

        Controlled Research Simulation — Not Production Evidence
        """
        from feature_extractor import extract_features

        if self.baseline_df is None:
            self.fit_baseline()

        # Merge caller config with defaults
        cfg = {
            'detection_threshold':  50,
            'drift_lock_threshold': 4.5,
            'adaptation_alpha':     0.15,
            'baseline_days':        3,
            'min_persistence_days': 1,
            'num_days':             14,
            'random_seed':          42,
        }
        if config:
            cfg.update({k: v for k, v in config.items() if v is not None})

        THRESHOLD    = cfg['detection_threshold']
        LOCK_THRESH  = cfg['drift_lock_threshold']
        ALPHA        = float(cfg['adaptation_alpha'])
        BASELINE_DAYS = int(cfg['baseline_days'])
        MIN_PERSIST  = int(cfg['min_persistence_days'])
        NUM_DAYS     = int(cfg['num_days'])

        # ── Research-specific baseline (experiment-relative, not IF training stats) ──
        ref_day = extract_features({
            'loginHour': 9, 'sessionDurationMin': 480, 'fileAccessCount': 30,
            'usbUsage': 0, 'appActivity': 'Normal Office Apps', 'networkActivityMB': 150.0
        })
        orig_means = {
            'login_hour':           9.0,
            'session_duration_min': 480.0,
            'app_activity_risk':    float(ref_day['app_activity_risk']),
            'file_activity_count':  30.0,
            'usb_activity':         0.0,
            'network_activity_mb':  150.0,
        }
        orig_stds = {
            'login_hour':           2.0,
            'session_duration_min': 60.0,
            'app_activity_risk':    1.0,
            'file_activity_count':  8.0,
            'usb_activity':         0.3,
            'network_activity_mb':  40.0,
        }

        # ── Build telemetry sequence ──────────────────────────────────────────
        sequence = self._build_scenario_sequence(scenario_name, NUM_DAYS, cfg)

        # ── Detector state initialisation ─────────────────────────────────────

        # 1. Static: fixed forever
        static_means = orig_means.copy()
        static_stds  = orig_stds.copy()

        # 2. Adaptive: updates via EMA every day
        adaptive_means = orig_means.copy()
        adaptive_stds  = orig_stds.copy()

        # 3. Drift-Aware: EMA but freezes when persistent drift exceeds threshold
        drift_means = orig_means.copy()
        drift_stds  = orig_stds.copy()
        drift_locked            = False
        consecutive_drift_days  = 0   # days in a row above LOCK_THRESH

        results_timeline = []

        for step in sequence:
            day = step['day']
            features = extract_features(step)
            features_arr = np.array([[features[c] for c in self.feature_cols]], dtype=np.float64)

            # Evaluate Isolation Forest once for this day's features (shared by all detectors)
            raw_score = float(self.model.decision_function(features_arr)[0])
            normality = float(np.clip((raw_score + 0.3) / 0.45 * 100, 5, 99))

            # ── Compute Z-score distance from ORIGINAL baseline (shared) ──────
            orig_drift_sum = sum(
                abs(features[col] - orig_means[col]) / orig_stds[col]
                for col in self.feature_cols
            )
            drift_score_normalised = round(float(np.clip(orig_drift_sum / 10.0, 0.0, 1.0)), 3)

            # ── DETECTOR 1: STATIC BASELINE ───────────────────────────────────
            z_sum_s        = sum(abs(features[c] - static_means[c]) / static_stds[c] for c in self.feature_cols)
            drift_s        = float(np.clip(z_sum_s / 10.0, 0.0, 1.0))
            static_risk_r  = round(float(np.clip((100 - normality) * 0.6 + drift_s * 40, 10, 100)), 1)

            # ── DETECTOR 2: ADAPTIVE (BLIND EMA) ─────────────────────────────
            # Measure against current adaptive mean BEFORE updating
            z_sum_a        = sum(abs(features[c] - adaptive_means[c]) / adaptive_stds[c] for c in self.feature_cols)
            drift_a        = float(np.clip(z_sum_a / 10.0, 0.0, 1.0))
            adaptive_risk_r = round(float(np.clip((100 - normality) * 0.6 + drift_a * 40, 10, 100)), 1)

            # EMA update (always, regardless of alert — this is the "blind" part)
            for col in self.feature_cols:
                adaptive_means[col] = (1 - ALPHA) * adaptive_means[col] + ALPHA * features[col]
                residual = abs(features[col] - adaptive_means[col])
                adaptive_stds[col]  = max(orig_stds[col] * 0.3,
                                          (1 - ALPHA) * adaptive_stds[col] + ALPHA * residual)

            # ── DETECTOR 3: DRIFT-AWARE ────────────────────────────────────────
            # Check persistence: how many consecutive days above lock threshold?
            if orig_drift_sum > LOCK_THRESH:
                consecutive_drift_days += 1
            else:
                consecutive_drift_days = 0   # reset streak on any day below threshold

            if consecutive_drift_days >= MIN_PERSIST and not drift_locked:
                drift_locked = True

            z_sum_d        = sum(abs(features[c] - drift_means[c]) / drift_stds[c] for c in self.feature_cols)
            drift_d        = float(np.clip(z_sum_d / 10.0, 0.0, 1.0))
            drift_risk_r   = round(float(np.clip((100 - normality) * 0.6 + drift_d * 40, 10, 100)), 1)

            # When locked, apply a risk floor proportional to how far above threshold we are
            if drift_locked:
                excess_ratio = min(2.0, orig_drift_sum / LOCK_THRESH)
                lock_floor   = round(float(np.clip(55.0 + (excess_ratio - 1.0) * 20.0, 55.0, 90.0)), 1)
                drift_risk_r = max(drift_risk_r, lock_floor)

            # EMA update only when NOT locked
            if not drift_locked:
                for col in self.feature_cols:
                    drift_means[col] = (1 - ALPHA) * drift_means[col] + ALPHA * features[col]
                    residual = abs(features[col] - drift_means[col])
                    drift_stds[col]  = max(orig_stds[col] * 0.3,
                                           (1 - ALPHA) * drift_stds[col] + ALPHA * residual)

            # ── Ground truth ──────────────────────────────────────────────────
            ground_truth = self._compute_ground_truth(scenario_name, day, BASELINE_DAYS)

            results_timeline.append({
                'day': day,
                # Behavioral features
                'loginHour':          step['loginHour'],
                'sessionDurationMin': step['sessionDurationMin'],
                'fileAccessCount':    step['fileAccessCount'],
                'usbUsage':           step['usbUsage'],
                'appActivity':        step['appActivity'],
                'networkActivityMB':  step['networkActivityMB'],
                # Ground truth
                'ground_truth': ground_truth,
                # Transparency: adaptive current mean for files
                'adaptive_mean_files': round(float(adaptive_means['file_activity_count']), 1),
                'drift_mean_files':    round(float(drift_means['file_activity_count']), 1),
                # Detector 1: Static
                'static_risk':  static_risk_r,
                'static_alert': static_risk_r >= THRESHOLD,
                # Detector 2: Adaptive
                'adaptive_risk':  adaptive_risk_r,
                'adaptive_alert': adaptive_risk_r >= THRESHOLD,
                # Detector 3: Drift-Aware
                'drift_aware_risk':  drift_risk_r,
                'drift_aware_alert': drift_risk_r >= THRESHOLD,
                # Drift tracking
                'orig_drift_sum':         round(float(orig_drift_sum), 3),
                'drift_score_normalised': drift_score_normalised,
                'consecutive_drift_days': consecutive_drift_days,
                'adaptation_locked':      drift_locked,
            })

        # ── Aggregate metrics per detector ────────────────────────────────────
        drift_start_day = None if scenario_name == 'normal' else BASELINE_DAYS + 1

        static_metrics   = self._compute_aggregate_metrics(results_timeline, 'static_alert',     drift_start_day)
        adaptive_metrics = self._compute_aggregate_metrics(results_timeline, 'adaptive_alert',   drift_start_day)
        drift_metrics    = self._compute_aggregate_metrics(results_timeline, 'drift_aware_alert', drift_start_day)

        # ── Ground truth rule string ──────────────────────────────────────────
        if scenario_name == 'normal':
            gt_rule = 'All days = Normal'
        elif scenario_name in ('stress_low', 'stress_medium', 'stress_high', 'stress_very_high'):
            rate_label = scenario_name.replace('stress_', '').replace('_', ' ').title()
            gt_rule = f'Days 1-{BASELINE_DAYS} = Normal (baseline); Days {BASELINE_DAYS+1}-{NUM_DAYS} = Suspicious ({rate_label} drift rate)'
        else:
            gt_rule = f'Days 1-{BASELINE_DAYS} = Normal (baseline); Days {BASELINE_DAYS+1}-{NUM_DAYS} = Suspicious'

        return {
            'success': True,
            'scenario': scenario_name,
            'timeline': results_timeline,
            'experiment_config': {
                'random_seed':          cfg['random_seed'],
                'num_days':             NUM_DAYS,
                'baseline_days':        BASELINE_DAYS,
                'drift_start_day':      drift_start_day,
                'detection_threshold':  THRESHOLD,
                'drift_lock_threshold': LOCK_THRESH,
                'adaptation_alpha':     ALPHA,
                'min_persistence_days': MIN_PERSIST,
                'adaptation_rate':      f'EMA alpha={ALPHA:.2f} per day',
                'ground_truth_rule':    gt_rule,
            },
            'detector_metrics': {
                'static':     static_metrics,
                'adaptive':   adaptive_metrics,
                'drift_aware': drift_metrics,
            },
            'isSimulated': True,
            'label': 'Controlled Research Simulation — Not Production Evidence',
        }


    def run_experiment_suite(self, config):
        """
        Runs a multi-trial experiment suite across 4 drift levels.
        """
        from scipy import stats
        import statistics
        import numpy as np

        cfg = {
            'num_trials': 30,
            'detection_threshold':  50,
            'drift_lock_threshold': 4.5,
            'adaptation_alpha':     0.15,
            'baseline_days':        3,
            'min_persistence_days': 1,
            'num_days':             14,
            'base_seed':            42,
        }
        if config:
            cfg.update({k: v for k, v in config.items() if v is not None})
        
        drift_levels = ['stress_low', 'stress_medium', 'stress_high', 'stress_very_high']
        detectors = ['static', 'adaptive', 'drift_aware']
        
        results = {
            'config': cfg,
            'levels': {}
        }
        
        for level in drift_levels:
            level_trials = []
            
            for i in range(cfg['num_trials']):
                trial_seed = cfg['base_seed'] + i
                trial_config = cfg.copy()
                trial_config['random_seed'] = trial_seed
                
                # Run single simulation
                sim_res = self.run_research_simulation(level, trial_config)
                
                # We need to add the trial index to the timeline
                for t in sim_res['timeline']:
                    t['trial'] = i
                    
                level_trials.append(sim_res)
                
            # Aggregate metrics for this level across trials
            aggregated = {det: {} for det in detectors}
            metrics_keys = ['TP', 'FP', 'TN', 'FN', 'precision', 'recall', 'f1', 'detection_rate', 'avg_detection_delay']
            
            # Extract lists of values for each metric across trials
            metric_arrays = {det: {k: [] for k in metrics_keys} for det in detectors}
            
            for trial in level_trials:
                for det in detectors:
                    det_metrics = trial['detector_metrics'][det]
                    for k in metrics_keys:
                        val = det_metrics.get(k)
                        if val is not None:
                            metric_arrays[det][k].append(val)
                            
            for det in detectors:
                for k in metrics_keys:
                    arr = metric_arrays[det][k]
                    if len(arr) > 0:
                        aggregated[det][k] = {
                            'mean': round(statistics.mean(arr), 3),
                            'std': round(statistics.stdev(arr), 3) if len(arr) > 1 else 0.0
                        }
                    else:
                        aggregated[det][k] = {'mean': None, 'std': None}
            
            # Statistical comparison between Adaptive and Drift-Aware
            stats_comparison = {}
            for k in ['f1', 'detection_rate', 'avg_detection_delay', 'FN', 'FP']:
                arr_adapt = [0.0 if x is None else float(x) for x in metric_arrays['adaptive'][k]]
                arr_drift = [0.0 if x is None else float(x) for x in metric_arrays['drift_aware'][k]]
                if len(arr_adapt) == cfg['num_trials'] and len(arr_drift) == cfg['num_trials']:
                    diffs = [a - b for a, b in zip(arr_adapt, arr_drift)]
                    if all(d == 0.0 for d in diffs) or len(set(diffs)) == 1:
                        stat = 0.0
                        p_val = 1.0
                    else:
                        try:
                            res = stats.ttest_rel(arr_adapt, arr_drift)
                            stat = float(res.statistic)
                            p_val = float(res.pvalue)
                        except Exception:
                            stat = 0.0
                            p_val = 1.0

                    if math.isnan(stat) or math.isinf(stat):
                        stat = 0.0
                    if math.isnan(p_val) or math.isinf(p_val):
                        p_val = 1.0

                    mean_adapt = statistics.mean(arr_adapt) if arr_adapt else 0.0
                    mean_drift = statistics.mean(arr_drift) if arr_drift else 0.0

                    stats_comparison[k] = {
                        'test': 'Paired T-Test',
                        'stat': round(stat, 3),
                        'p_value': round(p_val, 4),
                        'significant': bool(p_val < 0.05),
                        'adaptive_mean': round(mean_adapt, 3),
                        'drift_aware_mean': round(mean_drift, 3)
                    }

            results['levels'][level] = {
                'aggregated': aggregated,
                'stats_comparison': stats_comparison,
                'raw_trials': level_trials
            }

        return results
