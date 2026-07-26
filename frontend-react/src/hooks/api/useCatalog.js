import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/services';

export const useProductsQuery = (pageNumber = 1, pageSize = 10, category = '') => {
  return useQuery({
    queryKey: ['products', pageNumber, pageSize, category],
    queryFn: async () => {
      const response = await api.catalog.getProducts(pageNumber, pageSize, category);
      const data = response.data?.data || response.data?.products || response.data || [];
      const parsedProducts = Array.isArray(data) ? data : [];
      
      const estimatedTotal = response.data?.count || response.data?.totalCount || (
        (pageNumber - 1) * pageSize + parsedProducts.length + (parsedProducts.length === pageSize ? 1 : 0)
      );
      
      return {
        products: parsedProducts,
        totalCount: estimatedTotal,
        totalPages: Math.ceil(estimatedTotal / pageSize) || 1,
      };
    },
    keepPreviousData: true,
  });
};

export const useProductDetailQuery = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.catalog.getProductById(id);
      return response.data?.product || response.data;
    },
    enabled: !!id,
  });
};
