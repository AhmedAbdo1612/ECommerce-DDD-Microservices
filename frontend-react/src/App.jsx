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
import { Toaster } from 'react-hot-toast';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrdersHistory from './pages/OrdersHistory';

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
          <Route path="/cart" element={<Cart />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<RoleRoute allowedRoles={['Admin']} />}>
              <Route index element={<AdminDashboard />} />
            </Route>
            <Route path="/customer" element={<RoleRoute allowedRoles={['Customer']} />}>
              <Route index element={<CustomerDashboard />} />
              <Route path="orders" element={<OrdersHistory />} />
            </Route>
          </Route>
        </Routes>
      </main>
      <Toaster position="bottom-right" />
      <DebugPanel />
    </div>
  );
}

export default App;
