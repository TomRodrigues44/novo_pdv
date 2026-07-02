import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CartItem, Product } from "@/types/product";

interface CartItemWithFlavors extends CartItem {
  flavors?: string[];
}

interface CartContextType {
  cartItems: CartItemWithFlavors[];
  addToCart: (product: Product, flavors?: string[]) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItemWithFlavors[]>([]);

  const addToCart = useCallback((product: Product, flavors?: string[]) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => 
        item.id === product.id && 
        JSON.stringify(item.flavors) === JSON.stringify(flavors)
      );
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id && JSON.stringify(item.flavors) === JSON.stringify(flavors)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prevItems, { ...product, quantity: 1, flavors }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};