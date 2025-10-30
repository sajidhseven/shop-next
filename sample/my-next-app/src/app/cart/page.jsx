"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();

  // responsive
  const [isMobile, setIsMobile] = useState(false);

  // auth gate
  const [authChecked, setAuthChecked] = useState(false);

  // cart data from server
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [cartError, setCartError] = useState("");

  // derived totals
  const totalCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) =>
      sum + (item.product?.price ?? 0) * item.qty,
    0
  );

  // responsive watcher
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // ---- helpers to fetch auth + cart ----
  const fetchCart = useCallback(async () => {
    try {
      const cartRes = await fetch("/api/cart", {
        method: "GET",
        cache: "no-store",
      });

      if (!cartRes.ok) {
        const errJson = await cartRes.json().catch(() => ({}));
        setCartError(errJson.error || "Failed to load cart");
        setCartItems([]);
        setLoadingCart(false);
        return;
      }

      const json = await cartRes.json();
      setCartItems(json.items || []);
      setCartError("");
      setLoadingCart(false);
    } catch (err) {
      setCartError("Network error loading cart");
      setCartItems([]);
      setLoadingCart(false);
    }
  }, []);

  // initial auth + cart load
  useEffect(() => {
    let ignore = false;

    async function init() {
      // Check auth
      try {
        const res = await fetch("/api/auth/me", { method: "GET" });
        const data = await res.json();
        if (!data.user) {
          if (!ignore) {
            router.push("/login");
          }
          return;
        }
      } catch {
        if (!ignore) {
          router.push("/login");
        }
        return;
      }

      // load cart
      if (!ignore) {
        await fetchCart();
        setAuthChecked(true);
      }
    }

    init();
    return () => {
      ignore = true;
    };
  }, [router, fetchCart]);

  // helper to broadcast cart change
  function broadcastCartChange() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cart-updated"));
    }
  }

  // REMOVE a line completely
  const handleRemoveItem = useCallback(
    async (cartItemId) => {
      try {
        const res = await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartItemId,
            removeAll: true,
          }),
        });

        if (res.ok) {
          // re-fetch latest cart
          await fetchCart();
          // notify navbar
          broadcastCartChange();
        } else {
          console.error("Failed to remove item");
        }
      } catch (err) {
        console.error("Network error removing item", err);
      }
    },
    [fetchCart]
  );

  // CLEAR cart (remove all items)
  const handleClearCart = useCallback(async () => {
    try {
      // delete all current rows
      await Promise.all(
        cartItems.map((item) =>
          fetch("/api/cart", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cartItemId: item.id,
              removeAll: true,
            }),
          })
        )
      );
      // refresh cart state
      await fetchCart();
      // ping navbar
      broadcastCartChange();
    } catch (err) {
      console.error("Failed to clear cart", err);
    }
  }, [cartItems, fetchCart]);

  // --- render states ---
  if (!authChecked || loadingCart) {
    return (
      <section style={{ padding: 16 }}>
        <p style={{ color: "#666" }}>Loading cart…</p>
      </section>
    );
  }

  if (cartError) {
    return (
      <section style={{ padding: 16 }}>
        <h2>Your cart</h2>
        <p style={{ color: "#c00", fontSize: 14, lineHeight: 1.4 }}>
          {cartError}
        </p>
      </section>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section style={{ padding: 16 }}>
        <h2>Your cart is empty</h2>
        <p style={{ color: "#666" }}>
          Find something you love in the products page.
        </p>
      </section>
    );
  }

  return (
    <section style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>
        Your Cart ({totalCount})
      </h2>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          display: "grid",
          gap: 12,
          margin: 0,
        }}
      >
        {cartItems.map((item) => {
          const prod = item.product || {};
          const subtotal = (prod.price || 0) * item.qty;

          if (!isMobile) {
            // desktop row
            return (
              <li
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "88px 1fr auto",
                  gap: 12,
                  alignItems: "center",
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 12,
                  background: "#fff",
                }}
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  style={{
                    width: 88,
                    height: 88,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 120 }}>
                    <strong style={{ display: "block", lineHeight: 1.3 }}>
                      {prod.name}
                    </strong>
                    <div
                      style={{
                        color: "#666",
                        fontSize: 14,
                        lineHeight: 1.4,
                      }}
                    >
                      Qty: {item.qty}
                    </div>
                  </div>

                  <div
                    style={{
                      fontWeight: 500,
                      fontSize: 16,
                      minWidth: 70,
                      textAlign: "right",
                    }}
                  >
                    ₹{subtotal}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.id)}
                  style={{
                    color: "#0a66c2",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    padding: "6px 8px",
                  }}
                >
                  Remove
                </button>
              </li>
            );
          }

          // mobile card
          return (
            <li
              key={item.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 12,
                background: "#fff",
                display: "grid",
                gridTemplateColumns: "88px 1fr",
                gap: 12,
              }}
            >
              <img
                src={prod.image}
                alt={prod.name}
                style={{
                  width: 88,
                  height: 88,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />

              <div style={{ display: "grid", rowGap: 6 }}>
                <div style={{ fontWeight: 600, lineHeight: 1.4 }}>
                  {prod.name}
                </div>

                <div
                  style={{
                    color: "#666",
                    fontSize: 14,
                    lineHeight: 1.4,
                  }}
                >
                  Qty: {item.qty}
                </div>

                <div
                  style={{
                    fontWeight: 500,
                    fontSize: 16,
                  }}
                >
                  ₹{subtotal}
                </div>

                <button
                  onClick={() => handleRemoveItem(item.id)}
                  style={{
                    width: "100%",
                    textAlign: "center",
                    color: "#0a66c2",
                    background: "none",
                    border: "1px solid #0a66c2",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                    padding: "8px 10px",
                    lineHeight: 1.2,
                    marginTop: 4,
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* summary */}
      <div
        style={{
          marginTop: 24,
          borderTop: "1px solid #eee",
          paddingTop: 16,
          display: "grid",
          rowGap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: 8,
            fontSize: isMobile ? "1rem" : "1.2rem",
          }}
        >
          <span>Total</span>
          <strong>₹{totalPrice}</strong>
        </div>

        <button
          onClick={handleClearCart}
          style={{
            width: isMobile ? "100%" : "auto",
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #222",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
            fontSize: 16,
            lineHeight: 1.2,
          }}
        >
          Checkout (mock)
        </button>
      </div>
    </section>
  );
}
