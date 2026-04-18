import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero section – static, no suspense */}
        <section
          style={{
            padding: "4rem 0 2rem",
            background:
              "linear-gradient(180deg, rgba(232, 160, 32, 0.12), rgba(253, 246, 236, 0.95))",
          }}
        >
          <div className="container" style={{ display: "grid", gap: "2rem" }}>
            <div style={{ maxWidth: "720px" }}>
              <span
                style={{
                  display: "inline-block",
                  marginBottom: "1rem",
                  color: "var(--clr-saffron-dark)",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontSize: "0.825rem",
                }}
              >
                KMA Spices and Herbs
              </span>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  lineHeight: 1.05,
                  marginBottom: "1.2rem",
                }}
              >
                Pure, premium spices that bring rich flavor and natural wellness
                to every meal.
              </h1>
              <p
                style={{
                  maxWidth: "42rem",
                  color: "var(--clr-bark-mid)",
                  fontSize: "1.05rem",
                  lineHeight: 1.8,
                  marginBottom: "1.75rem",
                }}
              >
                Discover carefully sourced spices, herbs, flours, condiments,
                foodsuff and unadulterated oils. Order securely with bank
                transfer, cash delivery.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <Link href="#catalog" className="btn btn-primary">
                  Browse products
                </Link>
                <Link href="/do-you-know" className="btn btn-outline">
                  Do you Know
                </Link>
                <Link href="/cart" className="btn btn-outline">
                  View cart
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog section with lazy loading */}
        <section id="catalog" style={{ padding: "3rem 0" }}>
          <div className="container">
            <div style={{ marginBottom: "2rem" }}>
              <p
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--clr-saffron-dark)",
                  fontSize: "0.85rem",
                  marginBottom: "0.5rem",
                }}
              >
                Catalog preview
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  margin: 0,
                }}
              >
                Fresh spices ready to sell.
              </h2>
              <p
                style={{
                  color: "var(--clr-muted)",
                  marginTop: "0.75rem",
                  maxWidth: "38rem",
                }}
              >
                Designed for Nigerian spice brands: fast browsing, clear product
                cards, and a checkout flow built for cash, bank transfer, and
                USSD customers.
              </p>
            </div>

            <Suspense fallback={<ProductCardSkeleton />}>
              <ProductGrid />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
