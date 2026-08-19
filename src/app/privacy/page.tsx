import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Privacy Policy — KMA Spices & Herbs",
  description: "Privacy policy for KMA Spices & Herbs online store.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: "4rem 1.5rem", maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", marginBottom: "1.5rem" }}>
          Privacy Policy
        </h1>

        <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--clr-bark-muted)", marginBottom: "1.25rem" }}>
          Last updated: August 2026
        </p>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.75rem" }}>
            1. Information We Collect
          </h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--clr-bark-muted)" }}>
            When you create an account or place an order, we may collect your name, email address, phone number,
            and delivery address. We also collect basic usage data (browser type, pages visited) to improve
            our website experience.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.75rem" }}>
            2. How We Use Your Information
          </h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--clr-bark-muted)" }}>
            We use your information to process orders, communicate about your deliveries, improve our products
            and services, and send occasional updates about new products or promotions (only if you opt in).
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.75rem" }}>
            3. Data Sharing
          </h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--clr-bark-muted)" }}>
            We do not sell or rent your personal information to third parties. We may share your delivery
            details with our courier partners solely to fulfil your order. All payment processing is handled
            securely and we do not store your financial information.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.75rem" }}>
            4. Data Security
          </h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--clr-bark-muted)" }}>
            We implement appropriate security measures to protect your personal information. Your data is
            stored on secure servers provided by Supabase and access is restricted to authorised personnel only.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.75rem" }}>
            5. Cookies
          </h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--clr-bark-muted)" }}>
            Our website uses local storage to remember your cart contents and preferences. We do not use
            third-party tracking cookies or advertising cookies.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.75rem" }}>
            6. Your Rights
          </h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--clr-bark-muted)" }}>
            You have the right to access, update, or delete your personal information. To exercise these
            rights, please contact us via WhatsApp or email us at kmafoods22@gmail.com.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.75rem" }}>
            7. Contact
          </h2>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--clr-bark-muted)" }}>
            For questions about this privacy policy, please reach out via WhatsApp or email us at kmafoods22@gmail.com.
          </p>
        </section>
      </main>
    </>
  );
}
