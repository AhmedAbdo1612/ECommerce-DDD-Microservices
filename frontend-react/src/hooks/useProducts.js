import { useProductsQuery } from './api/useCatalog';

export const useProducts = (pageNumber = 1, pageSize = 10, category = '') => {
  const { data, isLoading, error } = useProductsQuery(pageNumber, pageSize, category);

  return {
    products: data?.products || [],
    loading: isLoading,
    error: error?.message || null,
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 1,
  };
};
