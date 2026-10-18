// models/Activity.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  activityId:   { type: String, required: true },
  employeeId:   { type: String, required: true },
  timestamp:    { type: Date, default: Date.now },
  activityType: {
    type: String,
    enum: ['Login','Chrome','Excel','File Access','USB Connected','Network Traffic','App Exec','Privilege Escalation'],
    required: true
  },
  details:      { type: String, required: true },
  anomalyScore: { type: Number, default: 0.0 }, // 0.0 = normal, 1.0 = highly anomalous
  isDeceptionTarget: { type: Boolean, default: false },
  location:     { type: String, default: 'Internal Subnet' }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
