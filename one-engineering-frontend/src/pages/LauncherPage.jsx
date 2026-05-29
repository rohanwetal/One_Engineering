import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthUser, removeAuthUser } from '../utils/auth';
import SummaryApi from '../apis/index.jsx';
import logo from '../assets/logo_gainwell_r.png';
import { BiLogOut } from 'react-icons/bi';
import { BsGridFill, BsBarChartFill, BsLockFill } from 'react-icons/bs';
import '../styles/portal.css';

// Nexus is served by Vite from public/nexus/ — same origin, no cross-origin issues
const NEXUS_URL = '/nexus/home.html';

// Roles that can access Nexus
const NEXUS_ALLOWED_ROLES = ['Manager(COE)', 'Admin'];

const LauncherPage = () => {
  const navigate  = useNavigate();
  const session   = getAuthUser();           // { token, user, expiry }
  const user      = session?.user;
  const [loggingOut, setLoggingOut] = useState(false);

  const canAccessNexus = user?.role && NEXUS_ALLOWED_ROLES.includes(user.role);
  const isEmployee     = !canAccessNexus;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch(SummaryApi.logout.url, { method: SummaryApi.logout.method, credentials: 'include' });
    } catch { /* clear regardless */ }
    await new Promise(r => setTimeout(r, 2000));
    removeAuthUser();
    navigate('/login', { replace: true });
  };

  const launchDesignWorks = () => {
    if (!user?.employeeId) return;
    navigate(isEmployee
      ? `/dashboard/employee/${user.employeeId}`
      : `/dashboard/manager/${user.employeeId}`
    );
  };

  const launchNexus = () => {
    if (!canAccessNexus || !session) return;
    // Copy OE session into 'nexus:session' so Nexus shared.js can read it
    try {
      localStorage.setItem('nexus:session', JSON.stringify(session));
    } catch (e) {
      console.error('Could not write nexus:session', e);
      return;
    }
    window.location.href = NEXUS_URL;
  };

  const apps = [
    {
      key:         'nexus',
      icon:        isEmployee
                     ? <BsLockFill size={28} color="#fff" />
                     : <BsGridFill  size={32} color="#fff" />,
      iconBg:      isEmployee
                     ? 'linear-gradient(135deg, #94a3b8 60%, #64748b 100%)'
                     : 'linear-gradient(135deg, #3b82f6 60%, #6366f1 100%)',
      title:       'NEXUS',
      description: 'Project tracking, CoE analytics, operational monitoring and engineering workflow systems.',
      onLaunch:    canAccessNexus ? launchNexus : null,
      locked:      isEmployee,
      lockReason:  'Available to Manager (COE) and Admin only',
    },
    {
      key:         'designworks',
      icon:        <BsBarChartFill size={32} color="#fff" />,
      iconBg:      'linear-gradient(135deg, #7c3aed 60%, #4f46e5 100%)',
      title:       'DESIGNWORKS',
      description: 'Engineering collaboration platform, digital workspace, timesheet management and technical asset tracking.',
      onLaunch:    launchDesignWorks,
      locked:      false,
    },
  ];

  return (
    <div className="dashboard-container">

      {/* Logout spinner overlay */}
      {loggingOut && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(14,30,61,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '18px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', border: '5px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', animation: 'spin 0.85s linear infinite' }} />
          <p style={{ color: '#fff', fontSize: '15px', fontWeight: 600, margin: 0 }}>Logging out…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Navbar */}
      <div className="dashboard-navbar">
        <div className="logo-section">
          <img src={logo} alt="ONE ENGINEERING" className="portal-logo" style={{ mixBlendMode: 'screen' }} />
          <div>
            <h2>ONE ENGINEERING</h2>
            <p>Unified Engineering Workspace</p>
          </div>
        </div>
        <div className="profile-section">
          {user && (
            <div className="profile-info">
              <h4>{user.name}</h4>
              <span>{user.role}{user.department ? ` · ${user.department}` : ''}</span>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            Logout <BiLogOut size={15} />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="hero-section" style={{ marginBottom: '40px' }}>
        <div className="hero-badge">ENGINEERING OPERATIONS</div>
        <h1>Launch Your<br /><span>Workspace</span></h1>
        <p>Select a platform to get started. Access engineering tools, analytics and collaboration systems tailored to your role.</p>
      </div>

      {/* Tools grid */}
      <div className="tools-grid">
        {apps.map(app => (
          <div key={app.key} className="tool-card" style={app.locked ? { opacity: 0.6, filter: 'grayscale(0.35)' } : undefined}>
            <div className="tool-top">
              <div className="tool-icon" style={{ background: app.iconBg }}>{app.icon}</div>
              {app.locked
                ? <span className="tool-status" style={{ background: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.25)' }}>LOCKED</span>
                : <span className="tool-status">ACTIVE</span>
              }
            </div>
            <h2>{app.title}</h2>
            <p>{app.description}</p>
            {app.locked ? (
              <>
                {app.lockReason && (
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', marginTop: '-20px', fontStyle: 'italic' }}>
                    🔒 {app.lockReason}
                  </p>
                )}
                <button className="launch-btn" disabled style={{ opacity: 0.45, cursor: 'not-allowed', pointerEvents: 'none' }}>
                  Launch Platform →
                </button>
              </>
            ) : (
              <button className="launch-btn" onClick={app.onLaunch}>
                Launch Platform →
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="dashboard-footer">
        © 2026 Gainwell Engineering · ONE ENGINEERING Portal
      </div>
    </div>
  );
};

export default LauncherPage;
