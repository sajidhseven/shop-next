"use client";

import { useState, useCallback } from "react";

export default function ProductCard({ product }) {
  const [adding, setAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAddToCart = useCallback(async () => {
    if (adding) return;
    setAdding(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          qty: 1,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Could not add to cart");
      } else {
        // tell Navbar + any listeners (CartPage) to refresh their data
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cart-updated"));
        }
      }
    } catch (err) {
      setErrorMsg("Network error");
    } finally {
      setAdding(false);
    }
  }, [adding, product.id]);

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 12,
        background: "#fff",
        boxShadow: "0 20px 40px rgba(0,0,0,0.03)",
        padding: 12,
        display: "grid",
        rowGap: 8,
      }}
    >
      {/* product image */}
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          backgroundColor: "#fafafa",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* name */}
      <div
        style={{
          fontWeight: 600,
          fontSize: 15,
          lineHeight: 1.4,
        }}
      >
        {product.name}
      </div>

      {/* price */}
      <div
        style={{
          fontWeight: 500,
          fontSize: 15,
        }}
      >
        ₹{product.price}
      </div>

      {/* error if add failed */}
      {errorMsg && (
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.4,
            color: "#c00",
            background: "#fff5f5",
            border: "1px solid #ffcccc",
            borderRadius: 6,
            padding: "6px 8px",
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Add to Cart button */}
      <button
        onClick={handleAddToCart}
        disabled={adding}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #111",
          background: adding ? "#555" : "#111",
          color: "#fff",
          lineHeight: 1.2,
          fontSize: 14,
          fontWeight: 500,
          cursor: adding ? "default" : "pointer",
          opacity: adding ? 0.8 : 1,
        }}
      >
        {adding ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
}
