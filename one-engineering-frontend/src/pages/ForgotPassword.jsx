import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SummaryApi from '../apis/index.jsx';
import logo from '../assets/logo_gainwell_main.png';
import { project_name } from '../config/project';
import '../styles/portal.css';

const COMPANY_DOMAIN = '@gainwellengineering.com';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', employeeId: '', newPassword: '', confirmPassword: '' });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};

    if (!formData.email.trim()) {
      e.email = 'Email is required';
    } else if (!formData.email.toLowerCase().endsWith(COMPANY_DOMAIN)) {
      e.email = `Only ${COMPANY_DOMAIN} email addresses are allowed`;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'Please enter a valid email address';
    }

    if (!formData.employeeId.trim()) e.employeeId = 'Employee ID is required';

    if (!formData.newPassword) {
      e.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      e.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      e.newPassword = 'Must contain uppercase, lowercase, and a number';
    }

    if (!formData.confirmPassword) {
      e.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await fetch(SummaryApi.forgotPassword.url, {
        method: SummaryApi.forgotPassword.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:       formData.email.trim().toLowerCase(),
          employeeId:  formData.employeeId.trim().toUpperCase(),
          newPassword: formData.newPassword,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(true);
      } else {
        setErrors({ api: data.message || 'Password reset failed. Please check your details.' });
      }
    } catch {
      setErrors({ api: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const errStyle = (field) => errors[field] ? { borderColor: '#f87171', background: '#fff5f5' } : {};

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #243252 0%, #1e2947 45%, #1b2644 100%)' }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 55%, rgba(198,40,40,0.09) 0%, transparent 55%)', pointerEvents: 'none' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 75% 30%, rgba(91,155,213,0.07) 0%, transparent 50%)', pointerEvents: 'none' }} />

      <div className="relative z-10 min-h-screen flex flex-col px-6 py-8 lg:px-28 lg:py-10">
        <img src={logo} alt={project_name} className="object-left flex-shrink-0" style={{ height: '72px', width: 'auto', objectFit: 'contain' }} />

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full auth-card" style={{ padding: '44px 40px', maxWidth: '420px' }}>

            {success ? (
              /* ── Success state ── */
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '52px', marginBottom: '16px' }}>✅</div>
                <h2 className="auth-title" style={{ marginBottom: '10px' }}>Password Updated!</h2>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7, marginBottom: '28px' }}>
                  Your password has been changed successfully. You can now sign in with your new password.
                </p>
                <button
                  onClick={() => navigate('https://apps.acceleronsolutions.io/gepl_one_engineering/login')}
                  className="auth-button"
                >
                  Go to Sign In →
                </button>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                  <span className="auth-badge" style={{ background: 'rgba(198,40,40,0.10)', border: '1px solid rgba(198,40,40,0.22)', color: '#e57373' }}>
                    RESET PASSWORD
                  </span>
                </div>
                <h2 className="auth-title">Forgot Password</h2>
                <p className="auth-subtitle" style={{ marginTop: '6px', marginBottom: '4px' }}>
                  Verify your identity and set a new password
                </p>

                {errors.api && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px 13px', borderRadius: '8px', fontSize: '12.5px', marginTop: '14px' }}>
                    {errors.api}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  <div>
                    <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#1f2937', marginBottom: '6px' }}>
                      Company Email
                      <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400, marginLeft: '6px' }}>
                        (@gainwellengineering.com)
                      </span>
                    </label>
                    <input name="email" value={formData.email} onChange={handleChange}
                      placeholder="you@gainwellengineering.com" className="auth-input" style={errStyle('email')} />
                    {errors.email && <p style={{ color: '#ef4444', fontSize: '11.5px', marginTop: '3px' }}>{errors.email}</p>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#1f2937', marginBottom: '6px' }}>Employee ID</label>
                    <input name="employeeId" value={formData.employeeId} onChange={handleChange}
                      placeholder="e.g. GEPL0106" className="auth-input" style={errStyle('employeeId')} />
                    {errors.employeeId && <p style={{ color: '#ef4444', fontSize: '11.5px', marginTop: '3px' }}>{errors.employeeId}</p>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#1f2937', marginBottom: '6px' }}>New Password</label>
                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange}
                      placeholder="Min 8 chars, uppercase + number" className="auth-input" style={errStyle('newPassword')} />
                    {errors.newPassword && <p style={{ color: '#ef4444', fontSize: '11.5px', marginTop: '3px' }}>{errors.newPassword}</p>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#1f2937', marginBottom: '6px' }}>Confirm New Password</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                      placeholder="Repeat new password" className="auth-input" style={errStyle('confirmPassword')} />
                    {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: '11.5px', marginTop: '3px' }}>{errors.confirmPassword}</p>}
                  </div>

                  <button type="submit" disabled={loading} className="auth-button" style={{ marginTop: '4px' }}>
                    {loading ? 'Resetting…' : 'Reset Password →'}
                  </button>
                </form>

                

                <p style={{ textAlign: 'center', fontSize: '13px', color: '#9ca3af', marginTop: '20px' }}>
                  Remember your password?{' '}
                  <Link to="/login" className="auth-link" style={{ color: '#4a7fc1' }}>
                                Sign in
                              </Link>
                </p>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
