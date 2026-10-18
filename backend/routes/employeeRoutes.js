const express = require('express');
const r = express.Router();
const { getEmployees, getEmployeeById, createEmployee } = require('../controllers/employeeController');

r.get('/', getEmployees);
r.get('/:id', getEmployeeById);
r.post('/', createEmployee);

module.exports = r;
