import React, { useState, useEffect } from 'react';
import { api } from '../api/services';
import { useTheme } from '../hooks/useTheme';
import Pagination from './Pagination';

const AdminProducts = () => {
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };
  
  // Pagination & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Image management state
  const [existingImages, setExistingImages] = useState([]);
  const [primaryImageUrl, setPrimaryImageUrl] = useState('');
  const [imagesToDelete, setImagesToDelete] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    files: null
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.catalog.getProducts(1, 1000); // Fetch bulk for admin local pagination
      const items = res.data?.data || res.data?.products || res.data || [];
      setProducts(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.catalog.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      showToast('Product deleted successfully', 'success');
    } catch (err) {
      showToast('Failed to delete product: ' + (err.message || 'Unknown error'), 'error');
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        category: product.category?.join(', ') || '',
        description: product.description || '',
        price: product.price || '',
        files: null
      });
      
      const images = product.images || product.existingImages || [];
      setExistingImages(images);
      
      const primaryImg = images.find(img => img.isPrimary);
      setPrimaryImageUrl(primaryImg ? primaryImg.url : '');
      setImagesToDelete([]);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: '',
        description: '',
        price: '',
        files: null
      });
      setExistingImages([]);
      setPrimaryImageUrl('');
      setImagesToDelete([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'files') {
      setFormData({ ...formData, [name]: files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const data = new FormData();
      data.append('Name', formData.name);
      data.append('Category', formData.category);
      data.append('Description', formData.description);
      data.append('Price', formData.price);
      
      if (editingProduct) {
        data.append('Id', editingProduct.id);
        if (formData.files && formData.files.length > 0) {
          for (let i = 0; i < formData.files.length; i++) {
            data.append('NewFiles', formData.files[i]);
          }
        }
        
        if (imagesToDelete.length > 0) {
          imagesToDelete.forEach(url => data.append('ImagesToDelete', url));
        }
        
        if (primaryImageUrl) {
          data.append('PrimaryImageUrl', primaryImageUrl);
        }
        
        await api.catalog.updateProduct(data);
        showToast('Product updated successfully', 'success');
      } else {
        if (formData.files && formData.files.length > 0) {
          for (let i = 0; i < formData.files.length; i++) {
            data.append('Files', formData.files[i]);
          }
        }
        data.append('PrimaryImageIndex', 0);
        await api.catalog.createProduct(data);
        showToast('Product created successfully', 'success');
      }
      
      handleCloseModal();
      fetchProducts();
    } catch (err) {
      showToast(`Failed to save product: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Styles
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1.5rem',
    background: theme.backgroundAlt,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: theme.shadow,
    tableLayout: 'fixed'
  };

  const thStyle = (width) => ({
    padding: '1rem',
    textAlign: 'left',
    background: theme.backgroundCard,
    color: theme.textSecondary,
    borderBottom: `1px solid ${theme.border}`,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: '0.85rem',
    letterSpacing: '0.05em',
    width: width || 'auto'
  });

  const tdStyle = {
    padding: '1rem',
    borderBottom: `1px solid ${theme.border}`,
    color: theme.textPrimary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    verticalAlign: 'middle'
  };

  const btnStyle = (type) => ({
    padding: '0.4rem 0.8rem',
    background: type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
    color: type === 'danger' ? '#ef4444' : '#818cf8',
    border: `1px solid ${type === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  const inputStyle = {
    width: '100%',
    padding: '0.8rem',
    marginBottom: '1rem',
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    background: theme.backgroundAlt,
    color: theme.textPrimary,
    boxSizing: 'border-box'
  };

  const getImageUrl = (imageFile) => {
    if (!imageFile) return '';
    return imageFile.startsWith('http') ? imageFile : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/images/${imageFile}`;
  };

  const getDefaultImage = (product) => {
    if (product?.images && product.images.length > 0) {
      const primary = product.images.find(img => img.isPrimary);
      const url = primary ? primary.url : product.images[0].url;
      return getImageUrl(url);
    }
    return getImageUrl(product?.imageFile);
  };

  // Local Search & Pagination logic
  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    return p.name?.toLowerCase().includes(lowerQ) || p.description?.toLowerCase().includes(lowerQ);
  });

  const totalCount = filteredProducts.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const validPage = Math.min(currentPage, totalPages);
  
  const displayedProducts = filteredProducts.slice((validPage - 1) * pageSize, validPage * pageSize);

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: theme.textPrimary, margin: '0 0 0.25rem 0' }}>Product Management</h2>
          <p style={{ color: theme.textSecondary, margin: 0, fontSize: '0.9rem' }}>Manage your catalog, pricing, and images.</p>
        </div>
        <button 
          style={{
            ...btnStyle('primary'), 
            background: theme.primaryGradient || theme.primary, 
            color: '#fff', 
            border: 'none',
            padding: '0.75rem 1.25rem',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
          }} 
          onClick={() => handleOpenModal()}
        >
          + Add New Product
        </button>
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Search by name or description..." 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          style={{ ...inputStyle, marginBottom: 0, maxWidth: '400px' }}
        />
      </div>

      {loading ? (
        <p style={{ color: theme.textSecondary }}>Loading products...</p>
      ) : error ? (
        <p style={{ color: theme.error }}>{error}</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle('80px')}>Image</th>
              <th style={thStyle('30%')}>Name</th>
              <th style={thStyle('25%')}>Category</th>
              <th style={thStyle('15%')}>Price</th>
              <th style={thStyle('150px')}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedProducts.map(product => (
              <tr key={product.id} style={{ transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                <td style={tdStyle}>
                  {getDefaultImage(product) ? (
                    <img 
                      src={getDefaultImage(product)} 
                      alt={product.name} 
                      style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${theme.border}`, display: 'block' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{ 
                    display: getDefaultImage(product) ? 'none' : 'flex',
                    width: '44px', height: '44px', background: theme.backgroundCard, borderRadius: '8px', 
                    alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', 
                    border: `1px solid ${theme.border}`, color: theme.textSecondary 
                  }}>
                    📦
                  </div>
                </td>
                <td style={{ ...tdStyle, fontWeight: '600' }} title={product.name}>{product.name}</td>
                <td style={tdStyle} title={product.category?.join(', ')}>
                  <span style={{ background: theme.backgroundCard, padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', border: `1px solid ${theme.border}` }}>
                    {product.category?.[0] || 'Uncategorized'}
                  </span>
                  {product.category?.length > 1 && <span style={{ marginLeft: '0.5rem', color: theme.textSecondary, fontSize: '0.75rem' }}>+{product.category.length - 1}</span>}
                </td>
                <td style={{ ...tdStyle, color: theme.primary, fontWeight: '700' }}>${Number(product.price || 0).toFixed(2)}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button style={btnStyle('primary')} onClick={() => handleOpenModal(product)} title="Edit">
                      ✎ Edit
                    </button>
                    <button style={btnStyle('danger')} onClick={() => handleDelete(product.id)} title="Delete">
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {displayedProducts.length === 0 && (
              <tr>
                <td colSpan="5" style={{ ...tdStyle, textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {!loading && !error && displayedProducts.length > 0 && (
        <Pagination 
          currentPage={validPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div 
          onClick={handleCloseModal}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: theme.backgroundCard, padding: '2rem', borderRadius: '16px',
              width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', 
              boxShadow: theme.shadow, border: `1px solid ${theme.border}`
            }}
          >
            <h2 style={{ color: theme.textPrimary, marginTop: 0 }}>
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </h2>
            <form onSubmit={handleSubmit}>
              <label style={{ color: theme.textSecondary, fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} />

              <label style={{ color: theme.textSecondary, fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>Category (comma separated)</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} required style={inputStyle} placeholder="e.g. Laptops, Electronics" />

              <label style={{ color: theme.textSecondary, fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />

              <label style={{ color: theme.textSecondary, fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>Price</label>
              <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required style={inputStyle} />

              {editingProduct && existingImages.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ color: theme.textSecondary, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                    Manage Existing Images
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                    {existingImages.map((img, idx) => {
                      const isDeleted = imagesToDelete.includes(img.url);
                      return (
                        <div key={idx} style={{ 
                          border: `1px solid ${isDeleted ? theme.error : theme.border}`, 
                          borderRadius: '8px', 
                          padding: '0.5rem',
                          background: theme.backgroundAlt,
                          opacity: isDeleted ? 0.6 : 1
                        }}>
                          <img src={img.url} alt="Product" style={{ width: '100%', height: '80px', objectFit: 'contain', marginBottom: '0.5rem' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: theme.textPrimary }}>
                              <input 
                                type="radio" 
                                name="primaryImage" 
                                checked={primaryImageUrl === img.url}
                                disabled={isDeleted}
                                onChange={() => setPrimaryImageUrl(img.url)}
                              />
                              Primary
                            </label>
                            <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: theme.error }}>
                              <input 
                                type="checkbox" 
                                checked={isDeleted}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setImagesToDelete([...imagesToDelete, img.url]);
                                    if (primaryImageUrl === img.url) setPrimaryImageUrl('');
                                  } else {
                                    setImagesToDelete(imagesToDelete.filter(url => url !== img.url));
                                  }
                                }}
                              />
                              Delete
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <label style={{ color: theme.textSecondary, fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>
                {editingProduct ? 'Upload Additional Images (Optional)' : 'Upload Images'}
              </label>
              <input type="file" name="files" multiple onChange={handleChange} style={{ ...inputStyle, padding: '0.5rem' }} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  style={{ ...btnStyle('danger'), background: 'transparent', color: theme.textSecondary, border: `1px solid ${theme.border}` }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#ef4444'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.textSecondary; e.currentTarget.style.borderColor = theme.border; }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={btnStyle('primary')} 
                  disabled={saving}
                  onMouseOver={(e) => { if (!saving) { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#10b981'; } }}
                  onMouseOut={(e) => { if (!saving) { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'; e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)'; } }}
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: toast.type === 'error' ? theme.error : (theme.success || '#10b981'),
          color: '#ffffff',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <span style={{ fontSize: '1.2rem', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {toast.type === 'error' ? '!' : '✓'}
          </span>
          <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{toast.message}</span>
        </div>
      )}

      <style>{`
        @keyframes toastSlideIn {
          0% { transform: translateX(120%) scale(0.9); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AdminProducts;
