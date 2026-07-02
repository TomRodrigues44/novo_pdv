export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category_id: number | null;
  category_name: string | null;
  image_url: string | null;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: number;
  total_amount: number;
  payment_method: string;
  created_at: string;
}