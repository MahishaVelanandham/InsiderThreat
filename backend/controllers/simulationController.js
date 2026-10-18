// controllers/simulationController.js
// POST /api/simulation — What-If sandbox endpoint

const { calculateBehavioralRisk }     = require('../services/aiAnalysisService');
const { analyzeBehaviorWithPythonAi } = require('../services/pythonAiClient');

const runSimulation = async (req, res) => {
  try {
    const {
      loginHour = 9, sessionDurationMin = 450,
      fileAccessCount = 20, usbUsage = 0,
      appActivity = 'Normal Office Apps',
      networkActivityMB = 150, baselineRisk = 20
    } = req.body;

    const payload = {
      loginHour: Number(loginHour), sessionDurationMin: Number(sessionDurationMin),
      fileAccessCount: Number(fileAccessCount), usbUsage: Number(usbUsage),
      appActivity: String(appActivity), networkActivityMB: Number(networkActivityMB)
    };

    // 1. Try Python AI
    const pythonRes = await analyzeBehaviorWithPythonAi(payload);
    if (pythonRes.isPythonAiConnected && pythonRes.data) {
      const p = pythonRes.data;
      const delta = parseFloat((p.predicted_risk - p.current_risk_score).toFixed(1));
      return res.json({
        success: true, isSimulated: true,
        aiEngine: 'Python Isolation Forest (Port 5001)',
        simulationLabel: 'DEMO/SIMULATION — Python Isolation Forest Engine',
        data: {
          currentRisk: p.current_risk_score, predictedRisk: p.predicted_risk,
          riskChange: delta,
          riskChangeDirection: delta > 0 ? 'Increase' : delta < 0 ? 'Decrease' : 'Unchanged',
          riskLevel: p.risk_level, normalityScore: p.normality_score,
          behavioralDrift: p.behavioral_drift_score,
          explanation: p.feature_contributions?.map(f=>f.factor).join('; ') || 'No anomalies detected.',
          contributingFactors: p.feature_contributions, disclaimer: p.disclaimer
        }
      });
    }

    // 2. JS fallback
    const r = calculateBehavioralRisk(payload);
    const delta = parseFloat((r.predictedRisk - r.currentRisk).toFixed(1));
    return res.json({
      success: true, isSimulated: true,
      aiEngine: 'JS Fallback Engine',
      simulationLabel: 'DEMO/SIMULATION — JS Fallback Engine',
      data: {
        currentRisk: r.currentRisk, predictedRisk: r.predictedRisk,
        riskChange: delta,
        riskChangeDirection: delta > 0 ? 'Increase' : delta < 0 ? 'Decrease' : 'Unchanged',
        riskLevel: r.riskLevel, normalityScore: r.normalityScore,
        behavioralDrift: r.behavioralDrift,
        explanation: r.contributingFactors.map(f=>f.factor).join('; ') || 'No anomalies detected.',
        contributingFactors: r.contributingFactors
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { runSimulation };
