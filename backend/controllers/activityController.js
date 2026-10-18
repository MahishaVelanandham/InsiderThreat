// controllers/activityController.js
const Activity = require('../models/Activity');
const { getIsConnected } = require('../config/db');
const { demoActivities, demoEmployees } = require('../services/seedService');

// GET /api/activities/:employeeId
const getEmployeeActivities = async (req, res) => {
  try {
    const { employeeId } = req.params;
    let list = [];
    if (getIsConnected()) list = await Activity.find({ employeeId }).sort({ timestamp: -1 });
    if (!list.length) {
      list = demoActivities.filter(a => a.employeeId === employeeId);
      // Do NOT show other employees' demo activities if this employee has none yet
    }
    return res.json({ success: true, employeeId, count: list.length, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/activities (Ingest live telemetry from agent/monitor.py)
const logActivity = async (req, res) => {
  try {
    const {
      employeeId = 'EMP-8021',
      activityType = 'App Exec',
      details = 'Agent telemetry event',
      anomalyScore = 0.1,
      isDeceptionTarget = false,
      location = 'Local Machine'
    } = req.body;

    const activityId = `ACT-${Date.now().toString().slice(-4)}`;
    const newActivity = {
      activityId,
      employeeId,
      timestamp: new Date(),
      activityType,
      details,
      anomalyScore: parseFloat(anomalyScore) || 0.1,
      isDeceptionTarget: Boolean(isDeceptionTarget),
      location
    };

    if (getIsConnected()) {
      const doc = new Activity(newActivity);
      await doc.save();
    }

    // Keep live in-memory buffer updated
    demoActivities.unshift(newActivity);
    if (demoActivities.length > 50) demoActivities.pop();

    // Update employee timestamp
    const emp = demoEmployees.find(e => e.employeeId === employeeId);
    if (emp) {
      emp.lastActivity = new Date();
    }

    console.log(`[Telemetry Ingested] ${employeeId} | ${activityType} | ${details}`);
    return res.status(201).json({ success: true, data: newActivity });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/activities/:employeeId (Clear activities for a clean test)
const clearEmployeeActivities = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (getIsConnected()) {
      await Activity.deleteMany({ employeeId });
    }
    for (let i = demoActivities.length - 1; i >= 0; i--) {
      if (demoActivities[i].employeeId === employeeId) {
        demoActivities.splice(i, 1);
      }
    }
    return res.json({ success: true, message: `Cleared activities for ${employeeId}` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getEmployeeActivities, logActivity, clearEmployeeActivities };
