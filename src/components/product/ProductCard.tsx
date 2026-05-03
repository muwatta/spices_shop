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
      className="card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        display: "flex",
        flexDirection: "column",
        background: "white",
        borderRadius: "1rem",
        overflow: "hidden",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--clr-cream-dark)",
      }}
    >
      {/* Image container */}
      <Link href={`/product/${product.id}`} style={{ position: "relative", display: "block", overflow: "hidden" }}>
        <div
          style={{
            position: "relative",
            aspectRatio: "4/3",
            background: "var(--clr-cream-dark)",
            overflow: "hidden",
          }}
        >
          {product.image_url && !imgError ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{
                objectFit: "cover",
                transition: "transform 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
                background: "var(--clr-cream-dark)",
              }}
            >
              🌶
            </div>
          )}

          {/* Stock badges */}
          {isOutOfStock && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: "0.85rem",
                backdropFilter: "blur(2px)",
              }}
            >
              Out of Stock
            </div>
          )}
          {lowStock && !isOutOfStock && (
            <div
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                background: "var(--clr-warning)",
                color: "var(--clr-bark)",
                padding: "0.25rem 0.6rem",
                borderRadius: "2rem",
                fontSize: "0.7rem",
                fontWeight: 700,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              Only {product.stock} left
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div
        style={{
          padding: "1rem",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem",
        }}
      >
        <Link href={`/product/${product.id}`} style={{ textDecoration: "none" }}>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              lineHeight: 1.3,
              color: "var(--clr-bark)",
              marginBottom: "0.15rem",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--clr-muted)",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              marginTop: "0.1rem",
            }}
          >
            {product.description}
          </p>
        )}

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--clr-cream-dark)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "var(--clr-saffron-dark)",
            }}
          >
            {formatNaira(product.price)}
          </span>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleAdd}
            disabled={isOutOfStock}
            style={{
              transition: "all 0.2s ease",
              borderRadius: "2rem",
              padding: "0.45rem 1rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            {added ? (
              "✓ Added"
            ) : (
              <>
                <span style={{ fontSize: "1.1rem" }}>+</span> Cart
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
}