import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Terms of Service — KMA Spices & Herbs",
  description: "Terms of service for KMA Spices & Herbs online store.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: "4rem 1.5rem", maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", marginBottom: "1.5rem" }}>
          Terms of Service
        </h1>

        <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--clr-bark-muted)", marginBottom: "1.25rem" }}>
          Last updated: August 2026
        </p>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.75rem" }}>
            1. Acceptance of Terms
          </h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--clr-bark-muted)" }}>
            By accessing and using the KMA Spices &amp; Herbs website, you agree to be bound by these Terms of Service.
            If you do not agree with any part of these terms, please do not use our website.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.75rem" }}>
            2. Products
          </h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--clr-bark-muted)" }}>
            We make every effort to display product descriptions, images, and prices accurately. However, we cannot
            guarantee that all information is error-free. Product images are for illustration purposes and may differ
            slightly from the actual product.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.75rem" }}>
            3. Orders &amp; Payment
          </h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--clr-bark-muted)" }}>
            Orders can be placed through our website. We accept bank transfer and cash on delivery as payment methods.
            Orders are subject to availability and confirmation of the order price. We reserve the right to cancel
            any order if the product is out of stock or if we suspect fraudulent activity.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.75rem" }}>
            4. Delivery
          </h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--clr-bark-muted)" }}>
            We deliver nationwide across Nigeria. A flat delivery fee of ₦1,500 applies to orders under ₦15,000.
            Delivery times are estimates and may vary depending on your location. We are not responsible for
            delays caused by courier services or unforeseen circumstances.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.75rem" }}>
            5. Returns &amp; Refunds
          </h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--clr-bark-muted)" }}>
            Due to the nature of our products (food items), we generally do not accept returns once delivered.
            If you receive a damaged or incorrect item, please contact us within 24 hours of delivery with
            photographic evidence, and we will arrange a replacement or refund.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.75rem" }}>
            6. Limitation of Liability
          </h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--clr-bark-muted)" }}>
            KMA Spices &amp; Herbs shall not be liable for any indirect, incidental, or consequential damages
            arising from the use of our products or website. Our liability is limited to the amount paid for
            the specific product in question.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.75rem" }}>
            7. Contact
          </h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--clr-bark-muted)" }}>
            For questions about these terms, please reach out via WhatsApp or email us at kmafoods22@gmail.com.
          </p>
        </section>
      </main>
    </>
  );
}
