"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  href: string;
  label: string;
  icon: string;
}

interface AccountNavProps {
  tabs: Tab[];
}

export default function AccountNav({ tabs }: AccountNavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close drawer when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const activeTab = tabs.find((tab) => pathname === tab.href);

  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setMenuOpen(true)}
          style={{
            background: "var(--clr-saffron)",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--clr-bark)",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <span>☰ {activeTab?.label || "Menu"}</span>
          <span>▼</span>
        </button>
      </div>

      {/* Drawer overlay */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 1000,
            }}
          />
          <aside
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "280px",
              background: "white",
              zIndex: 1001,
              padding: "1.5rem",
              boxShadow: "2px 0 12px rgba(0,0,0,0.15)",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "1rem",
              }}
            >
              <button
                onClick={() => setMenuOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
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
              <p style={{ color: "var(--clr-muted)", fontSize: "0.9rem" }}>
                Manage orders, profile, security
              </p>
            </div>
            <nav style={{ display: "grid", gap: "0.5rem" }}>
              {tabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.9rem 1rem",
                    borderRadius: "var(--radius-md)",
                    background:
                      pathname === tab.href
                        ? "rgba(232, 160, 32, 0.1)"
                        : "transparent",
                    color: "var(--clr-bark)",
                    fontWeight: pathname === tab.href ? 700 : 500,
                    textDecoration: "none",
                  }}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </Link>
              ))}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
