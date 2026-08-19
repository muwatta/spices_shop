"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Product, CATEGORY_LABELS, ProductCategory } from "@/types";
import { formatNaira } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { useMiniCartStore } from "@/lib/store/miniCart";
import { useState, useCallback } from "react";
import ProductImage from "@/components/ui/ProductImage";

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const { open: openMiniCart } = useMiniCartStore();
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  const isOutOfStock = product.stock !== null && product.stock === 0;
  const isLowStock = product.stock !== null && product.stock > 0 && product.stock <= 5;

  const handleAdd = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isOutOfStock) return;
      addItem(product.id, qty);
      setAdded(true);
      openMiniCart(product as Product, qty);
      setTimeout(() => setAdded(false), 2000);
    },
    [addItem, openMiniCart, product, qty, isOutOfStock],
  );

  const handleQtyChange = useCallback(
    (delta: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setQty((q) => Math.max(1, Math.min(q + delta, product.stock || 99)));
    },
    [product.stock],
  );

  return (
    <motion.article
      className="product-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: Math.min(index * 0.05, 0.3) }}
    >
      {/* Image */}
      <Link href={`/product/${product.id}`} className="product-card__image-link">
        <div className="product-card__image-wrapper">
          <ProductImage
            src={product.image_url}
            alt={product.name}
            category={product.category}
            className="product-card__image"
          />

          {/* Category badge */}
          {product.category && (
            <span className="product-card__category-badge">
              {CATEGORY_LABELS[product.category as ProductCategory] || product.category}
            </span>
          )}

          {/* Stock overlays */}
          {isOutOfStock && (
            <div className="product-card__out-of-stock" role="status">
              Out of Stock
            </div>
          )}
          {isLowStock && !isOutOfStock && (
            <div className="product-card__low-stock" role="status">
              Only {product.stock} left
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="product-card__content">
        <Link href={`/product/${product.id}`} className="product-card__name" tabIndex={-1}>
          {product.name}
        </Link>

        <div className="product-card__footer">
          <span className="product-card__price" aria-label={`Price: ${formatNaira(product.price)}`}>
            {formatNaira(product.price)}
          </span>

          {isOutOfStock ? (
            <span className="product-card__oos-label">Unavailable</span>
          ) : added ? (
            <span className="product-card__added-badge" aria-live="polite">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Added
            </span>
          ) : (
            <div className="product-card__quick-add">
              <div className="product-card__qty" role="group" aria-label="Quantity">
                <button
                  className="product-card__qty-btn"
                  onClick={handleQtyChange(-1)}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="product-card__qty-value" aria-live="polite">{qty}</span>
                <button
                  className="product-card__qty-btn"
                  onClick={handleQtyChange(1)}
                  disabled={qty >= (product.stock || 99)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                className="btn btn-primary btn-sm product-card__add-btn"
                onClick={handleAdd}
                aria-label={`Add ${qty} ${product.name} to cart`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 6h15l-2 9H8L6 4H3" />
                  <circle cx="9" cy="20" r="1.5" fill="currentColor" />
                  <circle cx="18" cy="20" r="1.5" fill="currentColor" />
                </svg>
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
