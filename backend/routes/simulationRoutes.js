const express = require('express');
const r = express.Router();
const { runSimulation } = require('../controllers/simulationController');
r.post('/', runSimulation);
module.exports = r;
