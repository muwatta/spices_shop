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
  { href: "/admin/customers", label: "Customers", icon: "👥" },
];


export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);


  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="admin-topbar">
        <button
          className="admin-topbar__hamburger"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
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

      
      {open && <div className="admin-overlay" onClick={() => setOpen(false)} />}

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
                onClick={() => setOpen(false)}
                className={`admin-sidebar__link ${
                  isActive ? "admin-sidebar__link--active" : ""
                }`}
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
        /* ===== Topbar ===== */
        .admin-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.65rem;
          padding: 0.65rem 0.95rem;

          background: var(--clr-bark);
          color: var(--clr-cream);

          position: sticky;
          top: 0;
          z-index: 40;

          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        }

        .admin-topbar__hamburger {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          padding: 0;

          background: rgba(255,255,255,0.06);
          border: none;
          border-radius: 0.75rem;
          color: var(--clr-cream);
          cursor: pointer;
        }

        .admin-topbar__title {
          font-size: 1rem;
          font-weight: 700;
          font-family: var(--font-display);
          color: var(--clr-saffron);
          white-space: nowrap;
        }

        .admin-topbar__shop {
          font-size: 0.8rem;
          text-decoration: none;
          color: rgba(253,246,236,0.76);
          white-space: nowrap;
        }

        /* ===== Overlay ===== */
        .admin-overlay {
          position: fixed;
          inset: 0;
          z-index: 49;
          background: rgba(0,0,0,0.5);
        }

        /* ===== Sidebar ===== */
        .admin-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;

          width: 72vw;
          max-width: 220px;
          padding: 0.75rem 0 0.75rem 0;

          display: flex;
          flex-direction: column;
          justify-content: space-between;

          background: var(--clr-bark);
          color: var(--clr-cream);
          box-shadow: 2px 0 18px rgba(0,0,0,0.08);
          border-right: 1px solid rgba(255,255,255,0.08);

          transform: translateX(-100%);
          transition: transform 260ms ease;

          overflow-y: auto;
          z-index: 50;
        }

        .admin-sidebar--open {
          transform: translateX(0);
        }

        .admin-sidebar__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;

          padding: 0.9rem 1rem;

          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .admin-sidebar__brand {
          display: flex;
          align-items: center;
          gap: 0.45rem;

          font-size: 0.95rem;
          font-weight: 700;
          font-family: var(--font-display);
          color: var(--clr-saffron);
        }

        .admin-sidebar__close {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;
          border: none;

          background: rgba(255,255,255,0.1);
          color: var(--clr-cream);

          cursor: pointer;
        }

        .admin-sidebar__nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;

          padding: 0.6rem 0.75rem 0;
        }

        .admin-sidebar__link {
          display: flex;
          align-items: center;
          gap: 0.7rem;

          padding: 0.7rem 0.95rem;
          min-height: 40px;

          font-size: 0.9rem;
          font-weight: 500;

          border-radius: var(--radius-lg);
          text-decoration: none;

          color: rgba(253,246,236,0.82);

          transition: background 150ms ease, color 150ms ease, transform 150ms ease;
        }

        .admin-sidebar__link:hover {
          background: rgba(232,160,32,0.14);
          color: var(--clr-saffron);
          transform: translateX(1px);
        }

        .admin-sidebar__link--active {
          font-weight: 600;
          color: var(--clr-saffron);
          background: rgba(232,160,32,0.2);
          box-shadow: inset 4px 0 0 var(--clr-saffron);
        }

        .admin-sidebar__icon {
          width: 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          flex-shrink: 0;
          font-size: 1rem;
        }

        .admin-sidebar__footer {
          padding: 0.8rem 1rem 1rem;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .admin-sidebar__back {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.85rem;
          text-decoration: none;
          color: rgba(253,246,236,0.72);
        }

        .admin-sidebar__back:hover {
          color: rgba(253,246,236,0.9);
        }

        /* ===== Responsive ===== */
        @media (min-width: 768px) {
          .admin-topbar,
          .admin-overlay {
            display: none;
          }

          .admin-sidebar {
            position: sticky;
            top: 0;
            height: 100vh;
            width: 210px;
            padding-top: 1.5rem;
            transform: translateX(0);
          }

          .admin-sidebar__close {
            display: none;
          }
        }

        @media (min-width: 1024px) {
          .admin-sidebar {
            width: 230px;
          }
        }
      `}</style>
    </>
  );
}
