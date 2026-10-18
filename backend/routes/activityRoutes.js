const express = require('express');
const r = express.Router();
const { getEmployeeActivities, logActivity, clearEmployeeActivities } = require('../controllers/activityController');

r.get('/:employeeId', getEmployeeActivities);
r.post('/', logActivity);
r.delete('/:employeeId', clearEmployeeActivities);

module.exports = r;
