const express = require('express');
const r = express.Router();
const { getEmployeeRiskAnalysis } = require('../controllers/riskController');
r.get('/:employeeId', getEmployeeRiskAnalysis);
module.exports = r;
