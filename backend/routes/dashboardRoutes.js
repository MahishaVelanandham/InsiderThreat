const express = require('express');
const r = express.Router();
const { getDashboardData } = require('../controllers/dashboardController');
r.get('/', getDashboardData);
module.exports = r;
