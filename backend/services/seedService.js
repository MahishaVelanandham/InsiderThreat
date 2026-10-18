// services/seedService.js
// Demo/Simulation data used when MongoDB is offline or empty.
// All entries are clearly labeled as SIMULATED data.

const Employee = require('../models/Employee');
const Activity = require('../models/Activity');
const Alert    = require('../models/Alert');
const { getIsConnected } = require('../config/db');

const demoEmployees = [
  {
    employeeId: 'EMP-001', name: 'Mahisha V',
    email: 'mahisha.v@cybercorp.org', department: 'Software Engineering',
    role: 'Lead Research Engineer (Active Workstation)', status: 'Active',
    riskScore: 10, riskLevel: 'Low',
    lastActivity: new Date()
  },
  {
    employeeId: 'EMP-8021', name: 'Dr. Sarah Vance',
    email: 'sarah.vance@cybercorp.org', department: 'R&D',
    role: 'Lead Research Scientist', status: 'Under Monitoring',
    riskScore: 88, riskLevel: 'Critical',
    lastActivity: new Date(Date.now() - 1000 * 60 * 15)
  },
  {
    employeeId: 'EMP-4019', name: 'Marcus Sterling',
    email: 'marcus.s@cybercorp.org', department: 'Finance',
    role: 'Senior Financial Analyst', status: 'Under Monitoring',
    riskScore: 74, riskLevel: 'High',
    lastActivity: new Date(Date.now() - 1000 * 60 * 45)
  },
  {
    employeeId: 'EMP-1102', name: 'Elena Rostova',
    email: 'elena.r@cybercorp.org', department: 'IT Ops',
    role: 'Database Systems Admin', status: 'Active',
    riskScore: 62, riskLevel: 'Medium',
    lastActivity: new Date(Date.now() - 1000 * 60 * 120)
  },
  {
    employeeId: 'EMP-5531', name: 'David Chen',
    email: 'david.chen@cybercorp.org', department: 'Software Engineering',
    role: 'Backend Architect', status: 'Active',
    riskScore: 24, riskLevel: 'Low',
    lastActivity: new Date(Date.now() - 1000 * 60 * 5)
  },
  {
    employeeId: 'EMP-9034', name: 'Amanda Hayes',
    email: 'amanda.h@cybercorp.org', department: 'HR',
    role: 'HR Business Partner', status: 'Active',
    riskScore: 18, riskLevel: 'Low',
    lastActivity: new Date(Date.now() - 1000 * 60 * 200)
  },
  {
    employeeId: 'EMP-3120', name: 'Robert Thorne',
    email: 'robert.t@cybercorp.org', department: 'Executive Office',
    role: 'VP Strategy', status: 'Active',
    riskScore: 35, riskLevel: 'Medium',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60)
  }
];

const demoActivities = [
  { activityId:'ACT-9001', employeeId:'EMP-8021', timestamp: new Date(Date.now()-1000*60*15),  activityType:'Network Traffic',       details:'Encrypted outbound data spike (4.2 GB sent to external IP 185.220.101.4)', anomalyScore:0.94, isDeceptionTarget:true,  location:'Remote VPN' },
  { activityId:'ACT-9002', employeeId:'EMP-8021', timestamp: new Date(Date.now()-1000*60*35),  activityType:'USB Connected',         details:'High-speed mass storage drive (Kingston 128GB) attached to station RND-04',  anomalyScore:0.89, isDeceptionTarget:true,  location:'R&D Secure Lab' },
  { activityId:'ACT-9003', employeeId:'EMP-8021', timestamp: new Date(Date.now()-1000*60*50),  activityType:'File Access',           details:'Accessed 180 files in 10 mins from /Research/Proprietary_AI_Weights_2026/', anomalyScore:0.85, isDeceptionTarget:true,  location:'R&D Secure Lab' },
  { activityId:'ACT-9004', employeeId:'EMP-8021', timestamp: new Date(Date.now()-1000*60*120), activityType:'Chrome',                details:'Navigated to anonymous cloud file-sharing domain (temp-upload.io)',          anomalyScore:0.72, isDeceptionTarget:false, location:'R&D Secure Lab' },
  { activityId:'ACT-9005', employeeId:'EMP-8021', timestamp: new Date(Date.now()-1000*60*240), activityType:'Login',                 details:'User authenticated during off-hours (02:14 AM local time)',                  anomalyScore:0.80, isDeceptionTarget:true,  location:'Remote VPN' },
  { activityId:'ACT-8010', employeeId:'EMP-4019', timestamp: new Date(Date.now()-1000*60*45),  activityType:'Excel',                 details:'Exported bulk payroll spreadsheet with 4,500 employee PII records',          anomalyScore:0.78, isDeceptionTarget:false, location:'Finance Office' },
  { activityId:'ACT-8011', employeeId:'EMP-4019', timestamp: new Date(Date.now()-1000*60*90),  activityType:'USB Connected',         details:'Unregistered USB flash device inserted',                                     anomalyScore:0.70, isDeceptionTarget:true,  location:'Finance Office' },
  { activityId:'ACT-8012', employeeId:'EMP-4019', timestamp: new Date(Date.now()-1000*60*180), activityType:'Login',                 details:'User authenticated at workstation FIN-WS-09',                               anomalyScore:0.10, isDeceptionTarget:false, location:'192.168.10.45' },
  { activityId:'ACT-7001', employeeId:'EMP-1102', timestamp: new Date(Date.now()-1000*60*120), activityType:'Privilege Escalation',  details:'Executed sudo su on database host DB-PROD-01 outside maintenance window',   anomalyScore:0.65, isDeceptionTarget:false, location:'Server Room' },
  { activityId:'ACT-7002', employeeId:'EMP-1102', timestamp: new Date(Date.now()-1000*60*200), activityType:'App Exec',              details:'Ran custom script db_dumper.sh targeting confidential schemas',              anomalyScore:0.60, isDeceptionTarget:true,  location:'Server Room' }
];

const demoAlerts = [
  { alertId:'ALT-1001', employeeId:'EMP-8021', employeeName:'Dr. Sarah Vance',  timestamp:new Date(Date.now()-1000*60*15),  riskScore:88, severity:'Critical', category:'Data Exfiltration',   reason:'Massive outbound encrypted traffic spike combined with high-volume file downloads & USB insertion.', status:'New' },
  { alertId:'ALT-1002', employeeId:'EMP-4019', employeeName:'Marcus Sterling',  timestamp:new Date(Date.now()-1000*60*45),  riskScore:74, severity:'High',     category:'Unusual Bulk Export',  reason:'Exported confidential payroll ledger onto unregistered USB device during abnormal hours.',          status:'Investigating' },
  { alertId:'ALT-1003', employeeId:'EMP-1102', employeeName:'Elena Rostova',    timestamp:new Date(Date.now()-1000*60*120), riskScore:62, severity:'Medium',   category:'Privilege Misuse',     reason:'Unscheduled root privilege escalation and raw database dump execution on production DB.',           status:'Investigating' },
  { alertId:'ALT-1004', employeeId:'EMP-3120', employeeName:'Robert Thorne',    timestamp:new Date(Date.now()-1000*60*300), riskScore:35, severity:'Low',      category:'Off-hours Access',     reason:'Executive portal login detected from new geography (London, UK).',                                 status:'Resolved' }
];

const seedData = async () => {
  if (!getIsConnected()) {
    console.log('[Seed] MongoDB offline — using in-memory demo data.');
    return;
  }
  try {
    await Employee.deleteMany({});
    await Activity.deleteMany({});
    await Alert.deleteMany({});
    await Employee.insertMany(demoEmployees);
    await Activity.insertMany(demoActivities);
    await Alert.insertMany(demoAlerts);
    console.log('[Seed] MongoDB populated with SIMULATED demo data.');
  } catch (err) {
    console.error('[Seed] Error seeding data:', err.message);
  }
};

module.exports = { seedData, demoEmployees, demoActivities, demoAlerts };
