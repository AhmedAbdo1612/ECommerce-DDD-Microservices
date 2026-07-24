import React from 'react';
import { useProducts } from '../hooks/useProducts';
import { useTheme } from '../hooks/useTheme';

const ProductList = () => {
  const { products, loading, error } = useProducts();
  const { theme } = useTheme();

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '2rem',
    marginTop: '2rem'
  };

  const cardStyle = {
    background: theme.backgroundCard,
    borderRadius: '12px',
    border: `1px solid ${theme.border}`,
    overflow: 'hidden',
    boxShadow: theme.shadow,
    transition: 'transform 0.2s',
    display: 'flex',
    flexDirection: 'column'
  };

  const imagePlaceholderStyle = {
    height: '200px',
    background: theme.backgroundAlt,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.textSecondary,
    borderBottom: `1px solid ${theme.border}`
  };

  const contentStyle = {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1
  };

  const nameStyle = {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '600',
    color: theme.textPrimary
  };

  const priceStyle = {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '700',
    color: theme.primary
  };

  const buttonStyle = {
    marginTop: 'auto',
    padding: '0.75rem',
    background: theme.primaryGradient,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer'
  };

  if (loading) return <div style={{ color: theme.textPrimary }}>Loading products...</div>;
  if (error) return <div style={{ color: theme.error }}>{error}</div>;
  if (!products || products.length === 0) return <div style={{ color: theme.textSecondary }}>No products found.</div>;

  return (
    <div style={gridStyle}>
      {products.map((product) => (
        <div 
          key={product.id} 
          style={cardStyle}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; }}
        >
          {/* Display product image if we have URL, else placeholder */}
          <div style={imagePlaceholderStyle}>
            {product.imageFile ? (
              <img 
                src={product.imageFile.startsWith('http') ? product.imageFile : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/images/${product.imageFile}`} 
                alt={product.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div style={{ display: product.imageFile ? 'none' : 'flex' }}>
              No Image
            </div>
          </div>
          
          <div style={contentStyle}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: theme.textSecondary }}>
              {product.category?.[0] || 'Uncategorized'}
            </p>
            <h3 style={nameStyle}>{product.name}</h3>
            <p style={priceStyle}>${product.price?.toFixed(2) || '0.00'}</p>
            
            <button 
              style={buttonStyle}
              onClick={() => alert(`Added ${product.name} to basket (feature coming soon!)`)}
            >
              Add to Basket
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
