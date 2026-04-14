import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    redirect("/admin-login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F5F1" }}>
      <aside
        style={{
          width: "220px",
          background: "var(--clr-bark)",
          color: "var(--clr-cream)",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--clr-saffron)",
            fontSize: "1.2rem",
            fontWeight: 700,
            padding: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          🌶 Admin
        </div>

        {[
          { href: "/admin", label: "📊 Dashboard" },
          { href: "/admin/orders", label: "📦 Orders" },
          { href: "/admin/products", label: "🌶 Products" },
          { href: "/admin/reports", label: "📊 Reports" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: "0.625rem 0.75rem",
              borderRadius: "var(--radius-md)",
              color: "rgba(253,246,236,0.85)",
              fontSize: "0.9rem",
              fontWeight: 500,
              transition: "all var(--transition-fast)",
            }}
          >
            {item.label}
          </Link>
        ))}

        <div style={{ marginTop: "auto" }}>
          <Link
            href="/"
            style={{ fontSize: "0.8rem", color: "rgba(253,246,236,0.45)" }}
          >
            ← View Shop
          </Link>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: "auto" }}>{children}</main>
    </div>
  );
}
