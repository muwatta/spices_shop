import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "About KMA Spices & Herbs",
  description:
    "Learn about KMA Spices & Herbs — premium Nigerian spices, freshly packed and carefully sourced.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: "4rem 1.5rem", maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", marginBottom: "1.5rem" }}>
          About KMA Spices &amp; Herbs
        </h1>

        <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "var(--clr-bark-muted)", marginBottom: "1.25rem" }}>
          KMA Spices &amp; Herbs is a Nigerian spice brand dedicated to bringing authentic,
          high-quality spices and herbs to your kitchen. We believe that great cooking starts
          with great ingredients — and that means freshly packed, 100% natural spices with no
          additives or preservatives.
        </p>

        <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "var(--clr-bark-muted)", marginBottom: "1.25rem" }}>
          Every blend we sell is carefully sourced from trusted growers and prepared with care.
          From our signature curry mixes to our hand-ground suya spice, each product reflects
          our commitment to flavour, freshness, and quality.
        </p>

        <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "var(--clr-bark-muted)", marginBottom: "1.25rem" }}>
          Whether you are cooking jollof rice, pepper soup, suya, or any Nigerian meal, KMA
          Spices &amp; Herbs has the right blend to make it memorable.
        </p>

        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", marginTop: "2rem", marginBottom: "1rem" }}>
          Our Promise
        </h2>

        <ul style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "var(--clr-bark-muted)", paddingLeft: "1.25rem" }}>
          <li>100% natural — no additives or preservatives</li>
          <li>Freshly packed for every order</li>
          <li>Carefully sourced from trusted growers</li>
          <li>Nationwide delivery across Nigeria</li>
        </ul>
      </main>
    </>
  );
}
