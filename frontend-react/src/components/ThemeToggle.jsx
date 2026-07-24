import React from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { themeName, toggleTheme, theme } = useTheme();
  const isDark = themeName === 'dark';

  const containerStyle = {
    width: '60px',
    height: '30px',
    borderRadius: '30px',
    background: isDark ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
    border: `1px solid ${theme.border}`,
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '0 4px',
    transition: 'background 0.5s ease',
    boxShadow: isDark ? 'inset 0 2px 4px rgba(0,0,0,0.5)' : 'inset 0 2px 4px rgba(0,0,0,0.1)'
  };

  const toggleCircleStyle = {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: isDark ? '#f8fafc' : '#f59e0b',
    position: 'absolute',
    left: isDark ? 'calc(100% - 26px)' : '4px',
    transition: 'left 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), background 0.4s ease, box-shadow 0.4s ease',
    boxShadow: isDark ? '0 0 10px rgba(255,255,255,0.4)' : '0 0 10px rgba(245,158,11,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '12px'
  };

  return (
    <div 
      style={containerStyle} 
      onClick={toggleTheme} 
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      <div style={toggleCircleStyle}>
        {isDark ? '🌙' : '☀️'}
      </div>
    </div>
  );
};

export default ThemeToggle;
