export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  category_name: string | null;
  image: string;
  available: boolean;
  stock: number;
  fiscal?: {
    ncm: string;
    cfop: string;
    cest: string;
    unidade: string;
    icms: number;
    ipi: number;
    pis: number;
    cofins: number;
    origem: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  active?: boolean;
  created_at?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Sale {
  id: number;
  total_amount: number;
  payment_method: string;
  created_at: string;
}