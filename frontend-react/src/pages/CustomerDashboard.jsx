import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import ProductList from '../components/ProductList';
import ErrorBoundary from '../components/ErrorBoundary';

const CustomerDashboard = () => {
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

  const actionsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginTop: '2rem'
  };

  const actionCardStyle = {
    background: theme.backgroundAlt,
    padding: '2rem',
    borderRadius: '12px',
    border: `1px solid ${theme.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    transition: 'transform 0.2s, background 0.3s',
    cursor: 'pointer'
  };

  return (
    <div style={containerStyle}>
      <div style={headerCardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span style={{ background: theme.successBg, color: theme.success, padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: '600', border: `1px solid ${theme.success}` }}>
            Customer Account
          </span>
        </div>
        <h1 style={titleStyle}>Hello, {user?.email?.split('@')[0] || 'Shopper'}</h1>
        <p style={{ color: theme.textSecondary, fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6' }}>
          Welcome back to Instashop. Manage your orders, update your profile, and explore our latest products.
        </p>

        <div style={actionsGridStyle}>
          <div 
            style={actionCardStyle}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = theme.border; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = theme.backgroundAlt; }}
          >
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: theme.textPrimary }}>My Orders</h3>
            <p style={{ margin: 0, color: theme.textSecondary }}>View and track your recent purchases.</p>
          </div>
          
          <div 
            style={actionCardStyle}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = theme.border; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = theme.backgroundAlt; }}
          >
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: theme.textPrimary }}>Account Settings</h3>
            <p style={{ margin: 0, color: theme.textSecondary }}>Update your personal information and password.</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ color: theme.textPrimary, borderBottom: `1px solid ${theme.border}`, paddingBottom: '1rem', marginBottom: '1rem' }}>Latest Products</h2>
        <ErrorBoundary>
          <ProductList />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default CustomerDashboard;
