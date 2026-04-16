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
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

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
                Option 2 – Simple Online Shop
              </span>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  lineHeight: 1.05,
                  marginBottom: "1.2rem",
                }}
              >
                A clean, mobile-friendly spice shop with cart, checkout, and
                bank transfer/USSD.
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
                Full product catalog for up to 30 spices, a shopping cart
                experience, easy checkout, proof of payment upload, and WhatsApp
                ordering support — all designed for a starting spice business.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <Link href="#catalog" className="btn btn-primary">
                  Browse spices
                </Link>
                {whatsappNumber ? (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn whatsapp-btn"
                  >
                    💬 Order on WhatsApp
                  </a>
                ) : (
                  <Link href="/cart" className="btn btn-outline">
                    View cart
                  </Link>
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "1rem",
                marginTop: "2rem",
              }}
            >
              <div className="card" style={{ padding: "1.5rem" }}>
                <h2
                  style={{
                    marginBottom: "0.75rem",
                    color: "var(--clr-saffron-dark)",
                  }}
                >
                  Why this price
                </h2>
                <p style={{ color: "var(--clr-bark-mid)", lineHeight: 1.75 }}>
                  More features than a basic listing, while keeping costs low by
                  focusing on bank transfer and USSD payments rather than card
                  processing.
                </p>
                <p style={{ marginTop: "1rem", fontWeight: 700 }}>
                  ₦150,000 — Practical, secure, and ready for mobile customers.
                </p>
              </div>
              <div className="card" style={{ padding: "1.5rem" }}>
                <h2
                  style={{
                    marginBottom: "0.75rem",
                    color: "var(--clr-saffron-dark)",
                  }}
                >
                  How it works
                </h2>
                <ul
                  style={{
                    display: "grid",
                    gap: "0.75rem",
                    color: "var(--clr-bark-mid)",
                    lineHeight: 1.7,
                  }}
                >
                  <li>1. Customer adds spices to cart.</li>
                  <li>2. Chooses bank transfer or USSD.</li>
                  <li>3. Uploads payment proof for verification.</li>
                  <li>4. You confirm and deliver the order.</li>
                </ul>
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
