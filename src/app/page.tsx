import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import { Product } from "@/types";

export default async function HomePage() {
  const supabase = createClient();
  const { data: productData } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(12);

  const products = (productData ?? []) as Product[];

  return (
    <>
      <Navbar />
      <main>
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
                transfer, cash delivery, or WhatsApp at +2347016186356.
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

        <section id="catalog" style={{ padding: "3rem 0" }}>
          <div
            className="container"
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
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
                  Designed for Nigerian spice brands: fast browsing, clear
                  product cards, and a checkout flow built for cash, bank
                  transfer, and USSD customers.
                </p>
              </div>
              <Link
                href="/cart"
                className="btn btn-outline"
                style={{ whiteSpace: "nowrap" }}
              >
                View cart
              </Link>
            </div>

            {products.length === 0 ? (
              <div
                className="card"
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--clr-muted)",
                }}
              >
                No products are published yet. Add your spices in the admin
                panel to show them here.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
