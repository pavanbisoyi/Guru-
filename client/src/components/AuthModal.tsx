import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, AlertCircle } from 'lucide-react';
import { api, setStoredToken } from '../api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('ECE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({
          username: emailOrUsername.split('@')[0] || emailOrUsername,
          email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@student.guru.edu`,
          password,
          name,
          department
        });
        setStoredToken(res.token);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.login(emailOrUsername, password);
        setStoredToken(res.token);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'admin' | 'student') => {
    if (role === 'admin') {
      setEmailOrUsername('admin@guru.edu');
      setPassword('Admin@123');
    } else {
      setEmailOrUsername('student@guru.edu');
      setPassword('Student@123');
    }
    setIsRegister(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f2b48' }}>
            {isRegister ? 'Create GURU Student Account' : 'Sign in to GURU'}
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#e11d48',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Fast Fill for Testing */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '18px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Quick Fill Demo Credentials:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ fontSize: '12px', padding: '6px 10px', justifyContent: 'center' }}
                onClick={() => handleQuickLogin('student')}
              >
                <UserIcon size={14} color="#2563eb" />
                <span>Student Demo</span>
              </button>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ fontSize: '12px', padding: '6px 10px', justifyContent: 'center' }}
                onClick={() => handleQuickLogin('admin')}
              >
                <Shield size={14} color="#059669" />
                <span>Admin Demo</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Arjun Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Branch / Department</label>
                  <select 
                    className="form-select"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="ECE">Electronics and Communication (ECE)</option>
                    <option value="CSE">Computer Science and Engineering (CSE)</option>
                    <option value="Electrical">Electrical and Electronics (EEE)</option>
                    <option value="Instrumentation">Instrumentation Engineering</option>
                    <option value="Mechanical">Mechanical Engineering</option>
                    <option value="Civil">Civil Engineering</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email or Username</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="student@guru.edu or username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '12px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button 
                  type="button" 
                  onClick={() => setIsRegister(false)}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account yet?{' '}
                <button 
                  type="button" 
                  onClick={() => setIsRegister(true)}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}
                >
                  Register
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
