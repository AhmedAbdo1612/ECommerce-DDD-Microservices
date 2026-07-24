import React, { createContext, useState, useEffect } from 'react';
import { tokens } from '../theme/designTokens';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check local storage or system preference
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  const [themeName, setThemeName] = useState(getInitialTheme);
  
  const toggleTheme = () => {
    setThemeName(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Persist to local storage when changed
  useEffect(() => {
    localStorage.setItem('theme', themeName);
  }, [themeName]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only change if the user hasn't explicitly set a preference in localStorage
      if (!localStorage.getItem('theme')) {
        setThemeName(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const theme = tokens[themeName];

  return (
    <ThemeContext.Provider value={{ themeName, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
