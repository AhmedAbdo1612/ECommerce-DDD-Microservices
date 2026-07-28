import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      const userRoles = result.userData?.role;
      const isStaff = Array.isArray(userRoles) 
        ? (userRoles.includes('Admin') || userRoles.includes('Manager')) 
        : (userRoles === 'Admin' || userRoles === 'Manager');
      
      const defaultPath = isStaff ? '/admin' : '/customer';
      navigate(location.state?.from?.pathname || defaultPath, { replace: true });
    } else {
      setError(result.message || 'Failed to login');
    }
    
    setLoading(false);
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 70px)',
    padding: '2rem'
  };

  const formCardStyle = {
    background: theme.backgroundCard,
    backdropFilter: 'blur(16px)',
    borderRadius: '16px',
    padding: '3rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: theme.shadow,
    border: `1px solid ${theme.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    transition: 'all 0.3s ease'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '1rem'
  };

  const titleStyle = {
    margin: '0 0 0.5rem 0',
    fontSize: '2rem',
    fontWeight: '700',
    color: theme.textPrimary
  };

  const subtitleStyle = {
    margin: 0,
    color: theme.textSecondary,
    fontSize: '0.9rem'
  };

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  };

  const labelStyle = {
    fontSize: '0.875rem',
    color: theme.textPrimary,
    fontWeight: '500'
  };

  const inputStyle = {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    background: theme.backgroundAlt,
    color: theme.textPrimary,
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.3s, color 0.3s'
  };

  const buttonStyle = {
    marginTop: '1rem',
    padding: '0.875rem',
    borderRadius: '8px',
    border: 'none',
    background: theme.primaryGradient,
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: theme.shadowGlow
  };

  const errorStyle = {
    padding: '0.75rem',
    borderRadius: '8px',
    background: theme.errorBg,
    border: `1px solid ${theme.error}`,
    color: theme.error,
    fontSize: '0.875rem',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <form style={formCardStyle} onSubmit={handleSubmit}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Welcome Back</h2>
          <p style={subtitleStyle}>Sign in to access your account</p>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="email">Email Address</label>
          <input 
            id="email"
            type="email" 
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = theme.primary;
              e.target.style.boxShadow = `0 0 0 2px ${theme.border}`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="password">Password</label>
          <input 
            id="password"
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = theme.primary;
              e.target.style.boxShadow = `0 0 0 2px ${theme.border}`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          style={buttonStyle}
          onMouseOver={(e) => {
            if(!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={(e) => {
            if(!loading) {
              e.currentTarget.style.transform = 'none';
            }
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: theme.textSecondary, marginTop: '1rem' }}>
          Don't have an account? <Link to="/register" style={{ color: theme.primary, textDecoration: 'none', fontWeight: '500' }}>Register here</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
