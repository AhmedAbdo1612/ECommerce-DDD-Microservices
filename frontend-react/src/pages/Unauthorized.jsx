import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

const Unauthorized = () => {
  const { theme } = useTheme();

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 70px)',
    padding: '2rem',
    textAlign: 'center',
    transition: 'all 0.3s ease'
  };

  const titleStyle = {
    fontSize: '6rem',
    fontWeight: '800',
    margin: '0',
    color: theme.error,
  };

  const subtitleStyle = {
    fontSize: '2rem',
    color: theme.textPrimary,
    margin: '1rem 0',
    fontWeight: '700'
  };

  const textStyle = {
    color: theme.textSecondary,
    fontSize: '1.1rem',
    marginBottom: '2rem'
  };

  const btnStyle = {
    padding: '0.875rem 2rem',
    borderRadius: '8px',
    background: theme.backgroundCard,
    border: `1px solid ${theme.border}`,
    color: theme.textPrimary,
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'background 0.2s',
    backdropFilter: 'blur(8px)'
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>403</h1>
      <h2 style={subtitleStyle}>Access Denied</h2>
      <p style={textStyle}>You do not have permission to view this page.</p>
      <Link 
        to="/" 
        style={btnStyle}
        onMouseOver={(e) => { e.currentTarget.style.background = theme.backgroundAlt; }}
        onMouseOut={(e) => { e.currentTarget.style.background = theme.backgroundCard; }}
      >
        Return to Home
      </Link>
    </div>
  );
};

export default Unauthorized;
