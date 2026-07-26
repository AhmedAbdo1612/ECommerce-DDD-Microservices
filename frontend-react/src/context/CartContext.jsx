import React, { createContext, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useBasketQuery, 
  useAddToCartMutation, 
  useRemoveFromCartMutation, 
  useUpdateQuantityMutation, 
  useClearCartMutation 
} from '../hooks/api/useBasket';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const isGuest = !isAuthenticated;
  const userName = user?.username || user?.userName || 'guest';

  // 1. Fetch Cart using TanStack Query
  const { data: cartItems = [], isLoading: isCartLoading } = useBasketQuery(userName, isGuest);

  // 2. Setup Mutations
  const addToCartMutation = useAddToCartMutation(userName, isGuest);
  const removeFromCartMutation = useRemoveFromCartMutation(userName, isGuest);
  const updateQuantityMutation = useUpdateQuantityMutation(userName, isGuest);
  const clearCartMutation = useClearCartMutation(userName, isGuest);

  const isLoading = authLoading || isCartLoading;

  // Sync Guest Cart to LocalStorage when it changes
  useEffect(() => {
    if (isGuest && !isLoading) {
      localStorage.setItem('instashop_guest_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isGuest, isLoading]);

  // Sync Guest Cart to Backend on Login (Optional, just clear it for now as previously done)
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const guestCart = localStorage.getItem('instashop_guest_cart');
      if (guestCart) {
        localStorage.removeItem('instashop_guest_cart');
        // A robust app would loop over guestCart items and mutate to add them to backend cart here
        queryClient.invalidateQueries({ queryKey: ['basket', userName] });
      }
    }
  }, [isAuthenticated, isLoading, userName, queryClient]);

  // Action Wrappers
  const addToCart = (product, quantity = 1) => {
    const itemToAdd = {
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: quantity,
      color: "Default"
    };
    
    addToCartMutation.mutate({ item: itemToAdd }, {
      onSuccess: () => toast.success(`${product.name || 'Item'} added to cart!`),
      onError: () => toast.error("Failed to save item to backend. Change reverted.")
    });
  };

  const removeFromCart = (productId, name) => {
    removeFromCartMutation.mutate({ productId }, {
      onSuccess: () => toast.success(`${name || 'Item'} removed from cart.`),
      onError: () => toast.error("Failed to remove item from backend. Change reverted.")
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    updateQuantityMutation.mutate({ productId, quantity }, {
      onError: () => toast.error("Failed to update quantity on backend. Change reverted.")
    });
  };

  const clearCart = () => {
    clearCartMutation.mutate(undefined, {
      onSuccess: () => toast.success('Cart cleared.'),
      onError: () => toast.error("Failed to clear cart on backend. Change reverted.")
    });
  };

  // Derived State
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
