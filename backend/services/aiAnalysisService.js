// services/aiAnalysisService.js
// JavaScript fallback AI engine used when Python microservice is unavailable.
// Provides rule-based behavioral risk scoring.
// SIMULATION ONLY — Academic prototype, not scientifically validated.

const calculateBehavioralRisk = (simData) => {
  const {
    loginHour          = 9,
    fileAccessCount    = 20,
    usbUsage           = 0,
    appActivity        = 'Normal Office Apps',
    networkActivityMB  = 150
  } = simData;

  const isOffHours = loginHour < 6 || loginHour > 21;
  const isHighFiles = fileAccessCount > 50;
  const isUsbActive = usbUsage > 0;
  const isHighNetwork = networkActivityMB > 300;

  const rawFactors = [];

  // 1. Login Hour
  if (isOffHours) {
    const rawVal = loginHour < 4 || loginHour > 23 ? 35 : 15;
    rawFactors.push({
      factor: `Abnormal login time (${loginHour}:00 hrs)`,
      impact: rawVal > 20 ? 'High' : 'Medium',
      raw_weight: rawVal
    });
  }

  // 2. File Access
  if (isHighFiles) {
    const rawVal = fileAccessCount > 200 ? 40 : fileAccessCount > 100 ? 25 : 10;
    rawFactors.push({
      factor: `High volume file access (${fileAccessCount} files)`,
      impact: rawVal > 25 ? 'High' : 'Medium',
      raw_weight: rawVal
    });
  }

  // 3. USB Peripheral
  if (isUsbActive) {
    const rawVal = usbUsage === 2 ? 45 : 20;
    rawFactors.push({
      factor: usbUsage === 2 ? 'Mass USB exfiltration event' : 'External USB device attached',
      impact: rawVal > 30 ? 'High' : 'Medium',
      raw_weight: rawVal
    });
  }

  // 4. Network Volume
  if (isHighNetwork) {
    const rawVal = networkActivityMB > 2000 ? 40 : networkActivityMB > 800 ? 25 : 10;
    rawFactors.push({
      factor: `Unusual outbound data volume (${networkActivityMB} MB)`,
      impact: rawVal > 20 ? 'High' : 'Low',
      raw_weight: rawVal
    });
  }

  // 5. Application Activity
  const app = String(appActivity).toLowerCase();
  const hasOtherAnomaly = isOffHours || isHighFiles || isUsbActive || isHighNetwork;

  if (app.includes('tor') || app.includes('vpn') || app.includes('proxy') || app.includes('onion')) {
    const rawVal = hasOtherAnomaly ? 30 : 5;
    rawFactors.push({
      factor: 'Unusual Application/Network Behavior',
      impact: hasOtherAnomaly ? 'High' : 'Low',
      raw_weight: rawVal
    });
  } else if (app.includes('privilege') || app.includes('escalation') || app.includes('terminal') || app.includes('powershell') || app.includes('cli')) {
    const rawVal = app.includes('privilege') ? 30 : 20;
    rawFactors.push({
      factor: `Administrative Shell Console Executed (${appActivity})`,
      impact: rawVal > 20 ? 'High' : 'Medium',
      raw_weight: rawVal
    });
  }

  // Calculate scores
  const base_risk = 10.0;
  const sum_raw_weights = rawFactors.reduce((acc, f) => acc + f.raw_weight, 0);
  let currentRisk = base_risk + sum_raw_weights;

  // Scale weights if capped at 100
  if (currentRisk > 100.0) {
    const scale = (100.0 - base_risk) / sum_raw_weights;
    currentRisk = 100.0;
    rawFactors.forEach(f => {
      f.weight = parseFloat((f.raw_weight * scale).toFixed(1));
    });
  } else {
    currentRisk = parseFloat(currentRisk.toFixed(1));
    rawFactors.forEach(f => {
      f.weight = parseFloat(f.raw_weight.toFixed(1));
    });
  }

  if (rawFactors.length === 0) {
    rawFactors.push({
      factor: 'Standard baseline activity — no anomalies detected',
      impact: 'Low',
      weight: 5.0
    });
    currentRisk = 15.0;
  }

  const normalityScore = parseFloat((100.0 - currentRisk).toFixed(1));
  const behavioralDrift = parseFloat((currentRisk / 100.0).toFixed(2));
  const predictedRisk = Math.min(100.0, parseFloat((currentRisk * 1.12).toFixed(1)));
  const riskLevel = currentRisk >= 75 ? 'Critical' : currentRisk >= 50 ? 'High' : currentRisk >= 30 ? 'Medium' : 'Low';

  return {
    isSimulated: true,
    simulationNotice: 'SIMULATION RESULT — Academic JS Fallback Engine (Python AI service may be offline)',
    currentRisk,
    normalityScore,
    behavioralDrift,
    predictedRisk,
    riskLevel,
    contributingFactors: rawFactors
  };
};


module.exports = { calculateBehavioralRisk };
