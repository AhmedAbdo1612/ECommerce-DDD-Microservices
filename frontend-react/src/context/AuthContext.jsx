import React, { createContext, useState, useEffect } from 'react';
import { axiosInstance } from '../api/axios';
import { decodeToken, isTokenExpired, getUserRole } from '../utils/jwt';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from local storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    
    if (storedToken && !isTokenExpired(storedToken)) {
      setToken(storedToken);
      const decoded = decodeToken(storedToken);
      const role = getUserRole(storedToken);
      
      setUser({
        ...decoded,
        role: role
      });
    } else if (storedToken) {
      // Token is expired
      logout();
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', { email, password });
      const token = response.data.accessToken;
      
      localStorage.setItem('token', token);
      setToken(token);
      
      const decoded = decodeToken(token);
      const role = getUserRole(token);
      
      setUser({
        ...decoded,
        role: role
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      // userData might include email, password, firstName, lastName, username, etc.
      await axiosInstance.post('/api/auth/register', userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const contextValue = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    isCustomer: user?.role === 'Customer',
    login,
    register,
    logout
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0F172A', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
