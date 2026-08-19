"use client";

import { useState, useCallback } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useMiniCartStore } from "@/lib/store/miniCart";
import { Product } from "@/types";
import QuantitySelector from "@/components/ui/QuantitySelector";

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const openMiniCart = useMiniCartStore((s) => s.open);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const maxStock = product.stock || 99;

  const handleAdd = useCallback(() => {
    addItem(product.id, qty, product.stock);
    setAdded(true);
    openMiniCart(product, qty);
    setTimeout(() => setAdded(false), 2000);
  }, [addItem, openMiniCart, product, qty]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--clr-bark-mid)" }}>
          Quantity
        </span>
        <QuantitySelector
          quantity={qty}
          onQuantityChange={setQty}
          min={1}
          max={maxStock}
        />
      </div>

      <button
        className={`btn btn-lg ${added ? "btn-secondary" : "btn-primary"}`}
        onClick={handleAdd}
        disabled={added}
        style={{ width: "100%" }}
        aria-label={`Add ${qty} ${product.name} to cart`}
      >
        {added ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Added to Cart!
          </span>
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
