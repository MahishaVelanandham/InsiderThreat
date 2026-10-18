# feature_extractor.py
# Transforms backend API payloads into formatted feature sets for the AI model.

def extract_features(raw_data):
    """
    Extracts and maps behavior metrics to numerical arrays.
    Input fields:
    - loginHour (int)
    - sessionDurationMin (int)
    - appActivity (str)
    - fileAccessCount (int)
    - usbUsage (int)
    - networkActivityMB (int)
    """
    login_hour = int(raw_data.get('loginHour', 9))
    session_duration = int(raw_data.get('sessionDurationMin', 480))
    file_count = int(raw_data.get('fileAccessCount', 20))
    usb_usage = int(raw_data.get('usbUsage', 0))
    network_mb = float(raw_data.get('networkActivityMB', 150.0))
    
    # Simple risk map for app activity
    app_activity_str = str(raw_data.get('appActivity', 'Normal')).lower()
    app_risk = 1.0
    if any(term in app_activity_str for term in ['tor', 'vpn', 'proxy', 'onion']):
        app_risk = 9.0
    elif any(term in app_activity_str for term in ['sudo', 'privilege', 'root', 'cmd', 'powershell', 'terminal']):
        app_risk = 7.0
    elif any(term in app_activity_str for term in ['dev', 'vscode', 'git', 'scripts', 'dump']):
        app_risk = 4.0
    elif any(term in app_activity_str for term in ['excel', 'word', 'teams', 'outlook', 'chrome']):
        app_risk = 1.5
        
    return {
        'login_hour': login_hour,
        'session_duration_min': session_duration,
        'app_activity_risk': app_risk,
        'file_activity_count': file_count,
        'usb_activity': usb_usage,
        'network_activity_mb': network_mb
    }
