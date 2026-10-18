// src/pages/Login.jsx
import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import { loginUser } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('analyst@cybercorp.org');
  const [password, setPassword] = useState('CyberSec@2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser(email, password);
      if (res.success) {
        onLoginSuccess(res.user);
      } else {
        setError(res.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError('Connection to security gateway failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 16px 12px 42px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-default)',
    borderRadius: '8px',
    color: '#0f172a',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
    boxShadow: 'var(--shadow-xs)',
    transition: 'border-color 0.15s, box-shadow 0.15s'
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '14px',
            marginBottom: '18px',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.12)'
          }}>
            <Shield size={26} color="#2563eb" strokeWidth={2.4} />
          </div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Behavioral SOC Console
          </h1>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
            Adaptive Deception-Resistant Insider Threat AI
          </p>
        </div>

        {/* Login Card */}
        <div className="soc-card" style={{ padding: '36px 32px', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-lg)' }}>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 14px',
              color: '#b91c1c',
              fontSize: '13px',
              marginBottom: '20px',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Analyst Security Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Access Credentials
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingRight: '42px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: '2px'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Academic Notice */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '9px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '11px 13px',
              fontSize: '12px',
              color: '#1e40af',
              lineHeight: 1.5
            }}>
              <ShieldCheck size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#2563eb' }} />
              <span>
                <strong>Academic Prototype:</strong> Model outputs represent simulated anomaly scores rather than validated criminal profiling.
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '14px', marginTop: '4px', justifyContent: 'center' }}
            >
              {loading ? 'Verifying Credentials...' : 'Authenticate & Enter SOC'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '22px', fontSize: '12.5px', color: '#64748b', fontWeight: 500 }}>
          Department of Computer Science & Engineering &bull; Final Year Research
        </p>
      </div>
    </div>
  );
}
