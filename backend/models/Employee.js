// models/Employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId:  { type: String, required: true, unique: true },
  name:        { type: String, required: true },
  email:       { type: String, required: true },
  department:  { type: String, required: true },
  role:        { type: String, required: true },
  status:      { type: String, enum: ['Active', 'Under Monitoring', 'Suspended'], default: 'Active' },
  riskScore:   { type: Number, default: 15 },
  riskLevel:   { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  lastActivity:{ type: Date, default: Date.now },
  joinedDate:  { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
