import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import AdminProducts from '../components/AdminProducts';
import AdminOrders from '../components/AdminOrders';
const AdminDashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');

  const containerStyle = {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    color: theme.textPrimary,
    transition: 'color 0.3s ease',
    display: 'flex',
    gap: '2rem',
    alignItems: 'flex-start'
  };

  const sidebarStyle = {
    width: '260px',
    flexShrink: 0,
    background: theme.backgroundCard,
    borderRadius: '16px',
    padding: '1.5rem',
    border: `1px solid ${theme.border}`,
    boxShadow: theme.shadow,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    position: 'sticky',
    top: '100px'
  };

  const contentStyle = {
    flex: 1,
    minWidth: 0
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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

  const sidebarBtnStyle = (isActive) => ({
    padding: '1rem 1.25rem',
    background: isActive ? theme.primaryGradient || `linear-gradient(135deg, ${theme.primary} 0%, #4f46e5 100%)` : 'transparent',
    color: isActive ? '#ffffff' : theme.textPrimary,
    border: 'none',
    borderRadius: '12px',
    textAlign: 'left',
    fontSize: '1.05rem',
    fontWeight: isActive ? '700' : '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    textDecoration: 'none',
    boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
  });

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
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
        );
      case 'products':
        return (
          <div style={{ background: theme.backgroundCard, borderRadius: '16px', padding: '1.5rem 2rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, width: '100%', boxSizing: 'border-box' }}>
             <AdminProducts />
          </div>
        );
      case 'orders':
        return (
          <div style={{ background: theme.backgroundCard, borderRadius: '16px', padding: '1.5rem 2rem', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, width: '100%', boxSizing: 'border-box' }}>
            <AdminOrders />
          </div>
        );
      case 'users':
        return (
          <div style={headerCardStyle}>
            <h2>User Management</h2>
            <p style={{ color: theme.textSecondary }}>User management and roles coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div style={headerCardStyle}>
            <h2>System Settings</h2>
            <p style={{ color: theme.textSecondary }}>Global settings and configurations coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'products', label: '📦 Products' },
    { id: 'orders', label: '🛒 Orders' },
    { id: 'users', label: '👥 Users' },
    { id: 'settings', label: '⚙️ Settings' }
  ];

  return (
    <div style={containerStyle}>
      <aside style={sidebarStyle}>
        <div style={{ padding: '0.5rem 1rem 1.5rem 1rem', borderBottom: `1px solid ${theme.border}`, marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: theme.textPrimary, fontSize: '1.2rem' }}>Administration</h3>
        </div>
        
        {navItems.map(item => (
          <button 
            key={item.id}
            style={sidebarBtnStyle(activeTab === item.id)}
            onClick={() => setActiveTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </aside>
      
      <main style={contentStyle}>
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
