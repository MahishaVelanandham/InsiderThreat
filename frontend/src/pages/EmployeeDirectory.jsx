// src/pages/EmployeeDirectory.jsx
import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, User, UserPlus, X, CheckCircle } from 'lucide-react';
import { fetchEmployees, registerEmployee } from '../services/api';

export default function EmployeeDirectory({ onSelectEmployee }) {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [riskLevel, setRiskLevel] = useState('All');
  const [loading, setLoading] = useState(false);

  // Registration Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: 'EMP-001',
    name: '',
    department: 'Software Engineering',
    role: 'Research Participant'
  });
  const [modalSuccess, setModalSuccess] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const list = await fetchEmployees({ search, department, riskLevel });
      setEmployees(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [search, department, riskLevel]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.employeeId.trim()) return;
    try {
      await registerEmployee(formData);
      setModalSuccess(true);
      fetchList();
      setTimeout(() => {
        setModalSuccess(false);
        setShowModal(false);
        setFormData({ employeeId: 'EMP-002', name: '', department: 'Software Engineering', role: 'Research Participant' });
      }, 1500);
    } catch (err) {
      alert('Error registering employee: ' + err.message);
    }
  };

  const departments = ['All', 'R&D', 'Finance', 'IT Ops', 'Software Engineering', 'HR', 'Executive Office'];
  const riskLevels = ['All', 'Low', 'Medium', 'High', 'Critical'];

  return (
    <div style={{ padding: '32px 36px 64px 36px', maxWidth: '1600px' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Workstation & Entity Directory
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13.5px' }}>
            Real-time behavioral telemetry profiles across monitored enterprise cohorts
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <UserPlus size={15} />
          Register Workstation / Cohort
        </button>
      </div>

      {/* Filters Bar */}
      <div className="soc-card" style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search by ID, name, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 12px 10px 38px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              color: '#0f172a',
              fontSize: '13.5px',
              outline: 'none'
            }}
          />
        </div>

        {/* Dept Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} color="#64748b" />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            style={{
              padding: '9px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              color: '#0f172a',
              fontSize: '13px',
              outline: 'none',
              fontWeight: 500
            }}
          >
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Risk Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Risk:</span>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            style={{
              padding: '9px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              color: '#0f172a',
              fontSize: '13px',
              outline: 'none',
              fontWeight: 500
            }}
          >
            {riskLevels.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '13.5px' }}>
          Querying directory indices...
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Workstation / Entity</th>
                <th>Department & Role</th>
                <th>Risk Classification</th>
                <th>Telemetry Score</th>
                <th>Monitoring Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                    No matching endpoint telemetry profiles found.
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.employeeId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          backgroundColor: emp.employeeId === 'EMP-001' ? '#eff6ff' : '#f8fafc',
                          padding: '8px',
                          borderRadius: '8px',
                          border: emp.employeeId === 'EMP-001' ? '1px solid #bfdbfe' : '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <User size={15} color={emp.employeeId === 'EMP-001' ? '#2563eb' : '#64748b'} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>{emp.name}</p>
                            {emp.employeeId === 'EMP-001' && (
                              <span style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                backgroundColor: '#f0fdf4',
                                color: '#15803d',
                                border: '1px solid #bbf7d0',
                                padding: '1px 7px',
                                borderRadius: '9999px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                              }}>
                                Local Host
                              </span>
                            )}
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: '#64748b' }}>
                            {emp.employeeId} &bull; {emp.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p style={{ margin: 0, fontSize: '13.5px', color: '#0f172a', fontWeight: 600 }}>{emp.department}</p>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{emp.role}</span>
                    </td>
                    <td>
                      <span className={`badge-${String(emp.riskLevel || 'low').toLowerCase()}`}>
                        {emp.riskLevel}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '15px',
                        fontWeight: 800,
                        color: emp.riskScore >= 75 ? '#dc2626' : (emp.riskScore >= 50 ? '#d97706' : '#15803d')
                      }}>
                        {emp.riskScore}
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}> / 100</span>
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: emp.status === 'Active' ? '#15803d' : '#b45309'
                      }}>
                        <span className={`status-dot ${emp.status === 'Active' ? 'status-dot-active' : 'status-dot-warning'}`}></span>
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => onSelectEmployee(emp.employeeId)}
                        className="btn-secondary"
                        style={{ padding: '6px 13px', fontSize: '12px' }}
                      >
                        <Eye size={13} />
                        Audit Telemetry
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Register Workstation Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            width: '460px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-default)',
            borderRadius: '14px',
            padding: '28px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserPlus size={16} color="#2563eb" />
                </div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>Register Real Workstation</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {modalSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle size={44} color="#16a34a" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ color: '#0f172a', margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700 }}>Workstation Registered!</h4>
                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                  Live agent command: <code style={{ color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>py monitor.py --emp {formData.employeeId}</code>
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegister}>
                <p style={{ color: '#64748b', fontSize: '12.5px', marginTop: 0, marginBottom: '18px', lineHeight: 1.5 }}>
                  Register your device with its identifier. Real telemetry will be ingested into this endpoint.
                </p>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Participant / Workstation ID
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="e.g. EMP-001"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-default)',
                      borderRadius: '6px',
                      color: '#0f172a',
                      fontSize: '13.5px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Subject Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Mahisha V"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-default)',
                      borderRadius: '6px',
                      color: '#0f172a',
                      fontSize: '13.5px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-default)',
                      borderRadius: '6px',
                      color: '#0f172a',
                      fontSize: '13.5px'
                    }}
                  >
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="R&D">R&D</option>
                    <option value="Finance">Finance</option>
                    <option value="IT Ops">IT Ops</option>
                    <option value="HR">HR</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '10px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ flex: 1, padding: '10px' }}
                  >
                    Save Workstation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
