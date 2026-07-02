import { Product, Category } from '@/types/product';

export const localStorageUtils = {
  getProducts: (): Product[] => {
    try {
      const data = localStorage.getItem('admin_products');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading products from localStorage:', error);
      return [];
    }
  },

  getCategories: (): Category[] => {
    try {
      const data = localStorage.getItem('admin_categories');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading categories from localStorage:', error);
      return [];
    }
  },

  getSales: (): any[] => {
    try {
      const data = localStorage.getItem('admin_sales');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading sales from localStorage:', error);
      return [];
    }
  },
};