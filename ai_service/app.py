# app.py
# Flask microservice for behavioral analysis using scikit-learn Isolation Forest.
# Listen on Port 5001.

import math
from flask import Flask, request, jsonify
from feature_extractor import extract_features
from isolation_forest_model import BehavioralThreatDetector

app = Flask(__name__)

def sanitize(obj):
    """Recursively replace Infinity / NaN with JSON-safe values."""
    if isinstance(obj, dict):
        return {k: sanitize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [sanitize(v) for v in obj]
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None   # JSON null — safe for all parsers
        return obj
    return obj

# Initialize and train detector on startup using baseline simulation data
detector = BehavioralThreatDetector()
detector.fit_baseline()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'engine': 'Python Isolation Forest Service',
        'isSimulated': True,
        'notice': 'SIMULATION/DEMO ONLY — Academic research prototype.'
    })

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No input data provided'}), 400
            
        # 1. Transform request payload to model features
        features = extract_features(data)
        
        # 2. Analyze threat risk
        metrics = detector.analyze_event(features)
        
        # 3. Format response
        response = {
            'success': True,
            'data': {
                'login_hour': features['login_hour'],
                'session_duration_min': features['session_duration_min'],
                'app_activity_risk': features['app_activity_risk'],
                'file_activity_count': features['file_activity_count'],
                'usb_activity': features['usb_activity'],
                'network_activity_mb': features['network_activity_mb'],
                
                'normality_score': metrics['normality_score'],
                'behavioral_drift_score': metrics['behavioral_drift_score'],
                'current_risk_score': metrics['current_risk_score'],
                'predicted_risk': metrics['predicted_risk'],
                'risk_level': metrics['risk_level'],
                'feature_contributions': metrics['feature_contributions'],
                
                'simulation_notice': 'DEMO/SIMULATION RESULT — Powered by Python Isolation Forest',
                'disclaimer': 'This AI is an academic prototype trained on synthetic historical baselines.'
            }
        }
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/research/simulate', methods=['POST'])
def research_simulate():
    try:
        data = request.get_json() or {}
        scenario = data.get('scenario', 'gradual_drift')
        # Forward optional research config parameters
        config = data.get('config', None)
        sim_results = detector.run_research_simulation(scenario, config=config)
        return jsonify(sim_results)
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/research/experiment-suite', methods=['POST'])
def experiment_suite():
    try:
        data = request.get_json() or {}
        config = data.get('config', None)
        suite_results = detector.run_experiment_suite(config=config)
        # Sanitize ALL floats (Infinity/NaN → null) before JSON serialization
        return jsonify({'success': True, 'data': sanitize(suite_results)})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    print("[AI Microservice] Initializing Isolation Forest Baseline Model...")
    app.run(host='127.0.0.1', port=5001, debug=False)

