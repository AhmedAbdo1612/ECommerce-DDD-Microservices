import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Customer'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const result = await register(formData);
    
    if (result.success) {
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message || 'Failed to register');
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
    maxWidth: '500px',
    boxShadow: theme.shadow,
    border: `1px solid ${theme.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    transition: 'all 0.3s ease'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '0.5rem'
  };

  const titleStyle = {
    margin: '0 0 0.5rem 0',
    fontSize: '2rem',
    fontWeight: '700',
    color: theme.textPrimary
  };

  const inputRowStyle = {
    display: 'flex',
    gap: '1rem'
  };

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1
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
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.3s, color 0.3s',
    width: '100%',
    boxSizing: 'border-box'
  };
  
  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
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

  const alertStyle = (type) => ({
    padding: '0.75rem',
    borderRadius: '8px',
    background: type === 'error' ? theme.errorBg : theme.successBg,
    border: `1px solid ${type === 'error' ? theme.error : theme.success}`,
    color: type === 'error' ? theme.error : theme.success,
    fontSize: '0.875rem',
    textAlign: 'center'
  });

  return (
    <div style={containerStyle}>
      <form style={formCardStyle} onSubmit={handleSubmit}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Create Account</h2>
          <p style={{ margin: 0, color: theme.textSecondary, fontSize: '0.9rem' }}>Join Instashop today</p>
        </div>

        {error && <div style={alertStyle('error')}>{error}</div>}
        {success && <div style={alertStyle('success')}>{success}</div>}

        <div style={inputRowStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>First Name</label>
            <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} required style={inputStyle} />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Last Name</label>
            <input name="lastName" type="text" value={formData.lastName} onChange={handleChange} required style={inputStyle} />
          </div>
        </div>

        <div style={inputRowStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Username</label>
            <input name="username" type="text" value={formData.username} onChange={handleChange} required style={inputStyle} />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Email Address</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
          </div>
        </div>

        <div style={inputRowStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} required style={inputStyle} minLength={6} />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Confirm Password</label>
            <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required style={inputStyle} minLength={6} />
          </div>
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Account Role</label>
          <select name="role" value={formData.role} onChange={handleChange} style={selectStyle}>
            <option value="Customer">Customer</option>
            <option value="Admin">Admin</option>
          </select>
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
          {loading ? 'Registering...' : 'Register Account'}
        </button>

        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: theme.textSecondary, marginTop: '0.5rem' }}>
          Already have an account? <Link to="/login" style={{ color: theme.primary, textDecoration: 'none', fontWeight: '500' }}>Sign in here</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
