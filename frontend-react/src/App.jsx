import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import Unauthorized from './pages/Unauthorized';
import DebugPanel from './components/DebugPanel';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import { useTheme } from './hooks/useTheme';

function App() {
  const { theme, themeName } = useTheme();

  const appContainerStyle = {
    minHeight: '100vh',
    background: theme.background,
    color: theme.textPrimary,
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", sans-serif',
    transition: 'background 0.3s ease, color 0.3s ease',
  };

  const globalStyles = `
    body {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      background-color: ${theme.background};
      color: ${theme.textPrimary};
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    * {
      box-sizing: border-box;
    }
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: ${theme.backgroundAlt};
    }
    ::-webkit-scrollbar-thumb {
      background: ${theme.border};
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: ${theme.textSecondary};
    }
  `;

  return (
    <div style={appContainerStyle}>
      <style>{globalStyles}</style>
      <NavBar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={['Admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={['Customer']} />}>
              <Route path="/customer" element={<CustomerDashboard />} />
            </Route>
          </Route>
        </Routes>
      </main>
      <DebugPanel />
    </div>
  );
}

export default App;
