"use client";

import { useState, useCallback } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useMiniCartStore } from "@/lib/store/miniCart";
import { Product } from "@/types";
import QuantitySelector from "@/components/ui/QuantitySelector";

interface Props {
  product: Product;
  price: string;
}

export default function ProductStickyBar({ product, price }: Props) {
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
    <div className="pd-sticky-bar">
      <div className="pd-sticky-bar__inner">
        <div className="pd-sticky-bar__info">
          <span className="pd-sticky-bar__price">{price}</span>
          <QuantitySelector
            quantity={qty}
            onQuantityChange={setQty}
            min={1}
            max={maxStock}
            size="sm"
          />
        </div>
        <button
          className={`btn ${added ? "btn-secondary" : "btn-primary"} pd-sticky-bar__btn`}
          onClick={handleAdd}
          disabled={added}
          aria-label={`Add ${qty} ${product.name} to cart`}
        >
          {added ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Added!
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 6h15l-2 9H8L6 4H3" />
                <circle cx="9" cy="20" r="1.5" fill="currentColor" />
                <circle cx="18" cy="20" r="1.5" fill="currentColor" />
              </svg>
              Add to Cart
            </>
          )}
        </button>
      </div>

      <style>{`
        .pd-sticky-bar {
          display: block;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 90;
          background: var(--clr-white);
          border-top: 1px solid var(--clr-cream-dark);
          box-shadow: 0 -4px 16px rgba(30, 23, 16, 0.08);
          padding: 0.75rem 1rem;
          padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
        }
        .pd-sticky-bar__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          max-width: var(--max-width);
          margin: 0 auto;
        }
        .pd-sticky-bar__info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }
        .pd-sticky-bar__price {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--clr-bark);
          white-space: nowrap;
        }
        .pd-sticky-bar__btn {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 1.25rem;
          font-size: var(--text-sm);
          font-weight: 600;
          border-radius: var(--radius-full);
          white-space: nowrap;
        }

        @media (min-width: 768px) {
          .pd-sticky-bar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
