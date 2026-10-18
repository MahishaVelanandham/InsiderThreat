// controllers/riskController.js
// GET /api/risk/:employeeId
// Tries Python Isolation Forest first; falls back to JS engine.

const { calculateBehavioralRisk }       = require('../services/aiAnalysisService');
const { analyzeBehaviorWithPythonAi }   = require('../services/pythonAiClient');
const { demoEmployees }                 = require('../services/seedService');

const presets = {
  Critical: { loginHour:2,  sessionDurationMin:600, fileAccessCount:185, usbUsage:2, appActivity:'Tor / VPN Browser',         networkActivityMB:3400 },
  High:     { loginHour:20, sessionDurationMin:380, fileAccessCount:65,  usbUsage:1, appActivity:'Development Environment',   networkActivityMB:450  },
  Low:      { loginHour:9,  sessionDurationMin:450, fileAccessCount:22,  usbUsage:0, appActivity:'Normal Office Apps',        networkActivityMB:120  }
};

const getEmployeeRiskAnalysis = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const emp = demoEmployees.find(e => e.employeeId === employeeId) || demoEmployees[0];
    const simData = emp.riskScore >= 75 ? presets.Critical : emp.riskScore >= 50 ? presets.High : presets.Low;

    // 1. Try Python AI service
    const pythonRes = await analyzeBehaviorWithPythonAi(simData);
    if (pythonRes.isPythonAiConnected && pythonRes.data) {
      const p = pythonRes.data;
      return res.json({
        success: true, employeeId, employeeName: emp.name, department: emp.department,
        aiEngine: 'Python Isolation Forest (Port 5001)',
        data: {
          behavioralScore: p.current_risk_score, normalityScore: p.normality_score,
          behavioralDriftScore: p.behavioral_drift_score, currentRisk: p.current_risk_score,
          predictedRisk: p.predicted_risk, riskLevel: p.risk_level,
          mainContributingFactors: p.feature_contributions,
          isSimulated: true, simulationNotice: p.simulation_notice, disclaimer: p.disclaimer
        }
      });
    }

    // 2. JS fallback
    const r = calculateBehavioralRisk(simData);
    return res.json({
      success: true, employeeId, employeeName: emp.name, department: emp.department,
      aiEngine: 'JS Fallback Engine',
      data: {
        behavioralScore: r.currentRisk, normalityScore: r.normalityScore,
        behavioralDriftScore: r.behavioralDrift, currentRisk: r.currentRisk,
        predictedRisk: r.predictedRisk, riskLevel: r.riskLevel,
        mainContributingFactors: r.contributingFactors,
        isSimulated: true, simulationNotice: r.simulationNotice
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getEmployeeRiskAnalysis };
