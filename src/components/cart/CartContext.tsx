"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  cartCount,
  cartItemKey,
  cartSubtotal,
  readCart,
  writeCart,
  type CartItem,
} from "@/lib/cart";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  // 首次挂载才读 localStorage，避免服务端渲染和客户端不一致的 hydration 报错
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeCart(items);
  }, [items, hydrated]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const key = cartItemKey(item);
      const existing = prev.find((p) => cartItemKey(p) === key);
      if (existing) {
        return prev.map((p) =>
          cartItemKey(p) === key
            ? { ...p, quantity: p.quantity + item.quantity }
            : p,
        );
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (key: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((p) => cartItemKey(p) !== key)
        : prev.map((p) => (cartItemKey(p) === key ? { ...p, quantity } : p)),
    );
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((p) => cartItemKey(p) !== key));
  };

  const clear = () => setItems([]);

  return (
    <CartContext.Provider
      value={{
        items,
        count: cartCount(items),
        subtotal: cartSubtotal(items),
        addItem,
        updateQuantity,
        removeItem,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
