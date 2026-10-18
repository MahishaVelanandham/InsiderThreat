// controllers/alertController.js
const Alert = require('../models/Alert');
const { getIsConnected } = require('../config/db');
const { demoAlerts } = require('../services/seedService');

// GET /api/alerts  — optional ?severity=  ?status=  ?search=
const getAlerts = async (req, res) => {
  try {
    let list = getIsConnected() ? await Alert.find({}).sort({ timestamp: -1 }) : [];
    if (!list.length) list = [...demoAlerts];

    const { severity, status, search } = req.query;
    if (severity && severity !== 'All') list = list.filter(a => a.severity === severity);
    if (status   && status   !== 'All') list = list.filter(a => a.status   === status);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.alertId.toLowerCase().includes(q) ||
        a.employeeName.toLowerCase().includes(q) ||
        a.reason.toLowerCase().includes(q)
      );
    }
    return res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAlerts };
