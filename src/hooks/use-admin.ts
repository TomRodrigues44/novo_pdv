import { useState, useEffect, useCallback } from "react";
import { Product, Category } from "@/types/product";
import { products as initialProducts, categories as initialCategories } from "@/data/products";

export const useAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<any[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem("admin_products");
    const savedCategories = localStorage.getItem("admin_categories");
    const savedSales = localStorage.getItem("admin_sales");

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(initialProducts);
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(initialCategories);
    }

    if (savedSales) {
      setSales(JSON.parse(savedSales));
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem("admin_products", JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem("admin_categories", JSON.stringify(categories));
    }
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("admin_sales", JSON.stringify(sales));
  }, [sales]);

  // Gerenciar Categorias
  const addCategory = useCallback((category: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCategory]);
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    );
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    // Remover produtos dessa categoria
    setProducts((prev) => prev.filter((prod) => prod.category !== id));
  }, []);

  // Gerenciar Produtos
  const addProduct = useCallback((product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((prod) => (prod.id === id ? { ...prod, ...updates } : prod))
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((prod) => prod.id !== id));
  }, []);

  const updateStock = useCallback((id: string, quantity: number) => {
    setProducts((prev) =>
      prev.map((prod) =>
        prod.id === id ? { ...prod, stock: quantity, available: quantity > 0 } : prod
      )
    );
  }, []);

  // Registrar venda
  const recordSale = useCallback((saleData: any) => {
    const sale = {
      id: `sale-${Date.now()}`,
      date: new Date().toISOString(),
      ...saleData,
    };
    setSales((prev) => [...prev, sale]);

    // Atualizar estoque
    saleData.items.forEach((item: any) => {
      setProducts((prev) =>
        prev.map((prod) =>
          prod.id === item.id
            ? {
                ...prod,
                stock: (prod.stock || 0) - item.quantity,
                available: (prod.stock || 0) - item.quantity > 0,
              }
            : prod
        )
      );
    });
  }, []);

  // Relatórios
  const getSalesReport = useCallback((days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentSales = sales.filter(
      (sale) => new Date(sale.date) >= cutoffDate
    );

    const totalRevenue = recentSales.reduce(
      (sum, sale) => sum + sale.total,
      0
    );

    const totalItems = recentSales.reduce(
      (sum, sale) => sum + sale.items.length,
      0
    );

    const salesByCategory = recentSales.reduce((acc: any, sale: any) => {
      sale.items.forEach((item: any) => {
        const category = products.find((p) => p.id === item.id)?.category;
        if (category) {
          acc[category] = (acc[category] || 0) + item.price * item.quantity;
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
  };
};