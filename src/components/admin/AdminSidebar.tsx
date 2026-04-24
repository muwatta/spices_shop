"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/products", label: "Products", icon: "🌶" },
  { href: "/admin/do-you-know", label: "Do You Know", icon: "📘" },
  { href: "/admin/reports", label: "Reports", icon: "📈" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* ── Mobile top bar ── */}
      <header className="admin-topbar">
        <button
          className="admin-topbar__hamburger"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <span className="admin-topbar__title">🌶 KMA Admin</span>
        <Link href="/" className="admin-topbar__shop">
          View Shop
        </Link>
      </header>

      {/* ── Overlay ── */}
      {open && <div className="admin-overlay" onClick={() => setOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${open ? "admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__brand">
            <span>🌶</span>
            <span>KMA Admin</span>
          </div>
          <button
            className="admin-sidebar__close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`}
              >
                <span className="admin-sidebar__icon">{item.icon}</span>
                <span className="admin-sidebar__label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <Link href="/" className="admin-sidebar__back">
            ← View Shop
          </Link>
        </div>
      </aside>

      <style>{`
        /* ════════════════════════════════
           MOBILE TOP BAR (< 768px only)
        ════════════════════════════════ */
        .admin-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--clr-bark);
          color: var(--clr-cream);
          padding: 0.75rem 1rem;
          position: sticky;
          top: 0;
          z-index: 40;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .admin-topbar__hamburger {
          background: none;
          border: none;
          color: var(--clr-cream);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0.25rem;
        }
        .admin-topbar__title {
          font-family: var(--font-display);
          color: var(--clr-saffron);
          font-size: 1rem;
          font-weight: 700;
        }
        .admin-topbar__shop {
          font-size: 0.78rem;
          color: rgba(253,246,236,0.5);
          text-decoration: none;
        }

        /* ════════════════════════════════
           OVERLAY
        ════════════════════════════════ */
        .admin-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 49;
        }

        /* ════════════════════════════════
           SIDEBAR — mobile drawer
        ════════════════════════════════ */
        .admin-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 76vw;
          max-width: 280px;
          background: var(--clr-bark);
          color: var(--clr-cream);
          display: flex;
          flex-direction: column;
          z-index: 50;
          transform: translateX(-100%);
          transition: transform 260ms ease;
          overflow-y: auto;
        }
        .admin-sidebar--open {
          transform: translateX(0);
        }

        .admin-sidebar__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.125rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }
        .admin-sidebar__brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-display);
          color: var(--clr-saffron);
          font-size: 1rem;
          font-weight: 700;
        }
        .admin-sidebar__close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: none;
          color: var(--clr-cream);
          cursor: pointer;
        }

        .admin-sidebar__nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0.75rem;
          flex: 1;
        }
        .admin-sidebar__link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0.875rem;
          border-radius: var(--radius-md);
          color: rgba(253,246,236,0.75);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: background 150ms ease, color 150ms ease;
        }
        .admin-sidebar__link:hover {
          background: rgba(232,160,32,0.12);
          color: var(--clr-saffron);
        }
        .admin-sidebar__link--active {
          background: rgba(232,160,32,0.18);
          color: var(--clr-saffron);
          font-weight: 600;
        }
        .admin-sidebar__icon {
          font-size: 1.1rem;
          flex-shrink: 0;
          width: 22px;
          text-align: center;
        }
        .admin-sidebar__label { white-space: nowrap; }

        .admin-sidebar__footer {
          padding: 1rem;
          border-top: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }
        .admin-sidebar__back {
          font-size: 0.8rem;
          color: rgba(253,246,236,0.4);
          text-decoration: none;
          transition: color 150ms ease;
        }
        .admin-sidebar__back:hover { color: rgba(253,246,236,0.75); }

        /* ════════════════════════════════
           MD 768px — permanent sidebar, hide topbar
        ════════════════════════════════ */
        @media (min-width: 768px) {
          .admin-topbar { display: none; }
          .admin-overlay { display: none; }

          .admin-sidebar {
            position: sticky;
            top: 0;
            height: 100vh;
            width: 200px;
            transform: translateX(0); /* always visible */
            flex-shrink: 0;
          }
          .admin-sidebar__close { display: none; }
        }

        /* ════════════════════════════════
           LG 1024px
        ════════════════════════════════ */
        @media (min-width: 1024px) {
          .admin-sidebar { width: 220px; }
        }
      `}</style>
    </>
  );
}
