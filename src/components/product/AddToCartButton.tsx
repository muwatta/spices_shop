"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store/cart";
import { Product } from "@/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--clr-bark-mid)" }}>
          Quantity
        </span>
        <div className="qty-selector">
          <button
            className="qty-selector__btn"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            &minus;
          </button>
          <span className="qty-selector__value">{qty}</span>
          <button
            className="qty-selector__btn"
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <button
        className={`btn btn-lg ${added ? "btn-secondary" : "btn-primary"}`}
        onClick={handleAdd}
        style={{ width: "100%" }}
      >
        {added ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Added to Cart!
          </span>
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6h15l-2 9H8L6 4H3" />
              <circle cx="9" cy="20" r="1.5" fill="currentColor" />
              <circle cx="18" cy="20" r="1.5" fill="currentColor" />
            </svg>
            Add to Cart
          </span>
        )}
      </button>
    </div>
  );
}
