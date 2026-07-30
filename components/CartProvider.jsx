"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "rimara-cart-v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) setItems(saved);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  function addItem(item) {
    setItems((current) => {
      const index = current.findIndex((entry) => entry.id === item.id && entry.size === item.size);
      if (index < 0) return [...current, { ...item, quantity: 1 }];
      return current.map((entry, entryIndex) => entryIndex === index ? { ...entry, quantity: entry.quantity + 1 } : entry);
    });
  }

  function updateQuantity(id, size, quantity) {
    if (quantity < 1) return removeItem(id, size);
    setItems((current) => current.map((item) => item.id === id && item.size === size ? { ...item, quantity } : item));
  }

  function removeItem(id, size) {
    setItems((current) => current.filter((item) => !(item.id === id && item.size === size)));
  }

  const value = useMemo(() => ({
    items,
    ready,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    addItem,
    updateQuantity,
    removeItem,
    clearCart: () => setItems([])
  }), [items, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside CartProvider");
  return cart;
}
