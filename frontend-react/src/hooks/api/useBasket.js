import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/services';

export const useBasketQuery = (userName, isGuest = false) => {
  return useQuery({
    queryKey: ['basket', userName],
    queryFn: async () => {
      if (isGuest) {
        try {
          const stored = localStorage.getItem('instashop_guest_cart');
          return stored ? JSON.parse(stored) : [];
        } catch {
          return [];
        }
      }
      const response = await api.basket.getBasket(userName);
      return response.data?.cart?.items || [];
    },
    enabled: !!userName || isGuest,
  });
};

export const useAddToCartMutation = (userName, isGuest = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ item }) => {
      if (isGuest) {
        // Guest cart mutation handled purely locally for this demo, 
        // normally we would just resolve immediately
        return Promise.resolve(item);
      }
      return api.basket.addItem(userName, { item });
    },
    onMutate: async ({ item }) => {
      await queryClient.cancelQueries({ queryKey: ['basket', userName] });

      const previousBasket = queryClient.getQueryData(['basket', userName]);

      queryClient.setQueryData(['basket', userName], (old) => {
        const currentItems = old || [];
        const existingIndex = currentItems.findIndex(i => i.productId === item.productId);
        if (existingIndex >= 0) {
          const newItems = [...currentItems];
          newItems[existingIndex].quantity += item.quantity || 1;
          return newItems;
        }
        return [...currentItems, { ...item }];
      });

      return { previousBasket };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['basket', userName], context.previousBasket);
    },
    onSettled: () => {
      if (!isGuest) {
        queryClient.invalidateQueries({ queryKey: ['basket', userName] });
      }
    },
  });
};

export const useRemoveFromCartMutation = (userName, isGuest = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId }) => {
      if (isGuest) return Promise.resolve();
      return api.basket.removeItem(userName, productId);
    },
    onMutate: async ({ productId }) => {
      await queryClient.cancelQueries({ queryKey: ['basket', userName] });
      const previousBasket = queryClient.getQueryData(['basket', userName]);

      queryClient.setQueryData(['basket', userName], (old) => {
        return (old || []).filter(i => i.productId !== productId);
      });

      return { previousBasket };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['basket', userName], context.previousBasket);
    },
    onSettled: () => {
      if (!isGuest) {
        queryClient.invalidateQueries({ queryKey: ['basket', userName] });
      }
    },
  });
};

export const useUpdateQuantityMutation = (userName, isGuest = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }) => {
      if (isGuest) return Promise.resolve();
      return api.basket.updateItemQuantity(userName, productId, { quantity });
    },
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['basket', userName] });
      const previousBasket = queryClient.getQueryData(['basket', userName]);

      queryClient.setQueryData(['basket', userName], (old) => {
        return (old || []).map(i => i.productId === productId ? { ...i, quantity } : i);
      });

      return { previousBasket };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['basket', userName], context.previousBasket);
    },
    onSettled: () => {
      if (!isGuest) {
        queryClient.invalidateQueries({ queryKey: ['basket', userName] });
      }
    },
  });
};

export const useClearCartMutation = (userName, isGuest = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (isGuest) return Promise.resolve();
      return api.basket.deleteBasket(userName);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['basket', userName] });
      const previousBasket = queryClient.getQueryData(['basket', userName]);

      queryClient.setQueryData(['basket', userName], () => []);

      return { previousBasket };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['basket', userName], context.previousBasket);
    },
    onSettled: () => {
      if (!isGuest) {
        queryClient.invalidateQueries({ queryKey: ['basket', userName] });
      }
    },
  });
};

export const useCheckoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checkoutData) => {
      return api.basket.checkout(checkoutData);
    },
    onSuccess: (data, variables) => {
      const userName = variables.basketCheckoutDto?.userName;
      if (userName) {
        queryClient.setQueryData(['basket', userName], () => []);
        queryClient.invalidateQueries({ queryKey: ['basket', userName] });
      }
    }
  });
};
