import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useCategories = () => {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const invalidateCategories = () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  return {
    categories,
    isLoading,
    error,
    invalidateCategories,
  };
};