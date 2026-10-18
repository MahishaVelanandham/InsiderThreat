# baseline_generator.py
# Generates simulated baseline data for normal employee activity.
import numpy as np
import pandas as pd

def generate_baseline_data(n_samples=600):
    """
    Generates synthetic normal employee activity data for model baselining.
    Features:
    - login_hour: Peak working hours (8:00 - 18:00)
    - session_duration_min: Normal office session durations (240 - 540 min)
    - app_activity_risk: Low-risk apps (standard business tool indicators, e.g. Excel, Outlook)
    - file_activity_count: 5 to 40 file operations per day
    - usb_activity: Mostly 0 (none) or rarely 1 (1 device)
    - network_activity_mb: Typical daily download/upload (50 - 300 MB)
    """
    np.random.seed(42)
    
    # Hours centered around 9 AM to 5 PM
    login_hours = np.random.normal(11, 2.5, n_samples).astype(int)
    login_hours = np.clip(login_hours, 0, 23)
    
    # Session duration: 4 to 9 hours (in minutes)
    session_durations = np.random.normal(420, 60, n_samples).astype(int)
    session_durations = np.clip(session_durations, 30, 720)
    
    # App Activity Risk: scale 0 to 10 (mostly low-risk normal apps like Office, Teams, browser)
    app_activity_risks = np.random.exponential(1.5, n_samples)
    app_activity_risks = np.clip(app_activity_risks, 0, 10)
    
    # File activities: 5 to 40 operations
    file_activities = np.random.poisson(15, n_samples)
    file_activities = np.clip(file_activities, 0, 100)
    
    # USB Activity: 0 (no USB insertion) with high probability, 1 with low probability, 2 is rare anomaly
    usb_activity = np.random.choice([0, 1, 2], size=n_samples, p=[0.92, 0.07, 0.01])
    
    # Network Activity: 50 to 300 MB
    network_activity = np.random.normal(150, 45, n_samples)
    network_activity = np.clip(network_activity, 10, 1000)
    
    df = pd.DataFrame({
        'login_hour': login_hours,
        'session_duration_min': session_durations,
        'app_activity_risk': app_activity_risks,
        'file_activity_count': file_activities,
        'usb_activity': usb_activity,
        'network_activity_mb': network_activity
    })
    
    return df

if __name__ == '__main__':
    df = generate_baseline_data()
    print(f"Generated baseline dataset with shape {df.shape}")
    print(df.head())
