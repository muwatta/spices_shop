"use client";

import Link from "next/link";
import Image from "next/image";
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
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div
      className="card fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        transition:
          "transform var(--transition-base), box-shadow var(--transition-base)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "var(--shadow-lg)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "var(--shadow-sm)";
      }}
    >
      {/* Image */}
      <Link
        href={`/product/${product.id}`}
        style={{ display: "block", overflow: "hidden" }}
      >
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
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{
                objectFit: "cover",
                transition: "transform var(--transition-slow)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
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
              }}
            >
              🌶
            </div>
          )}

          {product.stock !== null && product.stock === 0 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 600,
              }}
            >
              Out of Stock
            </div>
          )}
        </div>
      </Link>

      {/* Content – unchanged */}
      <div
        style={{
          padding: "1rem",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <Link href={`/product/${product.id}`}>
          <h3 style={{ fontSize: "1.05rem", color: "var(--clr-bark)" }}>
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--clr-muted)",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.description}
          </p>
        )}

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "0.75rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--clr-saffron-dark)",
            }}
          >
            {formatNaira(product.price)}
          </span>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleAdd}
            disabled={product.stock !== null && product.stock === 0}
            style={{ transition: "all var(--transition-fast)" }}
          >
            {added ? "✓ Added" : "+ Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
