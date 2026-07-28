import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/services';
import { useTheme } from '../hooks/useTheme';
import { Package, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, ShoppingBag, Calendar, DollarSign, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import ErrorBoundary from '../components/ErrorBoundary';

const OrdersHistoryContent = () => {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const itemsPerPage = 5;

  const handleCopyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const response = await api.ordering.getMyOrders();
      return response.data.Orders || response.data.orders || [];
    }
  });

  if (isError) {
    return (
      <div style={{ padding: '3rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center', color: theme.danger }}>
        <XCircle size={48} style={{ marginBottom: '1rem', color: theme.danger }} />
        <h2 style={{ color: theme.danger }}>Error Loading Orders</h2>
        <p>{error?.message || 'Something went wrong while fetching your order history.'}</p>
      </div>
    );
  }

  const getStatusIcon = (rawStatus) => {
    const status = String(rawStatus || 'Pending').toLowerCase();
    switch(status) {
      case 'completed':
      case 'delivered':
        return <CheckCircle size={20} color={theme.success} />;
      case 'pending':
        return <Clock size={20} color={theme.warning} />;
      case 'cancelled':
        return <XCircle size={20} color={theme.danger} />;
      default:
        return <Package size={20} color={theme.primary} />;
    }
  };

  const getStatusStyle = (rawStatus) => {
    const status = String(rawStatus || 'Pending').toLowerCase();
    let color, bg, border;
    switch(status) {
      case 'completed':
      case 'delivered':
        color = theme.success; bg = 'rgba(34, 197, 94, 0.1)'; border = theme.success; break;
      case 'pending':
        color = theme.warning; bg = 'rgba(245, 158, 11, 0.1)'; border = theme.warning; break;
      case 'cancelled':
        color = theme.danger; bg = 'rgba(239, 68, 68, 0.1)'; border = theme.danger; break;
      default:
        color = theme.primary; bg = 'rgba(59, 130, 246, 0.1)'; border = theme.primary; break;
    }
    return {
      color,
      backgroundColor: bg,
      border: `1px solid ${border}`,
      padding: '0.35rem 0.85rem',
      borderRadius: '2rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      textTransform: 'capitalize'
    };
  };

  const orders = Array.isArray(data) ? data : [];
  const totalPages = Math.ceil(orders.length / itemsPerPage) || 1;
  const currentOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const containerStyle = {
    padding: '3rem',
    maxWidth: '1000px',
    margin: '0 auto',
    color: theme.textPrimary,
    minHeight: '80vh',
    animation: 'fadeIn 0.4s ease-out'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    borderBottom: `2px solid ${theme.border}`,
    paddingBottom: '1rem'
  };

  const cardStyle = {
    background: theme.backgroundCard,
    borderRadius: '16px',
    padding: '1.5rem',
    border: `1px solid ${theme.border}`,
    boxShadow: theme.shadow,
    marginBottom: '1.5rem',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
          .order-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
          .pagination-btn { transition: all 0.2s; }
          .pagination-btn:hover:not(:disabled) { background: ${theme.primary} !important; color: #fff !important; }
          .pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        `}
      </style>
      
      <div style={headerStyle}>
        <ShoppingBag size={36} color={theme.primary} />
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', color: theme.textPrimary }}>My Order History</h1>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ ...cardStyle, height: '180px', background: theme.backgroundAlt, animation: 'pulse 1.5s infinite ease-in-out' }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: theme.backgroundCard, borderRadius: '16px', border: `2px dashed ${theme.border}` }}>
          <Package size={72} color={theme.textSecondary} style={{ marginBottom: '1.5rem', opacity: 0.4 }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '0.75rem', fontSize: '2rem' }}>No orders yet</h2>
          <p style={{ color: theme.textSecondary, fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>
            Looks like you haven't made any purchases yet. Explore our products and start shopping!
          </p>
        </div>
      ) : (
        <div>
          {currentOrders.map(order => {
            const id = order.Id || order.id || '';
            const orderName = order.OrderName || order.orderName || '';
            const status = order.Status || order.status || 'Pending';
            const dateStr = order.CreatedAt || order.createdAt || order.OrderDate || order.orderDate;
            const items = order.OrderItems || order.orderItems || [];
            
            let calculatedTotal = 0;
            if (items && items.length > 0) {
              calculatedTotal = items.reduce((sum, item) => {
                const itemQty = item.Quantity || item.quantity || 0;
                const itemPrice = item.Price || item.price || 0;
                return sum + (itemQty * itemPrice);
              }, 0);
            }
            
            let total = order.TotalPrice || order.totalPrice || order.Total || order.total || 0;
            if (total === 0) {
              total = calculatedTotal;
            }
            
            const displayTitle = orderName || (id ? `Order #${id.substring(0, 8).toUpperCase()}` : 'Order #UNKNOWN');
            
            return (
            <div key={id || Math.random()} className="order-card" style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: `1px solid ${theme.border}`, paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem' }}>
                    {orderName || 'Order'}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', background: theme.backgroundAlt, border: `1px solid ${theme.border}`, borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'monospace', color: theme.textSecondary }}>
                      #{id.substring(0, 8).toUpperCase()}
                      <button
                        onClick={() => handleCopyOrderId(id)}
                        title="Copy Full ID"
                        style={{ background: 'transparent', border: 'none', color: copiedOrderId === id ? '#10b981' : theme.textSecondary, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                      >
                        {copiedOrderId === id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </span>
                  </h3>
                  <div style={{ display: 'flex', gap: '1.5rem', color: theme.textSecondary, fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={16} /> {formatDate(dateStr)}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', fontSize: '1.25rem', color: theme.textPrimary }}>
                    <DollarSign size={20} /> {formatCurrency(total)}
                  </div>
                  <div style={getStatusStyle(status)}>
                    {getStatusIcon(status)}
                    {String(status)}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 style={{ margin: '0 0 1rem 0', color: theme.textPrimary, fontSize: '1.1rem', fontWeight: '600' }}>Order Items</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {items.map((item, idx) => {
                    const itemName = item.ProductName || item.productName || item.product?.name || `Product #${(item.ProductId || item.productId || '').substring(0,6)}`;
                    const itemQty = item.Quantity || item.quantity || 0;
                    const itemPrice = item.Price || item.price || 0;
                    
                    return (
                    <div key={idx} style={{ display: 'flex', gap: '1rem', background: theme.backgroundAlt, padding: '0.75rem', borderRadius: '10px', alignItems: 'center', border: `1px solid ${theme.border}` }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '8px', background: theme.background, border: `1px solid ${theme.border}`, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {(item.pictureUrl || item.imageUrl || item.product?.imageFile) ? (
                           <img src={(item.pictureUrl || item.imageUrl || item.product?.imageFile).startsWith('http') ? (item.pictureUrl || item.imageUrl || item.product?.imageFile) : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/images/${(item.pictureUrl || item.imageUrl || item.product?.imageFile)}`} alt={itemName} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f9fafb' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                           <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textSecondary, background: '#f9fafb' }}>
                             <Package size={24} />
                           </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '600', fontSize: '1rem', color: theme.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                           {itemName}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: theme.textSecondary, marginTop: '0.25rem', fontWeight: '500' }}>
                          Qty: {itemQty} &times; {formatCurrency(itemPrice)}
                        </div>
                      </div>
                    </div>
                  )})}
                  {items.length === 0 && (
                    <div style={{ color: theme.textSecondary, fontStyle: 'italic' }}>No items found for this order.</div>
                  )}
                </div>
              </div>
              
            </div>
          )})}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ background: theme.backgroundCard, border: `1px solid ${theme.border}`, color: theme.textPrimary, padding: '0.6rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
              >
                <ChevronLeft size={22} />
              </button>
              <span style={{ fontWeight: '600', color: theme.textPrimary, fontSize: '1.1rem' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ background: theme.backgroundCard, border: `1px solid ${theme.border}`, color: theme.textPrimary, padding: '0.6rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
              >
                <ChevronRight size={22} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const OrdersHistory = () => (
  <ErrorBoundary>
    <OrdersHistoryContent />
  </ErrorBoundary>
);

export default OrdersHistory;
