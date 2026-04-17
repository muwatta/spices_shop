"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Product, DoYouKnowItem } from "@/types";
import { formatNaira } from "@/lib/utils";

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
    <div style={{ display: "grid", gap: "2rem" }}>
      {query ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h2 style={{ marginBottom: "0.75rem" }}>
            Search results for “{query}”
          </h2>
          <p style={{ color: "var(--clr-bark-mid)", lineHeight: 1.8 }}>
            Search products and wellness guides instantly from the KMA catalog.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h2 style={{ marginBottom: "0.75rem" }}>
            Search for products or tips
          </h2>
          <p style={{ color: "var(--clr-bark-mid)", lineHeight: 1.8 }}>
            Use the search bar to discover matching products, recipes, and
            health benefit guides.
          </p>
        </motion.div>
      )}

      <section style={{ display: "grid", gap: "1rem" }}>
        <h3 style={{ marginBottom: "0.75rem" }}>Products</h3>
        {products.length === 0 ? (
          <div
            style={{
              padding: "1.5rem",
              background: "white",
              borderRadius: "1rem",
              border: "1px solid rgba(0,0,0,0.07)",
            }}
          >
            No products matched your search.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            {products.map((product) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -4 }}
                style={{
                  borderRadius: "1.25rem",
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.08)",
                  padding: "1.25rem",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.04)",
                }}
              >
                <Link href={`/product/${product.id}`}>
                  <h4
                    style={{ margin: "0 0 0.5rem", color: "var(--clr-bark)" }}
                  >
                    {product.name}
                  </h4>
                  <p style={{ margin: "0 0 0.75rem", color: "#666" }}>
                    {product.description}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      color: "var(--clr-saffron)",
                    }}
                  >
                    {formatNaira(product.price)}
                  </p>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      <section style={{ display: "grid", gap: "1rem" }}>
        <h3 style={{ marginBottom: "0.75rem" }}>Health guides</h3>
        {guides.length === 0 ? (
          <div
            style={{
              padding: "1.5rem",
              background: "white",
              borderRadius: "1rem",
              border: "1px solid rgba(0,0,0,0.07)",
            }}
          >
            No Do You Know guides matched your search.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {guides.map((guide) => (
              <motion.article
                key={guide.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -3 }}
                style={{
                  borderRadius: "1.25rem",
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.08)",
                  padding: "1.25rem",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.04)",
                }}
              >
                <h4 style={{ margin: "0 0 0.5rem", color: "var(--clr-bark)" }}>
                  {guide.name}
                </h4>
                {guide.subtitle && (
                  <p style={{ margin: "0 0 0.75rem", color: "#666" }}>
                    {guide.subtitle}
                  </p>
                )}
                <p
                  style={{
                    margin: 0,
                    color: "var(--clr-bark-mid)",
                    lineHeight: 1.8,
                  }}
                >
                  {guide.recommendation}
                </p>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
