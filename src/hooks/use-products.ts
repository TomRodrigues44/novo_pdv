import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useProducts = () => {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  return {
    products,
    isLoading,
    error,
    invalidateProducts,
  };
};