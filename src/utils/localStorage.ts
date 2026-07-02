import { Product, Category } from '@/types';

const PRODUCTS_KEY = 'emporio_products';
const CATEGORIES_KEY = 'emporio_categories';

export const localStorageUtils = {
  // Products
  getProducts: (): Product[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  setProducts: (products: Product[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  // Categories
  getCategories: (): Category[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(CATEGORIES_KEY);
    return data ? JSON.parse(data) : [];
  },

  setCategories: (categories: Category[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  },

  // Import data
  importProducts: (data: string) => {
    try {
      const products = JSON.parse(data);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      return true;
    } catch (error) {
      console.error('Error importing products:', error);
      return false;
    }
  },

  importCategories: (data: string) => {
    try {
      const categories = JSON.parse(data);
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
      return true;
    } catch (error) {
      console.error('Error importing categories:', error);
      return false;
    }
  },

  // Clear all data
  clearAll: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PRODUCTS_KEY);
    localStorage.removeItem(CATEGORIES_KEY);
  },
};