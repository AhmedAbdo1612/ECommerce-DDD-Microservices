import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useTheme } from '../hooks/useTheme';
import { useCart } from '../context/CartContext';
import Pagination from './Pagination';

const DebugProductCard = ({ product }) => (
  <div style={{ padding: '1rem', border: '2px solid red', margin: '0.5rem', background: '#ffe6e6', color: '#333', borderRadius: '8px' }}>
    <h4 style={{ margin: '0 0 0.5rem 0', color: 'red' }}>🐛 Debug Card</h4>
    <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>ID:</strong> {product?.id}</p>
    <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Name:</strong> {product?.name}</p>
    <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Price:</strong> {product?.price}</p>
    <p style={{ margin: 0, fontSize: '0.8rem', wordBreak: 'break-all' }}><strong>Raw:</strong> {JSON.stringify(product).substring(0, 100)}...</p>
  </div>
);

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('size') || '10', 10);

  const { products, loading, error, totalCount, totalPages } = useProducts(currentPage, pageSize);
  const { theme } = useTheme();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage, size: pageSize });
  };

  const handlePageSizeChange = (newSize) => {
    setSearchParams({ page: 1, size: newSize });
  };

  console.log('[ProductList] Render state:', { loading, error, productsCount: products?.length });

  // Inline styled containers for guaranteed visibility regardless of external CSS issues
  const stateContainerStyle = {
    padding: '2rem',
    margin: '2rem 0',
    borderRadius: '12px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    border: '2px dashed'
  };

  if (loading) {
    return <div style={{ ...stateContainerStyle, borderColor: theme.primary, color: theme.primary }}>⏳ Loading products... (checking API)</div>;
  }

  if (error) {
    return <div style={{ ...stateContainerStyle, borderColor: theme.error, color: theme.error }}>❌ Error: {error}</div>;
  }

  if (products === null || products === undefined) {
    return <div style={{ ...stateContainerStyle, borderColor: 'orange', color: 'orange' }}>⚠️ Data state is null/undefined! Waiting for valid array.</div>;
  }

  if (!Array.isArray(products)) {
    return <div style={{ ...stateContainerStyle, borderColor: 'red', color: 'red' }}>⚠️ Data state is not an array! type: {typeof products}. See console for raw data.</div>;
  }

  if (products.length === 0) {
    return <div style={{ ...stateContainerStyle, borderColor: theme.textSecondary, color: theme.textSecondary }}>📭 No products found in the database.</div>;
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
    flexDirection: 'column',
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

  // Helper to format the image URL safely
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

  return (
    <div>
      <div style={{ marginBottom: '1rem', color: theme.textSecondary }}>
        Found {products.length} products.
      </div>
      <div style={gridStyle}>
        {products.map((product) => {
          // Add a failsafe key if product.id is missing to prevent React mapping errors
          const uniqueKey = product?.id || `fallback-key-${Math.random()}`;
          
          return (
            <div key={uniqueKey} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              
              {/* Optional: Render Debug Card to ensure data maps properly */}
              {/* <DebugProductCard product={product} /> */}

              <div 
                style={{ ...cardStyle, cursor: 'pointer' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; }}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {/* Display product image if we have URL, else structured fallback */}
                <div style={imagePlaceholderStyle}>
                  {getDefaultImage(product) ? (
                    <img 
                      src={getDefaultImage(product)} 
                      alt={product.name || 'Product'} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { 
                        console.warn(`[ProductList] Failed to load image for product ${product.id}`);
                        e.target.style.display = 'none'; 
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; 
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback UI when image fails to load or doesn't exist */}
                  <div style={{ display: getDefaultImage(product) ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '2rem' }}>📦</span>
                    <span>No Image Available</span>
                  </div>
                </div>
                
                <div style={contentStyle}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: theme.textSecondary }}>
                    {product?.category?.[0] || 'Uncategorized'}
                  </p>
                  <h3 style={nameStyle}>{product?.name || 'Unknown Product'}</h3>
                  <p style={priceStyle}>${Number(product?.price || 0).toFixed(2)}</p>
                  
                  <button 
                    style={buttonStyle}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart(product);
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default ProductList;
