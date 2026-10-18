// controllers/dashboardController.js
const { getIsConnected } = require('../config/db');
const { demoEmployees, demoAlerts } = require('../services/seedService');
const Employee = require('../models/Employee');
const Alert    = require('../models/Alert');

// GET /api/dashboard
const getDashboardData = async (req, res) => {
  try {
    let employees = getIsConnected() ? await Employee.find({}) : [];
    let alerts    = getIsConnected() ? await Alert.find({})    : [];
    if (!employees.length) employees = demoEmployees;
    if (!alerts.length)    alerts    = demoAlerts;

    const total    = employees.length;
    const active   = employees.filter(e => e.status !== 'Suspended').length;
    const highRisk = employees.filter(e => e.riskScore >= 70).length;
    const avgRisk  = Math.round(employees.reduce((s, e) => s + e.riskScore, 0) / (total || 1));

    const riskTrend = [
      { day:'Mon', avgRisk:22, anomalySpikes:2,  criticalAlerts:0 },
      { day:'Tue', avgRisk:24, anomalySpikes:4,  criticalAlerts:1 },
      { day:'Wed', avgRisk:31, anomalySpikes:8,  criticalAlerts:1 },
      { day:'Thu', avgRisk:39, anomalySpikes:12, criticalAlerts:2 },
      { day:'Fri', avgRisk:48, anomalySpikes:19, criticalAlerts:3 },
      { day:'Sat', avgRisk:42, anomalySpikes:15, criticalAlerts:2 },
      { day:'Sun', avgRisk,    anomalySpikes:23, criticalAlerts:4 }
    ];

    const behaviorAnomalyChart = [
      { category:'Off-hours Logins',      count:34, riskImpact:'High' },
      { category:'Bulk File Access',       count:28, riskImpact:'High' },
      { category:'USB Exfiltration',       count:19, riskImpact:'Critical' },
      { category:'Network Outbound Spike', count:42, riskImpact:'Critical' },
      { category:'Privilege Escalation',   count:12, riskImpact:'Medium' }
    ];

    return res.json({
      success: true,
      data: {
        totalEmployees: total,
        activeEmployees: active,
        highRiskEmployees: highRisk,
        totalAlerts: alerts.length,
        overallOrganizationRisk: { score: avgRisk, level: avgRisk>=75?'Critical':avgRisk>=50?'High':avgRisk>=30?'Medium':'Low' },
        riskTrend,
        employeeRiskRanking: [...employees].sort((a,b)=>b.riskScore-a.riskScore).slice(0,5),
        recentAlerts: [...alerts].sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)).slice(0,5),
        behaviorAnomalyChart
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardData };
