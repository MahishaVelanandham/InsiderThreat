# tests/test_model.py
# Simple validation test for verifying Isolation Forest logic.

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from feature_extractor import extract_features
from isolation_forest_model import BehavioralThreatDetector

def run_test():
    print("---------------------------------------------")
    print("Testing Behavioral Threat Detector Prototype")
    print("---------------------------------------------")
    
    detector = BehavioralThreatDetector()
    detector.fit_baseline()
    print("[TEST] Baseline model trained on 600 samples successfully.")
    
    # Standard office day (should be low risk)
    normal_payload = {
        'loginHour': 9,
        'sessionDurationMin': 480,
        'fileAccessCount': 15,
        'usbUsage': 0,
        'appActivity': 'Excel, Outlook, Chrome',
        'networkActivityMB': 120
    }
    
    # Highly suspicious day (should be critical risk)
    anomalous_payload = {
        'loginHour': 2,
        'sessionDurationMin': 720,
        'fileAccessCount': 250,
        'usbUsage': 2,
        'appActivity': 'Tor Browser, privilege escalation script',
        'networkActivityMB': 4200
    }
    
    normal_features = extract_features(normal_payload)
    normal_res = detector.analyze_event(normal_features)
    
    anomalous_features = extract_features(anomalous_payload)
    anomalous_res = detector.analyze_event(anomalous_features)
    
    print("\n[NORMAL BEHAVIOR ANALYSIS]")
    print(f"Normality Score: {normal_res['normality_score']}%")
    print(f"Risk Score: {normal_res['current_risk_score']}/100")
    print(f"Risk Level: {normal_res['risk_level']}")
    
    print("\n[ANOMALOUS BEHAVIOR ANALYSIS]")
    print(f"Normality Score: {anomalous_res['normality_score']}%")
    print(f"Risk Score: {anomalous_res['current_risk_score']}/100")
    print(f"Risk Level: {anomalous_res['risk_level']}")
    print("Contributing Factors:")
    for f in anomalous_res['feature_contributions']:
        print(f"  - {f['factor']} ({f['impact']} impact, weight: {f['weight']})")
        
    assert normal_res['current_risk_score'] < anomalous_res['current_risk_score'], "Error: Anomalous behavior should have higher risk than normal!"
    print("\n[TEST RESULT] Behavioral Threat Detector assertions passed successfully.")

if __name__ == '__main__':
    run_test()
