import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const containerStyle = {
    padding: '3rem',
    maxWidth: '1200px',
    margin: '0 auto',
    color: theme.textPrimary,
    transition: 'color 0.3s ease'
  };

  const headerCardStyle = {
    background: theme.backgroundCard,
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '2.5rem',
    border: `1px solid ${theme.border}`,
    boxShadow: theme.shadow,
    marginBottom: '2rem',
    transition: 'all 0.3s ease'
  };

  const titleStyle = {
    margin: '0 0 1rem 0',
    fontSize: '2.5rem',
    fontWeight: '800',
    color: theme.primary
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginTop: '2rem'
  };

  const statCardStyle = {
    background: theme.backgroundAlt,
    padding: '1.5rem',
    borderRadius: '12px',
    border: `1px solid ${theme.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    transition: 'all 0.3s ease'
  };

  const statValueStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    color: theme.textPrimary,
    margin: 0
  };

  const statLabelStyle = {
    color: theme.textSecondary,
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '600'
  };

  return (
    <div style={containerStyle}>
      <div style={headerCardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: '600', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            Admin Portal
          </span>
        </div>
        <h1 style={titleStyle}>Welcome, System Admin</h1>
        <p style={{ color: theme.textSecondary, fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6' }}>
          You are currently logged in as <strong style={{ color: theme.textPrimary }}>{user?.email}</strong>. 
          You have full access to manage users, view analytics, and configure system settings.
        </p>

        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <span style={statLabelStyle}>Total Users</span>
            <h3 style={statValueStyle}>1,248</h3>
          </div>
          <div style={statCardStyle}>
            <span style={statLabelStyle}>Active Orders</span>
            <h3 style={statValueStyle}>142</h3>
          </div>
          <div style={statCardStyle}>
            <span style={statLabelStyle}>System Status</span>
            <h3 style={{ ...statValueStyle, color: theme.success }}>Online</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
