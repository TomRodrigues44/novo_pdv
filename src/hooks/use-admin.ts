import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Product, Category } from "@/types/product";

export const useAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Buscar dados do banco de dados
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [productsRes, categoriesRes, salesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/sales'),
      ]);

      if (!productsRes.ok || !categoriesRes.ok || !salesRes.ok) {
        throw new Error('API error');
      }

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const salesData = await salesRes.json();

      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setSales(Array.isArray(salesData) ? salesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função pública para forçar refresh dos dados
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Carregar dados ao montar
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Invalidar cache do React Query
  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  }, [queryClient]);

  // Gerenciar Categorias
  const addCategory = useCallback(async (category: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}`,
    };
    
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategory),
    });

    if (response.ok) {
      setCategories((prev) => [...prev, newCategory]);
      invalidateCache();
    }
  }, [invalidateCache]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
      );
      invalidateCache();
    }
  }, [invalidateCache]);

  const deleteCategory = useCallback(async (id: string) => {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      setProducts((prev) => prev.filter((prod) => prod.category !== id));
      invalidateCache();
    }
  }, [invalidateCache]);

  // Gerenciar Produtos
  const addProduct = useCallback(async (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
    };
    
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    });

    if (response.ok) {
      setProducts((prev) => [...prev, newProduct]);
      invalidateCache();
    }
  }, [invalidateCache]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      setProducts((prev) =>
        prev.map((prod) => (prod.id === id ? { ...prod, ...updates } : prod))
      );
      invalidateCache();
    }
  }, [invalidateCache]);

  const deleteProduct = useCallback(async (id: string) => {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setProducts((prev) => prev.filter((prod) => prod.id !== id));
      invalidateCache();
    }
  }, [invalidateCache]);

  const updateStock = useCallback(async (id: string, quantity: number) => {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: quantity, available: quantity > 0 }),
    });

    if (response.ok) {
      setProducts((prev) =>
        prev.map((prod) =>
          prod.id === id ? { ...prod, stock: quantity, available: quantity > 0 } : prod
        )
      );
      invalidateCache();
    }
  }, [invalidateCache]);

  // Registrar venda
  const recordSale = useCallback(async (saleData: any) => {
    const response = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData),
    });

    if (response.ok) {
      const result = await response.json();
      
      // Atualizar a lista de vendas
      await fetchData();
      
      // Invalidar cache do PDV para atualizar estoque
      invalidateCache();
      
      return result;
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Erro ao criar a venda no servidor.' }));
      throw new Error(errorData.message || errorData.statusMessage || 'Erro ao registrar a venda.');
    }
  }, [fetchData, invalidateCache]);

  // Relatórios
  const getSalesReport = useCallback((days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentSales = sales.filter((sale) => {
      const saleDate = new Date(sale.created_at);
      // Filtrar por data E excluir vendas canceladas
      return saleDate >= cutoffDate && sale.status !== 'cancelled' && sale.xml_status !== 'cancelled';
    });

    const totalRevenue = recentSales.reduce(
      (sum, sale) => sum + parseFloat(sale.total_amount || sale.total || 0),
      0
    );

    const totalItems = recentSales.reduce(
      (sum, sale) => sum + (sale.items?.length || 0),
      0
    );

    const salesByCategory = recentSales.reduce((acc: any, sale: any) => {
      sale.items?.forEach((item: any) => {
        const category = products.find((p) => p.id === item.product_id)?.category;
        if (category) {
          acc[category] = (acc[category] || 0) + parseFloat(item.price || 0) * item.quantity;
        }
      });
      return acc;
    }, {});

    return {
      totalSales: recentSales.length,
      totalRevenue,
      totalItems,
      salesByCategory,
      sales: recentSales,
    };
  }, [sales, products]);

  const getLowStockProducts = useCallback((threshold: number = 5) => {
    return products.filter((prod) => (prod.stock || 0) <= threshold);
  }, [products]);

  return {
    products,
    categories,
    sales,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    recordSale,
    getSalesReport,
    getLowStockProducts,
    refreshData, // Exportar função de refresh
  };
};