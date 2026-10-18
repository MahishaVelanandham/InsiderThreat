// controllers/employeeController.js
const Employee = require('../models/Employee');
const { getIsConnected } = require('../config/db');
const { demoEmployees } = require('../services/seedService');

const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, '../data/registered_employees.json');

// Helper to load persisted employees
const loadCustomEmployees = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading custom employees:', e.message);
  }
  return [];
};

// Helper to save custom employees
const saveCustomEmployees = (list) => {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving custom employees:', e.message);
  }
};

// GET /api/employees  — optional ?search=  ?department=  ?riskLevel=
const getEmployees = async (req, res) => {
  try {
    const custom = loadCustomEmployees();
    // Merge custom employees with demo employees without duplicates
    const mergedDemo = [...custom];
    for (const d of demoEmployees) {
      if (!mergedDemo.some(e => e.employeeId === d.employeeId)) {
        mergedDemo.push(d);
      }
    }

    let list = getIsConnected() ? await Employee.find({}) : mergedDemo;
    if (!list.length) list = mergedDemo;

    // Pin EMP-001 (Mahisha V / Active Workstation) to the top, then sort others by riskScore
    list = [...list].sort((a, b) => {
      if (a.employeeId === 'EMP-001') return -1;
      if (b.employeeId === 'EMP-001') return 1;
      return b.riskScore - a.riskScore;
    });

    const { department, riskLevel, search } = req.query;
    if (department && department !== 'All') list = list.filter(e => e.department === department);
    if (riskLevel  && riskLevel  !== 'All') list = list.filter(e => e.riskLevel  === riskLevel);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
      );
    }
    return res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/employees/:id
const getEmployeeById = async (req, res) => {
  try {
    let emp = null;
    if (getIsConnected()) emp = await Employee.findOne({ employeeId: req.params.id });
    if (!emp) emp = demoEmployees.find(e => e.employeeId === req.params.id) || demoEmployees[0];
    return res.json({ success: true, data: emp });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/employees (Register real employee for research)
const createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      email,
      department = 'Engineering',
      role = 'Research Participant'
    } = req.body;

    if (!employeeId || !name) {
      return res.status(400).json({ success: false, message: 'Employee ID and Name are required' });
    }

    const newEmp = {
      employeeId,
      name,
      email: email || `${employeeId.toLowerCase()}@local.org`,
      department,
      role,
      status: 'Active',
      riskScore: 10,
      riskLevel: 'Low',
      lastActivity: new Date()
    };

    if (getIsConnected()) {
      const doc = new Employee(newEmp);
      await doc.save();
    }

    // Persist to local JSON file so it survives backend restarts
    const custom = loadCustomEmployees();
    if (!custom.some(e => e.employeeId === newEmp.employeeId)) {
      custom.push(newEmp);
      saveCustomEmployees(custom);
    }

    // Add to in-memory list
    demoEmployees.unshift(newEmp);

    return res.status(201).json({ success: true, message: 'Employee registered successfully', data: newEmp });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getEmployees, getEmployeeById, createEmployee };
