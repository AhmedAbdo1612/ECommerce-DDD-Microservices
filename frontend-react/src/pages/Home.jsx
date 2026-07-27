import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useCart } from '../context/CartContext';
import { useProducts } from '../hooks/useProducts';
import Pagination from '../components/Pagination';

const BANNERS = [
  { id: 1, title: 'Summer Sale', subtitle: 'Up to 50% off on all electronics', color: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)' },
  { id: 2, title: 'New Arrivals', subtitle: 'Check out the latest tech gadgets', color: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)' },
  { id: 3, title: 'Free Shipping', subtitle: 'On orders over $99', color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }
];

const Home = () => {
  const { isAuthenticated, isCustomer, isAdmin } = useAuth();
  const { theme } = useTheme();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('size') || '10', 12);
  
  const categories = ['All', 'Smartphones', 'Laptops', 'Accessories', 'Audio', 'Cameras'];

  const catParam = selectedCategory === 'All' ? '' : selectedCategory;
  const { products, loading, error, totalCount, totalPages } = useProducts(currentPage, pageSize, catParam);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage, size: pageSize });
  };

  const handlePageSizeChange = (newSize) => {
    setSearchParams({ page: 1, size: newSize });
  };

  // Auto-slide hero banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNextSlide = () => setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
  const handlePrevSlide = () => setCurrentSlide((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);

  // Filter products by search query locally since API might only support category
  const displayedProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentlyAdded = [...products].sort((a, b) => b.id?.toString().localeCompare(a.id?.toString())).slice(0, 5); // Mock recently added by taking first 5 after sorting

  // --- Styles ---
  const pageContainer = {
    padding: '2rem 5%',
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem',
    fontFamily: '"Inter", sans-serif'
  };

  const heroContainer = {
    position: 'relative',
    height: '400px',
    borderRadius: '20px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    boxShadow: theme.shadow,
    textAlign: 'center'
  };

  const sectionTitle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const horizontalScroll = {
    display: 'flex',
    overflowX: 'auto',
    gap: '1.5rem',
    paddingBottom: '1rem',
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none' // IE/Edge
  };

  const gridContainer = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem'
  };

  const cardStyle = {
    background: theme.backgroundCard,
    border: `1px solid ${theme.border}`,
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    cursor: 'pointer'
  };

  const imgContainerStyle = {
    height: '220px',
    background: theme.backgroundAlt,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  };

  const inputStyle = {
    padding: '0.8rem 1.2rem',
    borderRadius: '12px',
    border: `1px solid ${theme.border}`,
    background: theme.backgroundCard,
    color: theme.textPrimary,
    width: '100%',
    maxWidth: '400px',
    outline: 'none',
    fontSize: '1rem'
  };

  const tabStyle = (active) => ({
    padding: '0.6rem 1.2rem',
    borderRadius: '20px',
    border: active ? 'none' : `1px solid ${theme.border}`,
    background: active ? theme.primary : theme.backgroundAlt,
    color: active ? '#fff' : theme.textSecondary,
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  });

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
    <div style={pageContainer}>
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 0.75rem)); }
        }
        .marquee-track {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          will-change: transform;
          animation: marquee-scroll 25s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      {/* 1. Hero Banner Carousel */}
      <div style={heroContainer}>
        {BANNERS.map((banner, index) => (
          <div 
            key={banner.id}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: banner.color,
              opacity: index === currentSlide ? 1 : 0,
              transition: 'opacity 0.8s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
          >
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{banner.title}</h1>
            <p style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', opacity: 0.9, marginTop: '1rem' }}>{banner.subtitle}</p>
            <button style={{ 
              marginTop: '2rem', padding: '1rem 2.5rem', borderRadius: '30px', 
              background: '#fff', color: '#000', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>
              Shop Now
            </button>
          </div>
        ))}
        {/* Navigation Arrows */}
        <button onClick={handlePrevSlide} style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>❮</button>
        <button onClick={handleNextSlide} style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>❯</button>
        {/* Navigation Dots */}
        <div style={{ position: 'absolute', bottom: '20px', display: 'flex', gap: '10px' }}>
          {BANNERS.map((_, i) => (
            <div key={i} onClick={() => setCurrentSlide(i)} style={{ width: '12px', height: '12px', borderRadius: '50%', background: i === currentSlide ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>

      {/* Tools: Search & Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {categories.map(cat => (
              <button key={cat} style={tabStyle(selectedCategory === cat || (cat === 'All' && !selectedCategory))} onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}>
                {cat}
              </button>
            ))}
          </div>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* State Handling: Loading & Error */}
      {error && (
        <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', textAlign: 'center' }}>
          <h3>Failed to load catalog</h3>
          <p>{error}</p>
        </div>
      )}

      {loading && !error && (
        <div>
          <div style={sectionTitle}>Loading Products...</div>
          <div style={gridContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} style={{ ...cardStyle, animation: 'pulse 1.5s infinite ease-in-out' }}>
                <div style={{ height: '220px', background: theme.backgroundAlt }} />
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ height: '20px', background: theme.backgroundAlt, borderRadius: '4px', marginBottom: '10px', width: '80%' }} />
                  <div style={{ height: '15px', background: theme.backgroundAlt, borderRadius: '4px', marginBottom: '20px', width: '50%' }} />
                  <div style={{ height: '40px', background: theme.backgroundAlt, borderRadius: '8px', width: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Rendering */}
      {!loading && !error && (
        <>
          {/* 2. Recently Added Horizontal Scroll */}
          {recentlyAdded.length > 0 && !searchQuery && !selectedCategory && (
            <div>
              <h2 style={sectionTitle}>Recently Added ✨</h2>
              <div style={{
                overflow: 'hidden',
                maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                padding: '1rem 0'
              }}>
                <div className="marquee-track">
                  {[...recentlyAdded, ...recentlyAdded].map((product, index) => (
                    <div 
                      key={`${product.id}-${index}`} 
                      style={{ ...cardStyle, minWidth: '280px', maxWidth: '300px', flexShrink: 0 }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'none';
                      }}
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 1 }}>NEW</div>
                      <div style={imgContainerStyle}>
                        {getDefaultImage(product) ? (
                          <img src={getDefaultImage(product)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <span style={{ color: theme.textSecondary }}>No Image</span>
                        )}
                      </div>
                      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: theme.textPrimary }}>{product.name}</h3>
                        <p style={{ margin: 0, color: theme.primary, fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem' }}>${Number(product.price || 0).toFixed(2)}</p>
                        <button 
                          style={{ marginTop: 'auto', width: '100%', padding: '0.8rem', background: theme.primary, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
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
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. Featured Products Grid */}
          <div>
            <h2 style={sectionTitle}>
              {searchQuery ? `Search Results for "${searchQuery}"` : selectedCategory ? `${selectedCategory} Products` : 'Featured Products'}
              <span style={{ fontSize: '1rem', color: theme.textSecondary, fontWeight: 'normal' }}>{displayedProducts.length} items</span>
            </h2>
            
            {displayedProducts.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: theme.textSecondary, background: theme.backgroundAlt, borderRadius: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>No products found</h3>
                <p>Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div style={gridContainer}>
                {displayedProducts.map(product => (
                  <div 
                    key={product.id} 
                    style={cardStyle}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = theme.shadowGlow;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div style={imgContainerStyle}>
                      {getDefaultImage(product) ? (
                        <img src={getDefaultImage(product)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <span style={{ color: theme.textSecondary }}>No Image</span>
                      )}
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: theme.textPrimary }}>{product.name}</h3>
                      </div>
                      <span style={{ color: theme.textSecondary, fontSize: '0.85rem', marginBottom: '1rem' }}>{product.category?.join(', ')}</span>
                      <p style={{ margin: 0, color: theme.primary, fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '1.5rem' }}>${Number(product.price || 0).toFixed(2)}</p>
                      
                      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                        <button 
                          style={{ 
                            flex: 1, padding: '0.8rem', background: theme.primary, color: '#fff', 
                            border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                          }}
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
                ))}
              </div>
            )}
            
            {!loading && !error && displayedProducts.length > 0 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
