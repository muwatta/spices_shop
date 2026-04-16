import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const tabs = [
  { href: "/account/overview", label: "Overview", icon: "📊" },
  { href: "/account/orders", label: "Orders", icon: "🛒" },
  { href: "/account/profile", label: "Profile", icon: "👤" },
  { href: "/account/security", label: "Security", icon: "🔒" },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/account");

  return (
    <>
      <Navbar />
      <main
        style={{
          background: "var(--clr-cream)",
          minHeight: "calc(100vh - 120px)",
        }}
      >
        <div className="container" style={{ padding: "2rem var(--space-md)" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "280px 1fr",
              gap: "1.5rem",
            }}
          >
            <aside className="card" style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.25rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  My Account
                </h2>
                <p
                  style={{
                    color: "var(--clr-muted)",
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                  }}
                >
                  Manage orders, update profile, and secure your account.
                </p>
              </div>
              <nav style={{ display: "grid", gap: "0.5rem" }}>
                {tabs.map((tab) => (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.9rem 1rem",
                      borderRadius: "var(--radius-md)",
                      color: "var(--clr-bark)",
                      background: "var(--clr-cream)",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </Link>
                ))}
              </nav>
            </aside>
            <section>{children}</section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
