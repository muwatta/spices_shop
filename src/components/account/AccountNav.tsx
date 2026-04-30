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
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: "0.75rem",
            padding: "0.85rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--clr-bark)",
            width: "100%",
            maxWidth: "100%",
            justifyContent: "space-between",
            boxSizing: "border-box",
            lineHeight: 1.4,
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
              width: "min(320px, 85vw)",
              maxWidth: "100%",
              background: "white",
              zIndex: 1001,
              padding: "1.5rem",
              boxShadow: "2px 0 24px rgba(0,0,0,0.15)",
              overflowY: "auto",
              boxSizing: "border-box",
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
              <p
                style={{
                  color: "var(--clr-muted)",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Manage orders, profile, security
              </p>
            </div>
            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {tabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "1rem 1rem",
                    borderRadius: "1rem",
                    background:
                      pathname === tab.href
                        ? "rgba(232, 160, 32, 0.14)"
                        : "rgba(255,255,255,0.97)",
                    color: "var(--clr-bark)",
                    fontWeight: pathname === tab.href ? 700 : 500,
                    textDecoration: "none",
                    width: "100%",
                    boxSizing: "border-box",
                    minHeight: "48px",
                    lineHeight: 1.4,
                    whiteSpace: "normal",
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
