"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext(null);

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside <Providers>");
  return ctx;
}

export default function Providers({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mini_cart");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("mini_cart", JSON.stringify(items)); } catch {}
  }, [items]);

  const add = (product, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === product.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { ...product, qty }];
    });
  };

  const remove = (id) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clear = () => setItems([]);
  const total = useMemo(() => items.reduce((s, p) => s + p.price * p.qty, 0), [items]);
  const count = useMemo(() => items.reduce((s, p) => s + p.qty, 0), [items]);

  const value = useMemo(() => ({ items, add, remove, clear, total, count }), [items, total, count]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
