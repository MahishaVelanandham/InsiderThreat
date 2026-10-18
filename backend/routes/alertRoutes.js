const express = require('express');
const r = express.Router();
const { getAlerts } = require('../controllers/alertController');
r.get('/', getAlerts);
module.exports = r;
