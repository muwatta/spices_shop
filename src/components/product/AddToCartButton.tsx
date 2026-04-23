'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store/cart';
import { Product } from '@/types';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Quantity selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--clr-muted)' }}>Quantity</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '2px solid var(--clr-cream-dark)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            style={{ padding: '0.5rem 1rem', background: 'var(--clr-cream-dark)', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--clr-bark)' }}
          >
            −
          </button>
          <span style={{ padding: '0.5rem 1.25rem', fontWeight: 600, background: 'white', minWidth: '3rem', textAlign: 'center' }}>{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            style={{ padding: '0.5rem 1rem', background: 'var(--clr-cream-dark)', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--clr-bark)' }}
          >
            +
          </button>
        </div>
      </div>

      <button
        className="btn btn-primary btn-lg"
        onClick={handleAdd}
        style={{ width: '100%' }}
      >
        {added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
      </button>
    </div>
  );
}
