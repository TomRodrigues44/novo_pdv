import { useQuery } from '@tanstack/react-query';

export const useCashRegister = () => {
  const { data: cashData, isLoading } = useQuery({
    queryKey: ['cash-register'],
    queryFn: async () => {
      const response = await fetch('/api/cash-register');
      if (!response.ok) throw new Error('Failed to fetch cash register');
      return response.json();
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const isOpen = cashData?.current !== null && cashData?.current !== undefined;
  const currentRegister = cashData?.current;

  return {
    isOpen,
    currentRegister,
    isLoading,
  };
};