import React, { useState, useEffect } from 'react';
import { api } from '../api/services';
import { useTheme } from '../hooks/useTheme';
import Pagination from './Pagination';
import { Package, Clock, CheckCircle, XCircle, FileText, X, Eye, Edit, Trash2, Copy, DollarSign, Activity, Check } from 'lucide-react';

const AdminOrders = () => {
  const { theme } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('2');
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const STATUS_MAP = {
    1: 'Draft', 2: 'Pending', 3: 'Accepted', 4: 'Completed', 5: 'Cancelled',
    'draft': 'Draft', 'pending': 'Pending', 'accepted': 'Accepted', 'completed': 'Completed', 'cancelled': 'Cancelled'
  };
  
  const getStatusLabel = (status) => STATUS_MAP[String(status).toLowerCase()] || 'Pending';
  
  const getStatusEnumInt = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'draft' || s === '1') return 1;
    if (s === 'pending' || s === '2') return 2;
    if (s === 'accepted' || s === '3') return 3;
    if (s === 'completed' || s === '4') return 4;
    if (s === 'cancelled' || s === '5') return 5;
    return 2;
  };

  // Search, Filter, Sort, Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Toast state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.ordering.getOrders(0, 1000); // Bulk fetch for local filtering, PageIndex=0 is the first page for orders API
      const items = res.data?.Orders || res.data?.orders || res.data?.data || res.data || [];
      setOrders(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setSaving(true);
      
      const orderId = selectedOrder.Id || selectedOrder.id;
      const enumString = getStatusLabel(newStatus); // Converts "3" to "Accepted" or just keeps "Accepted" if it's already string

      await api.ordering.updateOrderStatus(orderId, enumString);
      showToast('Order status updated successfully', 'success');
      
      await fetchOrders(); // invalidate and refetch instantly
      setIsStatusModalOpen(false);
    } catch (err) {
      showToast('Failed to update status: ' + (err.response?.data?.detail || err.message || 'Unknown error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setSaving(true);
      const orderId = order.Id || order.id;
      await api.ordering.updateOrderStatus(orderId, "Cancelled");
      showToast('Order cancelled successfully', 'success');
      await fetchOrders();
    } catch (err) {
      showToast('Failed to cancel order: ' + (err.response?.data?.detail || err.message || 'Unknown error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (rawStatus) => {
    const status = getStatusLabel(rawStatus).toLowerCase();
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} color={theme.success} />;
      case 'accepted':
        return <Package size={16} color={theme.primary} />;
      case 'pending':
        return <Clock size={16} color={theme.warning} />;
      case 'cancelled':
        return <XCircle size={16} color={theme.danger} />;
      default:
        return <Package size={16} color={theme.textSecondary} />;
    }
  };

  const getStatusStyle = (rawStatus) => {
    const status = getStatusLabel(rawStatus).toLowerCase();
    let color, bg, border;
    switch (status) {
      case 'completed':
        color = theme.success; bg = 'rgba(34, 197, 94, 0.1)'; border = theme.success; break;
      case 'pending':
      case 'draft':
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
      fontSize: '0.8rem',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      textTransform: 'capitalize',
      boxShadow: `0 0 10px ${bg}`
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Local Search & Pagination logic
  let processedOrders = orders.filter(o => {
    // Status Filter
    const oStatus = getStatusLabel(o.Status || o.status).toLowerCase();
    if (statusFilter !== 'All' && oStatus !== statusFilter.toLowerCase()) return false;

    // Search Query (ID, Order Name, Customer Id, Email, Name)
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    const orderId = String(o.Id || o.id || '').toLowerCase();
    const orderName = String(o.OrderName || o.orderName || '').toLowerCase();
    const customerId = String(o.CustomerId || o.customerId || '').toLowerCase();
    const shipping = o.ShippingAddress || o.shippingAddress || {};
    const firstName = String(shipping.FirstName || shipping.firstName || '').toLowerCase();
    const lastName = String(shipping.LastName || shipping.lastName || '').toLowerCase();
    const email = String(shipping.EmailAddress || shipping.emailAddress || '').toLowerCase();
    
    return orderId.includes(lowerQ) || orderName.includes(lowerQ) || customerId.includes(lowerQ) || firstName.includes(lowerQ) || lastName.includes(lowerQ) || email.includes(lowerQ);
  });

  // Sorting
  processedOrders = processedOrders.sort((a, b) => {
    if (sortField === 'date') {
      const dateA = new Date(a.CreatedAt || a.createdAt || a.OrderDate || a.orderDate || 0).getTime();
      const dateB = new Date(b.CreatedAt || b.createdAt || b.OrderDate || b.orderDate || 0).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'price') {
      const priceA = a.TotalPrice || a.totalPrice || a.Total || a.total || 0;
      const priceB = b.TotalPrice || b.totalPrice || b.Total || b.total || 0;
      return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
    }
    return 0;
  });

  const totalCount = processedOrders.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const validPage = Math.min(currentPage, totalPages);
  
  const displayedOrders = processedOrders.slice((validPage - 1) * pageSize, validPage * pageSize);

  // Metrics
  const totalRevenue = processedOrders.reduce((sum, o) => {
    let t = o.TotalPrice || o.totalPrice || o.Total || o.total || 0;
    if (t === 0 && (o.OrderItems || o.orderItems)) {
      t = (o.OrderItems || o.orderItems).reduce((s, i) => s + ((i.Quantity || i.quantity || 0) * (i.Price || i.price || 0)), 0);
    }
    return sum + t;
  }, 0);
  const pendingCount = processedOrders.filter(o => getStatusLabel(o.Status || o.status).toLowerCase() === 'pending').length;

  const handleCopy = (e, text) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Styles
  const tableStyle = {
    width: '100%', borderCollapse: 'collapse', marginTop: '1.5rem',
    background: theme.backgroundAlt, borderRadius: '12px', overflow: 'hidden',
    boxShadow: theme.shadow
  };
  const thStyle = {
    padding: '1rem', textAlign: 'left', background: theme.backgroundCard,
    color: theme.textSecondary, borderBottom: `1px solid ${theme.border}`,
    fontWeight: '700', textTransform: 'uppercase', fontSize: '0.85rem',
    cursor: 'pointer', userSelect: 'none'
  };
  const tdStyle = {
    padding: '1rem', borderBottom: `1px solid ${theme.border}`,
    color: theme.textPrimary, verticalAlign: 'middle', fontSize: '0.95rem'
  };
  const btnStyle = (type) => ({
    padding: '0.4rem 0.8rem',
    background: type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)',
    color: type === 'danger' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#818cf8',
    border: `1px solid ${type === 'danger' ? 'rgba(239, 68, 68, 0.2)' : type === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
    borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem',
    transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'
  });
  
  const iconBtnStyle = (type) => ({
    background: type === 'danger' ? 'rgba(239, 68, 68, 0.05)' : type === 'warning' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(99, 102, 241, 0.05)',
    border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer',
    color: type === 'danger' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#818cf8',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease'
  });

  const inputStyle = {
    padding: '0.85rem 1.2rem', borderRadius: '10px', border: `1px solid ${theme.border}`,
    background: theme.backgroundCard, color: theme.textPrimary, boxSizing: 'border-box',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', fontSize: '0.95rem'
  };

  const metricCardStyle = {
    flex: '1 1 200px', background: theme.backgroundCard, padding: '1.5rem',
    borderRadius: '12px', border: `1px solid ${theme.border}`, boxShadow: theme.shadow,
    display: 'flex', alignItems: 'center', gap: '1rem'
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div style={{ margin: 0, padding: 0, animation: 'fadeIn 0.3s ease-out' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
        @keyframes toastSlideIn { 0% { transform: translateX(120%) scale(0.9); opacity: 0; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
        .order-row:hover { background: rgba(255,255,255,0.03); }
        .icon-btn:hover { transform: scale(1.05); filter: brightness(1.2); }
        .search-input:focus { border-color: ${theme.primary} !important; box-shadow: 0 0 0 2px rgba(99,102,241,0.2) !important; }
      `}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: theme.textPrimary, margin: '0 0 0.25rem 0', fontSize: '2rem', fontWeight: '800' }}>Orders Dashboard</h2>
          <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.95rem' }}>View, track, and manage all customer transactions.</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={metricCardStyle}>
          <div style={{ background: 'rgba(99,102,241,0.1)', padding: '1rem', borderRadius: '12px' }}><Package size={28} color="#818cf8" /></div>
          <div>
            <div style={{ color: theme.textSecondary, fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Total Orders</div>
            <div style={{ color: theme.textPrimary, fontSize: '1.75rem', fontWeight: '700' }}>{processedOrders.length}</div>
          </div>
        </div>
        <div style={metricCardStyle}>
          <div style={{ background: 'rgba(34,197,94,0.1)', padding: '1rem', borderRadius: '12px' }}><DollarSign size={28} color="#22c55e" /></div>
          <div>
            <div style={{ color: theme.textSecondary, fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Total Revenue</div>
            <div style={{ color: theme.textPrimary, fontSize: '1.75rem', fontWeight: '700' }}>{formatCurrency(totalRevenue)}</div>
          </div>
        </div>
        <div style={metricCardStyle}>
          <div style={{ background: 'rgba(245,158,11,0.1)', padding: '1rem', borderRadius: '12px' }}><Activity size={28} color="#f59e0b" /></div>
          <div>
            <div style={{ color: theme.textSecondary, fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Pending Orders</div>
            <div style={{ color: theme.textPrimary, fontSize: '1.75rem', fontWeight: '700' }}>{pendingCount}</div>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', background: theme.backgroundAlt, padding: '1rem', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
        <input 
          type="text" 
          placeholder="Search by ID, Name, Customer, or Email..." 
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          style={{ ...inputStyle, flex: 1, minWidth: '300px' }}
          className="search-input"
        />
        <select 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          style={{ ...inputStyle, width: '200px' }}
          className="search-input"
        >
          <option value="All">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: '60px', background: theme.backgroundAlt, borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} />)}
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', textAlign: 'center' }}>
          {error}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Order details</th>
                <th style={thStyle} onClick={() => handleSort('date')}>
                  Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={thStyle} onClick={() => handleSort('price')}>
                  Total {sortField === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedOrders.map(order => {
                const id = order.Id || order.id || '';
                const orderName = order.OrderName || order.orderName || 'Order';
                const status = order.Status || order.status || 'Pending';
                const dateStr = order.CreatedAt || order.createdAt || order.OrderDate || order.orderDate;
                
                let total = order.TotalPrice || order.totalPrice || order.Total || order.total || 0;
                if (total === 0 && (order.OrderItems || order.orderItems)) {
                  total = (order.OrderItems || order.orderItems).reduce((sum, item) => sum + ((item.Quantity || item.quantity || 0) * (item.Price || item.price || 0)), 0);
                }

                return (
                  <tr key={id} className="order-row" style={{ transition: 'background 0.2s', borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ ...tdStyle, padding: '1.25rem 1rem' }}>
                      <div style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '0.25rem' }}>{orderName}</div>
                      <div 
                        onClick={(e) => handleCopy(e, id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace', color: theme.textSecondary, cursor: 'pointer', border: `1px solid ${theme.border}` }}
                        title="Click to copy ID"
                      >
                        {id.substring(0, 13)}... {copiedId === id ? <Check size={12} color={theme.success} /> : <Copy size={12} />}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: '500' }}>{formatDate(dateStr)}</span>
                    </td>
                    <td style={{ ...tdStyle, color: theme.textPrimary, fontWeight: '700', fontSize: '1.05rem' }}>{formatCurrency(total)}</td>
                    <td style={tdStyle}>
                      <span style={getStatusStyle(status)}>
                        {getStatusIcon(status)}
                        {getStatusLabel(status)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button className="icon-btn" style={iconBtnStyle('primary')} onClick={() => { setSelectedOrder(order); setIsDetailsModalOpen(true); }} title="View Details">
                          <Eye size={18} />
                        </button>
                        <button className="icon-btn" style={iconBtnStyle('warning')} onClick={() => { setSelectedOrder(order); setNewStatus(getStatusLabel(status)); setIsStatusModalOpen(true); }} title="Update Status">
                          <Edit size={18} />
                        </button>
                        {getStatusLabel(status).toLowerCase() !== 'cancelled' && (
                          <button className="icon-btn" style={iconBtnStyle('danger')} onClick={() => handleCancelOrder(order)} title="Cancel Order">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {displayedOrders.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ ...tdStyle, textAlign: 'center', padding: '3rem', color: theme.textSecondary }}>
                    No orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && displayedOrders.length > 0 && (
        <Pagination 
          currentPage={validPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && selectedOrder && (
        <div 
          onClick={() => setIsDetailsModalOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(5px)' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ background: theme.backgroundCard, padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: `1px solid ${theme.border}` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: `1px solid ${theme.border}`, paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ color: theme.textPrimary, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {selectedOrder.OrderName || selectedOrder.orderName}
                  <span style={getStatusStyle(selectedOrder.Status || selectedOrder.status)}>
                    {getStatusIcon(selectedOrder.Status || selectedOrder.status)}
                    {getStatusLabel(selectedOrder.Status || selectedOrder.status)}
                  </span>
                </h2>
                <div style={{ color: theme.textSecondary, fontFamily: 'monospace', fontSize: '0.9rem' }}>ID: {selectedOrder.Id || selectedOrder.id}</div>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: theme.textSecondary, cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ color: theme.textPrimary, fontSize: '1.1rem', marginBottom: '1rem', borderBottom: `1px solid ${theme.border}`, paddingBottom: '0.5rem' }}>Customer & Shipping</h3>
                <div style={{ color: theme.textSecondary, fontSize: '0.95rem', lineHeight: '1.6' }}>
                  <strong>Customer ID:</strong> <span style={{ fontFamily: 'monospace' }}>{(selectedOrder.CustomerId || selectedOrder.customerId)?.substring(0,18)}...</span><br/>
                  <strong>Address:</strong><br/>
                  {(selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.FirstName} {(selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.LastName}<br/>
                  {(selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.AddressLine}<br/>
                  {(selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.State}, {(selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.Country} {(selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.ZipCode}<br/>
                  {(selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.EmailAddress}
                </div>
              </div>
              <div>
                <h3 style={{ color: theme.textPrimary, fontSize: '1.1rem', marginBottom: '1rem', borderBottom: `1px solid ${theme.border}`, paddingBottom: '0.5rem' }}>Payment Info</h3>
                <div style={{ color: theme.textSecondary, fontSize: '0.95rem', lineHeight: '1.6' }}>
                  <strong>Card Name:</strong> {(selectedOrder.Payment || selectedOrder.payment)?.CardName}<br/>
                  <strong>Card Number:</strong> **** **** **** {(selectedOrder.Payment || selectedOrder.payment)?.CardNumber?.slice(-4) || '****'}<br/>
                  <strong>Expiration:</strong> {(selectedOrder.Payment || selectedOrder.payment)?.Expiration}<br/>
                  <strong>Method:</strong> {(selectedOrder.Payment || selectedOrder.payment)?.PaymentMethod === 1 ? 'Credit Card' : 'Other'}<br/>
                  <strong>Order Date:</strong> {formatDate(selectedOrder.CreatedAt || selectedOrder.createdAt || selectedOrder.OrderDate || selectedOrder.orderDate)}
                </div>
              </div>
            </div>

            <h3 style={{ color: theme.textPrimary, fontSize: '1.1rem', marginBottom: '1rem', borderBottom: `1px solid ${theme.border}`, paddingBottom: '0.5rem' }}>Ordered Items</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {(selectedOrder.OrderItems || selectedOrder.orderItems || []).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.backgroundAlt, padding: '1rem', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: theme.backgroundCard, padding: '0.5rem', borderRadius: '8px' }}><Package size={24} color={theme.textSecondary} /></div>
                    <div>
                      <div style={{ color: theme.textPrimary, fontWeight: '600', fontSize: '1.05rem' }}>{item.ProductName || item.productName || item.product?.name || `Product`}</div>
                      <div style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>Qty: {item.Quantity || item.quantity} &times; {formatCurrency(item.Price || item.price)}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: '700', color: theme.primary, fontSize: '1.1rem' }}>
                    {formatCurrency((item.Quantity || item.quantity) * (item.Price || item.price))}
                  </div>
                </div>
              ))}
              {(selectedOrder.OrderItems || selectedOrder.orderItems || []).length === 0 && (
                <div style={{ color: theme.textSecondary, fontStyle: 'italic', padding: '1rem' }}>No items in this order.</div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: theme.backgroundAlt, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
              <span style={{ color: theme.textSecondary, fontSize: '1.1rem', fontWeight: '600' }}>Total Amount</span>
              <span style={{ color: theme.primary, fontSize: '1.75rem', fontWeight: '800' }}>
                {formatCurrency(selectedOrder.TotalPrice || selectedOrder.totalPrice || selectedOrder.Total || selectedOrder.total || ((selectedOrder.OrderItems || selectedOrder.orderItems || []).reduce((sum, item) => sum + ((item.Quantity || item.quantity || 0) * (item.Price || item.price || 0)), 0)))}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button onClick={() => setIsDetailsModalOpen(false)} style={{ ...btnStyle('primary'), background: theme.backgroundCard, border: `1px solid ${theme.border}`, color: theme.textPrimary }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {isStatusModalOpen && selectedOrder && (
        <div 
          onClick={() => setIsStatusModalOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(5px)' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ background: theme.backgroundCard, padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: `1px solid ${theme.border}` }}
          >
            <h2 style={{ color: theme.textPrimary, margin: '0 0 1rem 0' }}>Update Status</h2>
            <p style={{ color: theme.textSecondary, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Change the status for order <strong>{selectedOrder.OrderName || selectedOrder.orderName}</strong>.
            </p>
            <form onSubmit={handleUpdateStatus}>
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
                style={{ ...inputStyle, width: '100%', marginBottom: '2rem' }}
                required
                disabled={saving}
              >
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setIsStatusModalOpen(false)} style={{ ...btnStyle('danger'), background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textSecondary }} disabled={saving}>Cancel</button>
                <button type="submit" style={{ ...btnStyle('primary'), background: theme.primaryGradient || theme.primary, color: '#fff', border: 'none' }} disabled={saving}>
                  {saving ? (
                     <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <Activity size={16} className="spinner" /> Updating...
                     </span>
                  ) : 'Confirm Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          background: toast.type === 'error' ? theme.error : (theme.success || '#10b981'), color: '#ffffff',
          padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 11000, display: 'flex', alignItems: 'center', gap: '0.75rem',
          animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <span style={{ fontSize: '1.2rem', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {toast.type === 'error' ? '!' : '✓'}
          </span>
          <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
