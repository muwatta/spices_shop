"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { DoYouKnowItem } from "@/types";

const imageMap: Record<string, string> = {
  "Curry Mix 2000": "/images/curry_mix.png",
  "Mixed spices 2500": "/images/mixed_spices.png",
  "Ginger Powder 2500": "/images/ginger_powder.jpeg",
  "Italian Spice 2000": "/images/spies_herbs.jpeg",
  "Signature Spice 2500": "/images/mixed_spices_1.jpeg",
  "Garam Masala 2500": "/images/curry_mix1.jpeg",
  "Cardamom 5000": "/images/cardamom.jpeg",
  "Dry Okro Powder 3500": "/images/dry_okra.jpeg",
  "Baobab Powder (Kuka) 2000": "/images/bacbab.jpeg",
};

function getCardImage(item: DoYouKnowItem) {
  return item.image_url || imageMap[item.name] || "/images/kma_leaf.jpeg";
}

export default function DoYouKnowGrid({ items }: { items: DoYouKnowItem[] }) {
  return (
    <section
      style={{
        display: "grid",
        gap: "1.5rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
      }}
    >
      {items.map((item) => (
        <motion.article
          key={item.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            borderRadius: "1.5rem",
            overflow: "hidden",
            background: "rgba(255,255,255,0.97)",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.05)",
            display: "grid",
            gap: "1rem",
          }}
        >
          <div style={{ position: "relative", minHeight: "240px" }}>
            <Image
              src={getCardImage(item)}
              alt={item.name}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 100vw, 420px"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div
            style={{ padding: "1.35rem 1.5rem", display: "grid", gap: "1rem" }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--clr-saffron)",
                  fontWeight: 700,
                }}
              >
                Wellness tip
              </p>
              <h2
                style={{
                  margin: "0.65rem 0 0",
                  fontFamily: "var(--font-display)",
                  fontSize: "1.55rem",
                  lineHeight: 1.1,
                }}
              >
                {item.name}
              </h2>
              {item.subtitle && (
                <p
                  style={{
                    marginTop: "0.85rem",
                    color: "var(--clr-bark-mid)",
                    lineHeight: 1.75,
                  }}
                >
                  {item.subtitle}
                </p>
              )}
            </div>

            {item.benefits ? (
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: "var(--clr-bark)",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}
                >
                  Benefits
                </h3>
                <ul
                  style={{
                    margin: "0.75rem 0 0",
                    paddingLeft: "1.1rem",
                    color: "var(--clr-bark-mid)",
                    lineHeight: 1.8,
                  }}
                >
                  {item.benefits.split("\n").map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {item.recommendation ? (
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: "var(--clr-saffron)",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}
                >
                  Recommendation
                </h3>
                <p
                  style={{
                    marginTop: "0.75rem",
                    color: "var(--clr-bark-mid)",
                    lineHeight: 1.75,
                  }}
                >
                  {item.recommendation}
                </p>
              </div>
            ) : null}
          </div>
        </motion.article>
      ))}
    </section>
  );
}
