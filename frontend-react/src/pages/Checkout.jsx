import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useCheckoutMutation } from '../hooks/api/useBasket';
import { ShoppingBag, ArrowLeft, CheckCircle, Loader } from 'lucide-react';
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
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const SHIPPING_COST = 10.0;
  const finalTotal = cartTotal > 99 ? cartTotal : cartTotal + SHIPPING_COST;

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'firstName':
        if (!value) error = 'First Name is required';
        else if (value.length > 50) error = 'First Name must be 50 characters or less';
        break;
      case 'lastName':
        if (!value) error = 'Last Name is required';
        else if (value.length > 50) error = 'Last Name must be 50 characters or less';
        break;
      case 'emailAddress':
        if (!value) error = 'Email Address is required';
        else if (value.length > 50) error = 'Email Address must be 50 characters or less';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'addressLine':
        if (!value) error = 'Address Line is required';
        else if (value.length > 180) error = 'Address Line must be 180 characters or less';
        break;
      case 'country':
        if (!value) error = 'Country is required';
        else if (value.length > 50) error = 'Country must be 50 characters or less';
        break;
      case 'state':
        if (!value) error = 'State is required';
        else if (value.length > 50) error = 'State must be 50 characters or less';
        break;
      case 'zipCode':
        if (!value) error = 'Zip Code is required';
        else if (value.length > 20) error = 'Zip Code must be 20 characters or less';
        break;
      case 'cardName':
        if (!value) error = 'Name on Card is required';
        else if (value.length > 50) error = 'Name on Card must be 50 characters or less';
        break;
      case 'cardNumber':
        const rawCard = value.replace(/\s/g, '');
        if (!value) error = 'Card Number is required';
        else if (rawCard.length !== 16) error = 'Card Number must be 16 digits';
        break;
      case 'expiration':
        if (!value) error = 'Expiration Date is required';
        else {
          if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) error = 'Format must be MM/YY';
          else {
            const [month, year] = value.split('/');
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear() % 100;
            const expMonth = parseInt(month, 10);
            const expYear = parseInt(year, 10);
            if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
              error = 'Expiration Date must be in the future';
            }
          }
        }
        break;
      case 'cvv':
        if (!value) error = 'CVV is required';
        else if (!/^\d{3,4}$/.test(value)) error = 'CVV must be 3 or 4 digits';
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Auto-formatting
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').substring(0, 16);
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (name === 'expiration') {
      let cleaned = value.replace(/\D/g, '');
      if (cleaned.length >= 2) {
        value = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
      } else {
        value = cleaned;
      }
    } else if (name === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 4);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'paymentMethod') {
        const err = validateField(key, formData[key]);
        if (err) newErrors[key] = err;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const allTouched = Object.keys(formData).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(allTouched);
      toast.error('Please fix the errors in the form before submitting.');
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
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .checkout-input {
            padding: 0.8rem 1.2rem;
            border-radius: 8px;
            border: 1px solid ${theme.border};
            background: ${theme.backgroundCard};
            color: ${theme.textPrimary};
            width: 100%;
            outline: none;
            font-size: 1rem;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .checkout-input:hover {
            border-color: ${theme.primary}80;
          }
          .checkout-input:focus {
            border-color: ${theme.primary};
            box-shadow: 0 0 0 3px ${theme.primary}30;
          }
          .checkout-input.error {
            border-color: #ef4444 !important;
          }
          .checkout-input.error:focus {
            box-shadow: 0 0 0 3px #ef444430 !important;
          }
          .input-wrapper {
            margin-bottom: 1.2rem;
            width: 100%;
          }
          .error-text {
            color: #ef4444;
            font-size: 0.85rem;
            margin-top: 0.4rem;
            display: block;
          }
        `}
      </style>
      
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
            <div className="input-wrapper">
              <label style={labelStyle}>First Name</label>
              <input type="text" name="firstName" autoComplete="given-name" value={formData.firstName} onChange={handleChange} onBlur={handleBlur} className={`checkout-input ${errors.firstName && touched.firstName ? 'error' : ''}`} />
              {errors.firstName && touched.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>
            <div className="input-wrapper">
              <label style={labelStyle}>Last Name</label>
              <input type="text" name="lastName" autoComplete="family-name" value={formData.lastName} onChange={handleChange} onBlur={handleBlur} className={`checkout-input ${errors.lastName && touched.lastName ? 'error' : ''}`} />
              {errors.lastName && touched.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>
          <div className="input-wrapper">
            <label style={labelStyle}>Email Address</label>
            <input type="email" name="emailAddress" autoComplete="email" value={formData.emailAddress} onChange={handleChange} onBlur={handleBlur} className={`checkout-input ${errors.emailAddress && touched.emailAddress ? 'error' : ''}`} />
            {errors.emailAddress && touched.emailAddress && <span className="error-text">{errors.emailAddress}</span>}
          </div>
          <div className="input-wrapper">
            <label style={labelStyle}>Address Line</label>
            <input type="text" name="addressLine" autoComplete="street-address" value={formData.addressLine} onChange={handleChange} onBlur={handleBlur} className={`checkout-input ${errors.addressLine && touched.addressLine ? 'error' : ''}`} />
            {errors.addressLine && touched.addressLine && <span className="error-text">{errors.addressLine}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="input-wrapper">
              <label style={labelStyle}>Country</label>
              <input type="text" name="country" autoComplete="country" value={formData.country} onChange={handleChange} onBlur={handleBlur} className={`checkout-input ${errors.country && touched.country ? 'error' : ''}`} />
              {errors.country && touched.country && <span className="error-text">{errors.country}</span>}
            </div>
            <div className="input-wrapper">
              <label style={labelStyle}>State</label>
              <input type="text" name="state" autoComplete="address-level1" value={formData.state} onChange={handleChange} onBlur={handleBlur} className={`checkout-input ${errors.state && touched.state ? 'error' : ''}`} />
              {errors.state && touched.state && <span className="error-text">{errors.state}</span>}
            </div>
            <div className="input-wrapper">
              <label style={labelStyle}>Zip Code</label>
              <input type="text" name="zipCode" autoComplete="postal-code" value={formData.zipCode} onChange={handleChange} onBlur={handleBlur} className={`checkout-input ${errors.zipCode && touched.zipCode ? 'error' : ''}`} />
              {errors.zipCode && touched.zipCode && <span className="error-text">{errors.zipCode}</span>}
            </div>
          </div>

          <h2 style={{ ...sectionTitleStyle, marginTop: '2rem' }}>Payment Details</h2>
          <div className="input-wrapper">
            <label style={labelStyle}>Name on Card</label>
            <input type="text" name="cardName" autoComplete="cc-name" value={formData.cardName} onChange={handleChange} onBlur={handleBlur} className={`checkout-input ${errors.cardName && touched.cardName ? 'error' : ''}`} />
            {errors.cardName && touched.cardName && <span className="error-text">{errors.cardName}</span>}
          </div>
          <div className="input-wrapper">
            <label style={labelStyle}>Card Number</label>
            <input type="text" name="cardNumber" autoComplete="cc-number" value={formData.cardNumber} onChange={handleChange} onBlur={handleBlur} className={`checkout-input ${errors.cardNumber && touched.cardNumber ? 'error' : ''}`} placeholder="0000 0000 0000 0000" />
            {errors.cardNumber && touched.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-wrapper">
              <label style={labelStyle}>Expiration Date</label>
              <input type="text" name="expiration" autoComplete="cc-exp" value={formData.expiration} onChange={handleChange} onBlur={handleBlur} className={`checkout-input ${errors.expiration && touched.expiration ? 'error' : ''}`} placeholder="MM/YY" />
              {errors.expiration && touched.expiration && <span className="error-text">{errors.expiration}</span>}
            </div>
            <div className="input-wrapper">
              <label style={labelStyle}>CVV</label>
              <input type="text" name="cvv" autoComplete="cc-csc" value={formData.cvv} onChange={handleChange} onBlur={handleBlur} className={`checkout-input ${errors.cvv && touched.cvv ? 'error' : ''}`} placeholder="123" />
              {errors.cvv && touched.cvv && <span className="error-text">{errors.cvv}</span>}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={checkoutMutation.isPending || cartItems.length === 0}
            style={{ 
              width: '100%', padding: '1.2rem', background: theme.primaryGradient || theme.primary, 
              color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem',
              marginTop: '1rem', cursor: (checkoutMutation.isPending || cartItems.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (checkoutMutation.isPending || cartItems.length === 0) ? 0.7 : 1,
              transition: 'transform 0.2s', boxShadow: theme.shadowGlow,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {checkoutMutation.isPending ? (
              <>
                <Loader size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
                Processing Order...
              </>
            ) : 'Place Order'}
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
