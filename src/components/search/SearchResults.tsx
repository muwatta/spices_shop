"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Product, DoYouKnowItem } from "@/types";
import { formatNaira } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";

function SearchResultCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const isOutOfStock = product.stock !== null && product.stock === 0;

  return (
    <motion.article
      className="product-card"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/product/${product.id}`} className="product-card__image-link">
        <div className="product-card__image-wrapper">
          {product.image_url && !imgError ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 50vw, (max-width: 960px) 33vw, 25vw"
              className="product-card__image"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="product-card__fallback">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--clr-muted)" strokeWidth="1" aria-hidden="true" opacity="0.4">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" />
              </svg>
            </div>
          )}
          {isOutOfStock && (
            <div className="product-card__out-of-stock" role="status">Out of Stock</div>
          )}
        </div>
      </Link>
      <div className="product-card__content">
        <Link href={`/product/${product.id}`} className="product-card__name">
          {product.name}
        </Link>
        {product.description && (
          <p style={{ fontSize: "var(--text-xs)", color: "var(--clr-muted)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {product.description}
          </p>
        )}
        <div className="product-card__footer">
          <span className="product-card__price">{formatNaira(product.price)}</span>
          <button
            className={`btn ${added ? "btn-secondary" : "btn-primary"} btn-sm product-card__add-btn`}
            onClick={handleAdd}
            disabled={isOutOfStock}
          >
            {added ? "Added" : "+ Add"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function SearchResults({
  query,
  products,
  guides,
}: {
  query: string;
  products: Product[];
  guides: DoYouKnowItem[];
}) {
  return (
    <div style={{ display: "grid", gap: "2.5rem" }}>
      <div className="page-header">
        {query ? (
          <>
            <h1 className="page-header__title">
              Search results for &ldquo;{query}&rdquo;
            </h1>
            <p className="page-header__subtitle">
              {products.length} product{products.length !== 1 ? "s" : ""} found
              {guides.length > 0 && ` \u00B7 ${guides.length} guide${guides.length !== 1 ? "s" : ""}`}
            </p>
          </>
        ) : (
          <>
            <h1 className="page-header__title">Search our spices</h1>
            <p className="page-header__subtitle">
              Find products, recipes, and spice guides from the KMA catalog.
            </p>
          </>
        )}
      </div>

      <section>
        <h3 style={{ marginBottom: "1rem", fontSize: "1.125rem" }}>Products</h3>
        {products.length === 0 ? (
          <div className="empty-state" style={{ padding: "2rem" }}>
            <p className="empty-state__description" style={{ margin: 0 }}>
              {query ? `No products matched "${query}". Try a different search.` : "Type something to search for products."}
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <SearchResultCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {guides.length > 0 && (
        <section>
          <h3 style={{ marginBottom: "1rem", fontSize: "1.125rem" }}>Spice Guides</h3>
          <div style={{ display: "grid", gap: "1rem" }}>
            {guides.map((guide) => (
              <motion.article
                key={guide.id}
                className="card"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                style={{ padding: "1.25rem" }}
              >
                <h4 style={{ margin: "0 0 0.35rem", color: "var(--clr-bark)" }}>
                  {guide.name}
                </h4>
                {guide.subtitle && (
                  <p style={{ margin: "0 0 0.5rem", color: "var(--clr-muted)", fontSize: "var(--text-sm)" }}>
                    {guide.subtitle}
                  </p>
                )}
                {guide.recommendation && (
                  <p style={{ margin: 0, color: "var(--clr-bark-mid)", lineHeight: 1.7, fontSize: "var(--text-sm)" }}>
                    {guide.recommendation}
                  </p>
                )}
              </motion.article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
