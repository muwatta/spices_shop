"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { formatNaira } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { useState } from "react";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  function handleAdd() {
    addItem(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const isOutOfStock = product.stock !== null && product.stock === 0;
  const lowStock = product.stock !== null && product.stock > 0 && product.stock <= 5;

  return (
    <motion.article
      className="card product-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ border: "1px solid var(--clr-cream-dark)" }}
    >
      {/* Image container */}
      <Link href={`/product/${product.id}`} className="product-card__image-link">
        <div className="product-card__image-wrapper">
          {product.image_url && !imgError ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="product-card__image"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="product-card__fallback">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--clr-muted)" strokeWidth="1.5" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" />
              </svg>
            </div>
          )}

          {/* Stock badges */}
          {isOutOfStock && (
            <div className="product-card__out-of-stock" role="status">
              Out of Stock
            </div>
          )}
          {lowStock && !isOutOfStock && (
            <div className="product-card__low-stock" role="status">
              Only {product.stock} left
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="product-card__content">
        <Link href={`/product/${product.id}`} className="product-card__name">
          {product.name}
        </Link>

        {product.description && (
          <p className="product-card__description">
            {product.description}
          </p>
        )}

        <div className="product-card__footer">
          <span className="product-card__price">
            {formatNaira(product.price)}
          </span>

          <button
            className="btn btn-primary btn-sm product-card__add-btn"
            onClick={handleAdd}
            disabled={isOutOfStock}
          >
            {added ? (
              "Added"
            ) : (
              <>
                <span aria-hidden="true">+</span> Cart
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
