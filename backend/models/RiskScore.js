// models/RiskScore.js
const mongoose = require('mongoose');

const riskScoreSchema = new mongoose.Schema({
  employeeId:      { type: String, required: true },
  timestamp:       { type: Date, default: Date.now },
  currentRisk:     { type: Number, required: true },
  normalityScore:  { type: Number, required: true },
  behavioralDrift: { type: Number, required: true },
  predictedRisk:   { type: Number, required: true },
  contributingFactors: [{
    factor: String,
    impact: { type: String, enum: ['High','Medium','Low'] },
    weight: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('RiskScore', riskScoreSchema);
