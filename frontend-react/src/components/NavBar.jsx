import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useCart } from '../context/CartContext';
import ThemeToggle from './ThemeToggle';
import { ShoppingCart } from 'lucide-react';

const NavBar = () => {
  const { isAuthenticated, isAdmin, isManager, isCustomer, logout, user } = useAuth();
  const { theme } = useTheme();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: theme.navBackground,
    backdropFilter: 'blur(10px)',
    borderBottom: `1px solid ${theme.border}`,
    boxShadow: theme.shadow,
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease'
  };

  const linkContainerStyles = {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center'
  };

  const linkStyles = {
    color: theme.textPrimary,
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '1rem',
    transition: 'color 0.3s ease',
    cursor: 'pointer'
  };

  const brandStyles = {
    color: theme.primary,
    textDecoration: 'none',
    fontWeight: '800',
    fontSize: '1.5rem',
    letterSpacing: '-0.025em',
    transition: 'color 0.3s ease'
  };

  const buttonStyles = {
    background: theme.error,
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease',
    boxShadow: `0 4px 14px 0 ${theme.errorBg}`,
  };

  const userInfoStyles = {
    color: theme.textSecondary,
    fontSize: '0.875rem',
    marginRight: '1rem',
    background: theme.backgroundAlt,
    padding: '0.25rem 0.75rem',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: `1px solid ${theme.border}`,
    transition: 'background 0.3s ease, color 0.3s ease, border-color 0.3s ease'
  };

  return (
    <nav style={navStyles}>
      <div>
        <Link to="/" style={brandStyles}>Instashop</Link>
      </div>
      
      <div style={linkContainerStyles}>
        <ThemeToggle />
        
        <Link to="/cart" style={{ ...linkStyles, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingCart size={24} />
          {itemCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: theme.primary,
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme.shadow
            }}>
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </Link>

        {isAuthenticated ? (
          <>
            {(isAdmin || isManager) && <Link to="/admin" style={linkStyles}>Admin Dashboard</Link>}
            {(!isAdmin && !isManager) && <Link to="/customer" style={linkStyles}>Customer Dashboard</Link>}
            
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '1rem' }}>
              <span style={userInfoStyles}>
                <span style={{width: '8px', height: '8px', background: theme.success, borderRadius: '50%', display: 'inline-block'}}></span>
                {user?.email || 'User'} ({user?.role})
              </span>
              <button 
                onClick={handleLogout} 
                style={buttonStyles}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${theme.errorBg}`; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 4px 14px 0 ${theme.errorBg}`; }}
              >
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyles}>Sign In</Link>
            <Link 
              to="/register" 
              style={{
                ...linkStyles, 
                background: theme.primaryGradient, 
                padding: '0.5rem 1rem', 
                borderRadius: '8px', 
                color: 'white',
                boxShadow: theme.shadowGlow
              }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
