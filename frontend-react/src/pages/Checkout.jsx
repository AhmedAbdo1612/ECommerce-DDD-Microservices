import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useCheckoutMutation } from '../hooks/api/useBasket';
import { ShoppingBag, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cartItems, cartTotal, isLoading: isCartLoading } = useCart();
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const checkoutMutation = useCheckoutMutation();

  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.given_name || '',
    lastName: user?.family_name || '',
    emailAddress: user?.email || '',
    country: '',
    addressLine: '',
    state: '',
    zipCode: '',
    cardName: '',
    cardNumber: '',
    expiration: '',
    cvv: '',
    paymentMethod: 1
  });

  const SHIPPING_COST = 10.0;
  const finalTotal = cartTotal > 99 ? cartTotal : cartTotal + SHIPPING_COST;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const payload = {
      basketCheckoutDto: {
        userName: user?.username || user?.userName,
        customerId: user?.sub || '00000000-0000-0000-0000-000000000000',
        totalPrice: finalTotal,
        ...formData
      }
    };

    checkoutMutation.mutate(payload, {
      onSuccess: () => {
        setIsSuccess(true);
        toast.success('Order placed successfully!');
      },
      onError: (error) => {
        const problemDetails = error.response?.data;
        if (problemDetails && problemDetails.detail) {
          toast.error(problemDetails.detail);
        } else {
          toast.error('An error occurred during checkout');
        }
      }
    });
  };

  const inputStyle = {
    padding: '0.8rem 1.2rem',
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    background: theme.backgroundCard,
    color: theme.textPrimary,
    width: '100%',
    marginBottom: '1rem',
    outline: 'none',
    fontSize: '1rem'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    color: theme.textSecondary,
    fontWeight: '600',
    fontSize: '0.9rem'
  };

  const sectionTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: '1.5rem',
    paddingBottom: '0.5rem',
    borderBottom: `1px solid ${theme.border}`
  };

  if (isSuccess) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CheckCircle size={80} color={theme.success || '#10b981'} style={{ marginBottom: '2rem' }} />
        <h1 style={{ color: theme.textPrimary, marginBottom: '1rem' }}>Order Received!</h1>
        <p style={{ color: theme.textSecondary, fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '500px' }}>
          Thank you for your purchase. We are processing your order asynchronously and will send you an email confirmation shortly.
        </p>
        <button 
          onClick={() => navigate('/customer')}
          style={{ padding: '1rem 2rem', background: theme.primary, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}
        >
          View My Orders
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 5%', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Inter", sans-serif', minHeight: '80vh' }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.textSecondary, cursor: 'pointer', marginBottom: '2rem', fontWeight: '600' }}
        onClick={() => navigate('/cart')}
      >
        <ArrowLeft size={20} /> Back to Cart
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShoppingBag size={32} color={theme.primary} /> Checkout
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        <form onSubmit={handleSubmit} style={{ background: theme.backgroundCard, padding: '2rem', borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
          
          <h2 style={sectionTitleStyle}>Shipping Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} style={inputStyle} required />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleChange} style={inputStyle} required />
          </div>
          <div>
            <label style={labelStyle}>Address Line</label>
            <input type="text" name="addressLine" value={formData.addressLine} onChange={handleChange} style={inputStyle} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>State</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Zip Code</label>
              <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} style={inputStyle} required />
            </div>
          </div>

          <h2 style={{ ...sectionTitleStyle, marginTop: '2rem' }}>Payment Details</h2>
          <div>
            <label style={labelStyle}>Name on Card</label>
            <input type="text" name="cardName" value={formData.cardName} onChange={handleChange} style={inputStyle} required />
          </div>
          <div>
            <label style={labelStyle}>Card Number</label>
            <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} style={inputStyle} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Expiration Date (MM/YY)</label>
              <input type="text" name="expiration" value={formData.expiration} onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>CVV</label>
              <input type="text" name="cvv" value={formData.cvv} onChange={handleChange} style={inputStyle} required />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={checkoutMutation.isPending || cartItems.length === 0}
            style={{ 
              width: '100%', padding: '1.2rem', background: theme.primaryGradient || theme.primary, 
              color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem',
              marginTop: '2rem', cursor: (checkoutMutation.isPending || cartItems.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (checkoutMutation.isPending || cartItems.length === 0) ? 0.7 : 1,
              transition: 'transform 0.2s', boxShadow: theme.shadowGlow
            }}
          >
            {checkoutMutation.isPending ? 'Processing...' : 'Place Order'}
          </button>
        </form>

        <div style={{ background: theme.backgroundCard, padding: '2rem', borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: theme.shadow, position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme.textPrimary, marginBottom: '1.5rem' }}>Order Summary</h3>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
            {cartItems.map(item => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: `1px solid ${theme.border}`, paddingBottom: '1rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: theme.textPrimary, fontSize: '0.95rem' }}>{item.productName}</h4>
                  <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>Qty: {item.quantity}</span>
                </div>
                <div style={{ fontWeight: '600', color: theme.primary }}>${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: theme.textSecondary }}>
            <span>Subtotal</span>
            <span style={{ fontWeight: '600', color: theme.textPrimary }}>${cartTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: theme.textSecondary }}>
            <span>Shipping</span>
            <span style={{ fontWeight: '600', color: cartTotal > 99 ? theme.success : theme.textPrimary }}>
              {cartTotal > 99 ? 'Free' : `$${SHIPPING_COST.toFixed(2)}`}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.textPrimary, fontWeight: 'bold', fontSize: '1.25rem', borderTop: `1px solid ${theme.border}`, paddingTop: '1.5rem' }}>
            <span>Total</span>
            <span style={{ color: theme.primary }}>${finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
