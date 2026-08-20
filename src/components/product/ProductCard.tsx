"use client";

import Link from "next/link";
import { Product, CATEGORY_LABELS, ProductCategory } from "@/types";
import { formatNaira } from "@/lib/utils";
import { getFallbackImage } from "@/lib/fallback-images";
import { useCartStore } from "@/lib/store/cart";
import { useMiniCartStore } from "@/lib/store/miniCart";
import { useState, useCallback } from "react";
import ProductImage from "@/components/ui/ProductImage";
import { motion } from "framer-motion";

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const { open: openMiniCart } = useMiniCartStore();
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const isOutOfStock = product.stock !== null && product.stock === 0;
  const isLowStock = product.stock !== null && product.stock > 0 && product.stock <= 5;

  const handleAdd = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isOutOfStock) return;
      addItem(product.id, 1, product.stock);
      setAdded(true);
      openMiniCart(product as Product, 1);
      setTimeout(() => setAdded(false), 2000);
    },
    [addItem, openMiniCart, product, isOutOfStock],
  );

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setWishlisted((prev) => !prev);
    },
    [],
  );

  return (
    <motion.article
      className="product-card"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.035, 0.28) }}
    >
      <Link href={`/product/${product.id}`} className="product-card__image-link">
        <div className="product-card__image-wrapper">
          <ProductImage
            src={product.image_url || getFallbackImage(product.name)}
            alt={product.name}
            category={product.category}
            className="product-card__image"
          />

          {product.category && (
            <span className="product-card__category-badge">
              {CATEGORY_LABELS[product.category as ProductCategory] || product.category}
            </span>
          )}

          {product.images?.length > 0 && (
            <span className="product-card__gallery-count" aria-label={`${product.images.length + 1} product photos`}>
              {product.images.length + 1} photos
            </span>
          )}

          <button
            className={`product-card__wishlist ${wishlisted ? "product-card__wishlist--active" : ""}`}
            onClick={handleWishlist}
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            aria-pressed={wishlisted}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {isOutOfStock && (
            <div className="product-card__out-of-stock" role="status">
              Sold Out
            </div>
          )}
          {isLowStock && !isOutOfStock && (
            <div className="product-card__low-stock" role="status">
              Only {product.stock} left
            </div>
          )}
        </div>
      </Link>

      <div className="product-card__content">
        <Link href={`/product/${product.id}`} className="product-card__name" tabIndex={-1}>
          {product.name}
        </Link>

        {product.description && (
          <p className="product-card__description">{product.description}</p>
        )}

        {product.stock !== null && (
          <span className={`product-card__stock ${isLowStock ? "product-card__stock--low" : ""}`}>
            {product.stock} left in stock
          </span>
        )}

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
            <button
              className="btn btn-primary btn-sm product-card__add-btn"
              onClick={handleAdd}
              aria-label={`Add ${product.name} to cart`}
              title="Add to cart"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 6h15l-2 9H8L6 4H3" />
                <circle cx="9" cy="20" r="1.5" fill="currentColor" />
                <circle cx="18" cy="20" r="1.5" fill="currentColor" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
