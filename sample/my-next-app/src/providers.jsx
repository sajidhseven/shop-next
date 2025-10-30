"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

const CartCtx = createContext(null);

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside <Providers>");
  return ctx;
}

export default function Providers({ children }) {
  // cart state shape:
  // items: [{ id, name, image, price, qty }]
  // count, total derived
  const [items, setItems] = useState([]);

  // auth state
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // loading states
  const [cartLoading, setCartLoading] = useState(false);

  // 1. check who is logged in when app mounts (client side)
  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!ignore) {
          setUser(data.user || null);
        }
      } catch {
        if (!ignore) {
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setAuthChecked(true);
        }
      }
    }

    loadUser();
    return () => {
      ignore = true;
    };
  }, []);

  // helper: compute totals any time items change
  const total = useMemo(
    () => items.reduce((sum, p) => sum + p.price * p.qty, 0),
    [items]
  );

  const count = useMemo(
    () => items.reduce((sum, p) => sum + p.qty, 0),
    [items]
  );

  // fetch cart from server if logged in
  const fetchCartFromServer = useCallback(async () => {
    if (!user) return; // not logged in, skip
    setCartLoading(true);

    try {
      const res = await fetch("/api/cart", { method: "GET" });
      if (!res.ok) {
        // 401 etc: user not logged in / token expired
        return;
      }
      const data = await res.json();
      // normalize: data.items should already be [{id,name,image,price,qty}...]
      setItems(data.items || []);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  // on first auth check, if logged in -> load cart from DB
  useEffect(() => {
    if (!authChecked) return; // wait until we know user/null
    if (user) {
      fetchCartFromServer();
    } else {
      // guest mode: either start empty or pull from localStorage as fallback
      try {
        const raw = localStorage.getItem("mini_cart_guest");
        if (raw) {
          setItems(JSON.parse(raw));
        }
      } catch {
        // ignore
      }
    }
  }, [authChecked, user, fetchCartFromServer]);

  // persist guest cart to localStorage if not logged in
  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      try {
        localStorage.setItem("mini_cart_guest", JSON.stringify(items));
      } catch {
        // ignore
      }
    }
  }, [items, user, authChecked]);

  // add to cart
  const add = useCallback(
    async (product, qty = 1) => {
      // if logged in -> call API then refresh
      if (user) {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            qty,
          }),
        });
        await fetchCartFromServer();
        return;
      }

      // guest mode -> local state only
      setItems((prev) => {
        const i = prev.findIndex((p) => p.id === product.id);
        if (i >= 0) {
          const copy = [...prev];
          copy[i] = { ...copy[i], qty: copy[i].qty + qty };
          return copy;
        }
        return [...prev, { ...product, qty }];
      });
    },
    [user, fetchCartFromServer]
  );

  // remove single product from cart
  const remove = useCallback(
    async (productId) => {
      if (user) {
        await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        await fetchCartFromServer();
        return;
      }

      // guest mode
      setItems((prev) => prev.filter((p) => p.id !== productId));
    },
    [user, fetchCartFromServer]
  );

  // clear entire cart
  const clear = useCallback(async () => {
    if (user) {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearAll: true }),
      });
      await fetchCartFromServer();
      return;
    }

    // guest mode
    setItems([]);
  }, [user, fetchCartFromServer]);

  const value = useMemo(
    () => ({
      user,
      authChecked,
      cartLoading,
      items,
      add,
      remove,
      clear,
      total,
      count,
    }),
    [
      user,
      authChecked,
      cartLoading,
      items,
      add,
      remove,
      clear,
      total,
      count,
    ]
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
