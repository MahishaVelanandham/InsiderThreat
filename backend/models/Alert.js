// models/Alert.js
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alertId:      { type: String, required: true, unique: true },
  employeeId:   { type: String, required: true },
  employeeName: { type: String, required: true },
  timestamp:    { type: Date, default: Date.now },
  riskScore:    { type: Number, required: true },
  severity:     { type: String, enum: ['Low','Medium','High','Critical'], required: true },
  category:     { type: String, required: true },
  reason:       { type: String, required: true },
  status:       { type: String, enum: ['New','Investigating','Resolved','False Positive'], default: 'New' }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
