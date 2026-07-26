import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../hooks/useTheme';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useProductDetailQuery } from '../hooks/api/useCatalog';

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

const CartItemRow = ({ item, theme, updateQuantity, removeFromCart }) => {
  const { data: product } = useProductDetailQuery(item.productId);
  const imageUrl = getDefaultImage(product) || getDefaultImage(item);

  const itemStyle = { display: 'flex', padding: '1.5rem', borderBottom: `1px solid ${theme.border}`, gap: '1.5rem', alignItems: 'center' };
  const imgStyle = { width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', background: theme.backgroundAlt };
  const detailsStyle = { flex: 1 };
  const titleStyle = { fontSize: '1.1rem', fontWeight: '600', color: theme.textPrimary, margin: '0 0 0.5rem 0' };
  const priceStyle = { color: theme.primary, fontWeight: '700', fontSize: '1.1rem', margin: 0 };
  const qtyContainer = { display: 'flex', alignItems: 'center', gap: '1rem', background: theme.backgroundAlt, padding: '0.25rem', borderRadius: '8px', border: `1px solid ${theme.border}` };
  const qtyBtn = { background: 'none', border: 'none', cursor: 'pointer', color: theme.textPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem', borderRadius: '4px' };
  const qtyText = { fontWeight: '600', width: '30px', textAlign: 'center', color: theme.textPrimary };
  const removeBtn = { background: 'none', border: 'none', color: theme.error, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '8px', transition: 'background 0.2s' };

  return (
    <div style={itemStyle}>
      {imageUrl ? (
        <img src={imageUrl} alt={item.productName} style={imgStyle} />
      ) : (
        <div style={{...imgStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textSecondary, background: theme.backgroundAlt}}>
          No Image
        </div>
      )}
      
      <div style={detailsStyle}>
        <h3 style={titleStyle}>{item.productName}</h3>
        <p style={{ color: theme.textSecondary, fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>{product?.category?.join(', ') || item.category?.join(', ') || 'Category'}</p>
        <p style={priceStyle}>${Number(item.price).toFixed(2)}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
        <div style={qtyContainer}>
          <button style={qtyBtn} onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
            <Minus size={16} />
          </button>
          <span style={qtyText}>{item.quantity}</span>
          <button style={qtyBtn} onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
            <Plus size={16} />
          </button>
        </div>
        
        <button 
          style={removeBtn} 
          onClick={() => removeFromCart(item.productId, item.productName)}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount, isLoading } = useCart();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const SHIPPING_COST = 10.0;
  const isFreeShipping = cartTotal > 99;
  const finalShipping = isFreeShipping ? 0 : SHIPPING_COST;
  const finalTotal = cartTotal > 0 ? cartTotal + finalShipping : 0;

  const pageContainer = {
    padding: '2rem 5%',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Inter", sans-serif',
    minHeight: '80vh'
  };

  const headerStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
    color: theme.textPrimary,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const layoutStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '2rem',
    alignItems: 'start'
  };

  const cartListStyle = {
    background: theme.backgroundCard,
    borderRadius: '16px',
    border: `1px solid ${theme.border}`,
    overflow: 'hidden',
    boxShadow: theme.shadow
  };



  const summaryStyle = {
    background: theme.backgroundCard,
    borderRadius: '16px',
    border: `1px solid ${theme.border}`,
    padding: '1.5rem',
    boxShadow: theme.shadow,
    position: 'sticky',
    top: '100px'
  };

  const summaryRow = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    color: theme.textSecondary,
    fontSize: '1rem'
  };

  const divider = {
    height: '1px',
    background: theme.border,
    margin: '1.5rem 0'
  };

  const totalRow = {
    ...summaryRow,
    color: theme.textPrimary,
    fontWeight: '700',
    fontSize: '1.25rem',
    marginBottom: '0'
  };

  const checkoutBtn = {
    width: '100%',
    padding: '1rem',
    background: theme.primaryGradient,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '1.1rem',
    marginTop: '1.5rem',
    cursor: 'pointer',
    boxShadow: theme.shadowGlow,
    transition: 'transform 0.2s',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: theme.backgroundCard,
    borderRadius: '16px',
    border: `1px solid ${theme.border}`,
    boxShadow: theme.shadow
  };



  // Adjust layout for small screens
  const isMobile = window.innerWidth <= 768;

  return (
    <div style={pageContainer}>
      <h1 style={headerStyle}>
        <ShoppingBag size={32} color={theme.primary} />
        Your Shopping Cart
      </h1>

      {isLoading ? (
        <div style={{ ...emptyStateStyle, padding: '6rem 2rem' }}>
          <div style={{ width: '40px', height: '40px', border: `4px solid ${theme.border}`, borderTop: `4px solid ${theme.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem auto' }}></div>
          <h2 style={{ color: theme.textSecondary }}>Loading your cart...</h2>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : cartItems.length === 0 ? (
        <div style={emptyStateStyle}>
          <ShoppingBag size={64} color={theme.textSecondary} style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '1rem' }}>Your cart is empty</h2>
          <p style={{ color: theme.textSecondary, marginBottom: '2rem' }}>Looks like you haven't added anything to your cart yet.</p>
          <button 
            onClick={() => navigate('/')} 
            style={{ padding: '0.8rem 2rem', background: theme.primary, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: '2rem' } : layoutStyle}>
          <div style={cartListStyle}>
            <div style={{ padding: '1.5rem', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', color: theme.textPrimary }}>{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</span>
              <button 
                onClick={clearCart} 
                style={{ background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear Cart
              </button>
            </div>

            {cartItems.map((item) => (
              <CartItemRow 
                key={item.productId} 
                item={item} 
                theme={theme} 
                updateQuantity={updateQuantity} 
                removeFromCart={removeFromCart} 
              />
            ))}
          </div>

          <div style={summaryStyle}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme.textPrimary, margin: '0 0 1.5rem 0' }}>Order Summary</h3>
            
            <div style={summaryRow}>
              <span>Subtotal</span>
              <span style={{ fontWeight: '600', color: theme.textPrimary }}>${cartTotal.toFixed(2)}</span>
            </div>
            
            <div style={summaryRow}>
              <span>Shipping</span>
              <span style={{ fontWeight: '600', color: isFreeShipping ? theme.success : theme.textPrimary }}>
                {isFreeShipping ? 'Free' : `$${SHIPPING_COST.toFixed(2)}`}
              </span>
            </div>
            
            {!isFreeShipping && (
              <p style={{ fontSize: '0.85rem', color: theme.textSecondary, marginTop: '-0.5rem', marginBottom: '1rem' }}>
                Free shipping on orders over $99
              </p>
            )}
            
            <div style={divider}></div>
            
            <div style={totalRow}>
              <span>Total</span>
              <span style={{ color: theme.primary }}>${finalTotal.toFixed(2)}</span>
            </div>
            
            <button 
              style={checkoutBtn}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
              onClick={() => navigate('/checkout')}
            >
              <ShoppingBag size={20} />
              Checkout Now
            </button>
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Link to="/" style={{ color: theme.primary, textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
                    Continue Shopping
                </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
