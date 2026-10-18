// routes/researchRoutes.js
const express = require('express');
const router = express.Router();
const { runResearchSimulation, runExperimentSuite } = require('../controllers/researchController');

router.post('/simulate', runResearchSimulation);
router.post('/experiment-suite', runExperimentSuite);

module.exports = router;
