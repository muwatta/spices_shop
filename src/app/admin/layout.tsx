import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/products", label: "Products", icon: "🌶" },
  { href: "/admin/do-you-know", label: "Do You Know", icon: "📘" },
  { href: "/admin/reports", label: "Reports", icon: "📈" },
];

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
    <div className="admin-shell">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span>🌶</span>
          <span className="admin-sidebar__brand-text">KMA Admin</span>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="admin-sidebar__link"
            >
              <span className="admin-sidebar__icon">{item.icon}</span>
              <span className="admin-sidebar__label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <Link href="/" className="admin-sidebar__back">
            ← View Shop
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="admin-main">{children}</main>

      <style>{`
        /* ════════════════════════════════
           Shell — full viewport, no scroll on outer
        ════════════════════════════════ */
        .admin-shell {
          display: flex;
          min-height: 100vh;
          background: #F3EFE9;
          position: relative;
        }

        /* ════════════════════════════════
           SIDEBAR
        ════════════════════════════════ */
        .admin-sidebar {
          width: 56px;               /* icon-only on mobile */
          background: var(--clr-bark);
          color: var(--clr-cream);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
          transition: width 250ms ease;
          z-index: 50;
        }

        /* Expand on hover — desktop progressive disclosure */
        @media (hover: hover) {
          .admin-sidebar:hover {
            width: 220px;
          }
          .admin-sidebar:hover .admin-sidebar__brand-text,
          .admin-sidebar:hover .admin-sidebar__label,
          .admin-sidebar:hover .admin-sidebar__back {
            opacity: 1;
            width: auto;
          }
        }

        /* Brand row */
        .admin-sidebar__brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
          white-space: nowrap;
          overflow: hidden;
        }
        .admin-sidebar__brand span:first-child {
          font-size: 1.4rem;
          flex-shrink: 0;
        }
        .admin-sidebar__brand-text {
          font-family: var(--font-display);
          color: var(--clr-saffron);
          font-size: 1rem;
          font-weight: 700;
          opacity: 0;
          width: 0;
          overflow: hidden;
          transition: opacity 200ms ease, width 200ms ease;
        }

        /* Nav links */
        .admin-sidebar__nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0.75rem 0.5rem;
          flex: 1;
          overflow: hidden;
        }
        .admin-sidebar__link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.5rem;
          border-radius: var(--radius-md);
          color: rgba(253,246,236,0.75);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          transition: background 150ms ease, color 150ms ease;
        }
        .admin-sidebar__link:hover {
          background: rgba(232,160,32,0.15);
          color: var(--clr-saffron);
        }
        .admin-sidebar__icon {
          font-size: 1.1rem;
          flex-shrink: 0;
          width: 24px;
          text-align: center;
        }
        .admin-sidebar__label {
          opacity: 0;
          width: 0;
          overflow: hidden;
          transition: opacity 200ms ease, width 200ms ease;
        }

        /* Footer */
        .admin-sidebar__footer {
          padding: 1rem 0.5rem;
          border-top: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
          overflow: hidden;
        }
        .admin-sidebar__back {
          display: block;
          font-size: 0.78rem;
          color: rgba(253,246,236,0.35);
          text-decoration: none;
          opacity: 0;
          white-space: nowrap;
          transition: opacity 200ms ease, color 150ms ease;
        }
        .admin-sidebar__back:hover {
          color: rgba(253,246,236,0.7);
        }

        /* ════════════════════════════════
           MAIN
        ════════════════════════════════ */
        .admin-main {
          flex: 1;
          overflow-y: auto;
          min-width: 0;          /* prevents flex blowout */
          padding: 1.5rem 1rem;
        }

        /* ════════════════════════════════
           MD — 768px: wider sidebar, always visible labels
        ════════════════════════════════ */
        @media (min-width: 768px) {
          .admin-sidebar {
            width: 200px;
          }
          .admin-sidebar__brand-text,
          .admin-sidebar__label,
          .admin-sidebar__back {
            opacity: 1;
            width: auto;
          }
          .admin-sidebar__nav {
            padding: 0.75rem;
          }
          .admin-sidebar__link {
            padding: 0.65rem 0.875rem;
          }
          .admin-sidebar__footer {
            padding: 1rem;
          }
          .admin-main {
            padding: 2rem 1.5rem;
          }
        }

        /* ════════════════════════════════
           LG — 1024px: comfortable sidebar
        ════════════════════════════════ */
        @media (min-width: 1024px) {
          .admin-sidebar {
            width: 220px;
          }
          .admin-main {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
