import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useCart } from '../context/CartContext';
import { ArrowLeft, ShoppingBag, Truck, Shield, Clock } from 'lucide-react';
import { useProductDetailQuery } from '../hooks/api/useCatalog';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { addToCart } = useCart();
  
  const { data: product, isLoading: loading, error } = useProductDetailQuery(id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Image slider effect
  useEffect(() => {
    if (!product || !product.images || product.images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }, 4000); // 4 seconds transition
    
    return () => clearInterval(interval);
  }, [product]);

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: theme.textSecondary }}>
        <h2>Loading Product Details...</h2>
        <div style={{ width: '40px', height: '40px', border: `4px solid ${theme.border}`, borderTop: `4px solid ${theme.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '2rem auto' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: theme.error }}>
        <h2>{error?.message || 'Product not found'}</h2>
        <button onClick={() => navigate('/')} style={{ marginTop: '2rem', padding: '0.8rem 2rem', background: theme.primary, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Back to Shop
        </button>
      </div>
    );
  }

  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/images/${url}`;
  };

  let displayImages = [];
  if (product.images && product.images.length > 0) {
    displayImages = product.images.map(img => getImageUrl(img.url));
  } else if (product.imageFile) {
    displayImages = [getImageUrl(product.imageFile)];
  }

  const handleAddToCart = () => {
    addToCart(product);
  };

  const containerStyle = {
    padding: '2rem 5%',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Inter", sans-serif',
    color: theme.textPrimary
  };

  const backLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: theme.textSecondary,
    textDecoration: 'none',
    fontWeight: '600',
    marginBottom: '2rem',
    transition: 'color 0.2s',
    cursor: 'pointer'
  };

  const layoutStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '3rem',
    alignItems: 'start'
  };

  // Banner Styles
  const bannerContainerStyle = {
    position: 'relative',
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: '24px',
    overflow: 'hidden',
    background: theme.backgroundAlt,
    boxShadow: theme.shadow,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const imgStyle = (isActive) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: isActive ? 1 : 0,
    transition: 'opacity 0.8s ease-in-out',
    transform: isActive ? 'scale(1)' : 'scale(1.05)'
  });

  const dotsContainerStyle = {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '10px',
    background: 'rgba(0,0,0,0.3)',
    padding: '8px 16px',
    borderRadius: '20px',
    backdropFilter: 'blur(4px)'
  };

  const dotStyle = (isActive) => ({
    width: isActive ? '24px' : '8px',
    height: '8px',
    borderRadius: '4px',
    background: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  });

  const badgeStyle = {
    display: 'inline-block',
    padding: '0.4rem 1rem',
    background: theme.primaryGradient || theme.primary,
    color: '#fff',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    marginBottom: '1rem'
  };

  return (
    <div style={containerStyle}>
      <div 
        style={backLinkStyle} 
        onClick={() => navigate(-1)}
        onMouseOver={(e) => e.currentTarget.style.color = theme.primary}
        onMouseOut={(e) => e.currentTarget.style.color = theme.textSecondary}
      >
        <ArrowLeft size={20} />
        Back to Results
      </div>

      <div style={layoutStyle}>
        {/* Left Column: Image Banner */}
        <div>
          <div style={bannerContainerStyle}>
            {displayImages.length > 0 ? (
              displayImages.map((src, index) => (
                <img 
                  key={index}
                  src={src} 
                  alt={`${product.name} - view ${index + 1}`}
                  style={imgStyle(index === currentImageIndex)}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ))
            ) : (
              <div style={{ color: theme.textSecondary, fontSize: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</span>
                No Image Available
              </div>
            )}
            
            {/* Dots indicator */}
            {displayImages.length > 1 && (
              <div style={dotsContainerStyle}>
                {displayImages.map((_, index) => (
                  <div 
                    key={index} 
                    style={dotStyle(index === currentImageIndex)}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {displayImages.length > 1 && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {displayImages.map((src, index) => (
                <div 
                  key={index} 
                  style={{
                    width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
                    border: index === currentImageIndex ? `3px solid ${theme.primary}` : `1px solid ${theme.border}`,
                    opacity: index === currentImageIndex ? 1 : 0.6,
                    transition: 'all 0.2s', flexShrink: 0
                  }}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="thumbnail" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Details */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {product.category && product.category.length > 0 && (
            <div>
              {product.category.map((cat, i) => (
                <span key={i} style={badgeStyle}>{cat}</span>
              ))}
            </div>
          )}
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 1rem 0', lineHeight: 1.2 }}>
            {product.name}
          </h1>
          
          <div style={{ fontSize: '2rem', fontWeight: '800', color: theme.primary, marginBottom: '2rem' }}>
            ${Number(product.price).toFixed(2)}
          </div>

          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: theme.textSecondary, marginBottom: '2.5rem', whiteSpace: 'pre-wrap' }}>
            {product.description || 'No detailed description available for this product.'}
          </p>

          <button 
            style={{ 
              width: '100%', padding: '1.2rem', background: theme.primaryGradient || theme.primary, 
              color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1.2rem', fontWeight: '700', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
              boxShadow: theme.shadowGlow, transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              marginBottom: '2.5rem'
            }}
            onClick={handleAddToCart}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; }}
          >
            <ShoppingBag size={24} />
            Add to Cart
          </button>

          {/* Features / Guarantees Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderTop: `1px solid ${theme.border}`, paddingTop: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px' }}>
                <Truck size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: theme.textPrimary }}>Free Delivery</h4>
                <span style={{ fontSize: '0.85rem', color: theme.textSecondary }}>Orders over $99</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.8rem', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderRadius: '12px' }}>
                <Shield size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: theme.textPrimary }}>Secure Payment</h4>
                <span style={{ fontSize: '0.85rem', color: theme.textSecondary }}>100% Protected</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.8rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '12px' }}>
                <Clock size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: theme.textPrimary }}>24/7 Support</h4>
                <span style={{ fontSize: '0.85rem', color: theme.textSecondary }}>Dedicated Team</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
