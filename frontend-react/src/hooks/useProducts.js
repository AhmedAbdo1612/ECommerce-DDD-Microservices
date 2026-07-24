import { useState, useEffect } from 'react';
import { axiosInstance } from '../api/axios';

export const useProducts = (pageNumber = 1, pageSize = 10) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // This will be routed by YarpApiGateway to the Catalog API
        const response = await axiosInstance.get(`/products?PageNumber=${pageNumber}&PageSize=${pageSize}`);
        setProducts(response.data.products || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [pageNumber, pageSize]);

  return { products, loading, error };
};
