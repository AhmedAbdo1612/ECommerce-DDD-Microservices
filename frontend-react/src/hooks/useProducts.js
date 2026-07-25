import { useState, useEffect } from 'react';
import { axiosInstance } from '../api/axios';

export const useProducts = (pageNumber = 1, pageSize = 10) => {
  const [products, setProducts] = useState(null); // Initialize as null to check for undefined/null states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination metadata
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('[useProducts] Fetching products...', { pageNumber, pageSize });
        setLoading(true);
        // This will be routed by YarpApiGateway to the Catalog API
        const response = await axiosInstance.get(`/products?PageNumber=${pageNumber}&PageSize=${pageSize}`);
        
        console.log('[useProducts] API Response received:', response.data);
        
        // Extract data properly depending on the API's pagination/wrapping format
        const data = response.data?.data || response.data?.products || response.data || [];
        const parsedProducts = Array.isArray(data) ? data : [];
        
        setProducts(parsedProducts);
        
        // Since API doesn't return totalCount, we estimate it for pagination
        // If we get a full page, assume there's at least one more page
        const estimatedTotal = response.data?.count || response.data?.totalCount || (
          (pageNumber - 1) * pageSize + parsedProducts.length + (parsedProducts.length === pageSize ? 1 : 0)
        );
        
        setTotalCount(estimatedTotal);
        setTotalPages(Math.ceil(estimatedTotal / pageSize) || 1);
        
        setError(null);
      } catch (err) {
        console.error('[useProducts] Error fetching products:', err);
        setError('Failed to fetch products: ' + (err.message || 'Unknown error'));
        setProducts([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [pageNumber, pageSize]);

  return { products, loading, error, totalCount, totalPages };
};
