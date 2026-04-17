"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCartStore } from "@/lib/store/cart";
import { useEffect, useState } from "react";

const MotionNav = motion("nav");

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const totalItems = useCartStore((s) => s.totalItems);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => setMounted(true), []);

  const cartCount = mounted ? totalItems() : 0;

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setSearchTerm("");
    setMenuOpen(false);
  };

  return (
    <MotionNav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        background: "var(--clr-bark)",
        color: "var(--clr-cream)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          padding: "1rem var(--space-md)",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.85rem",
            }}
          >
            <Image
              src="/images/logo.jpeg"
              alt="KMA Spices logo"
              width={40}
              height={40}
              style={{ borderRadius: "0.85rem", objectFit: "cover" }}
            />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                color: "var(--clr-saffron)",
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              KMA Spices
            </span>
          </div>
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flex: 1,
            minWidth: 0,
          }}
          className="desktop-nav"
        >
          <Link
            href="/"
            style={{
              color:
                pathname === "/" ? "var(--clr-saffron)" : "var(--clr-cream)",
              fontWeight: pathname === "/" ? 600 : 400,
              transition: "color var(--transition-fast)",
            }}
          >
            Shop
          </Link>
          <Link
            href="/do-you-know"
            style={{
              color:
                pathname === "/do-you-know"
                  ? "var(--clr-saffron)"
                  : "var(--clr-cream)",
              fontWeight: pathname === "/do-you-know" ? 600 : 400,
            }}
          >
            Do you Know
          </Link>
          <Link
            href="/account"
            style={{
              color: pathname.startsWith("/account")
                ? "var(--clr-saffron)"
                : "var(--clr-cream)",
              fontWeight: pathname.startsWith("/account") ? 600 : 400,
            }}
          >
            Account
          </Link>
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flex: 1,
              minWidth: 0,
            }}
          >
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products or tips"
              aria-label="Search products or tips"
              style={{
                flex: 1,
                minWidth: 0,
                padding: "0.65rem 0.85rem",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.08)",
                color: "var(--clr-cream)",
              }}
            />
            <button
              type="submit"
              style={{
                background: "var(--clr-saffron)",
                color: "var(--clr-bark)",
                border: "none",
                borderRadius: "999px",
                padding: "0.65rem 1rem",
                cursor: "pointer",
              }}
            >
              Search
            </button>
          </form>
          <Link
            href="/cart"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "var(--clr-saffron)",
              color: "var(--clr-bark)",
              padding: "0.5rem 1.25rem",
              borderRadius: "var(--radius-full)",
              fontWeight: 600,
              transition: "all var(--transition-fast)",
            }}
          >
            🛒 Cart
            {cartCount > 0 && (
              <span
                style={{
                  background: "var(--clr-chili)",
                  color: "white",
                  borderRadius: "var(--radius-full)",
                  padding: "0 0.45rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  lineHeight: 1.6,
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            background: "none",
            border: "none",
            color: "var(--clr-cream)",
            fontSize: "1.5rem",
            display: "none",
          }}
          aria-label="Menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            background: "var(--clr-bark-mid)",
            padding: "1rem var(--space-md)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            style={{ color: "var(--clr-cream)" }}
          >
            🏠 Shop
          </Link>
          <Link
            href="/do-you-know"
            onClick={() => setMenuOpen(false)}
            style={{ color: "var(--clr-cream)" }}
          >
            📘 Do you Know
          </Link>
          <Link
            href="/account"
            onClick={() => setMenuOpen(false)}
            style={{ color: "var(--clr-cream)" }}
          >
            👤 Account
          </Link>
          <form
            onSubmit={handleSearchSubmit}
            style={{ display: "flex", gap: "0.5rem" }}
          >
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search"
              aria-label="Mobile search"
              style={{
                flex: 1,
                padding: "0.65rem 0.85rem",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.08)",
                color: "var(--clr-cream)",
              }}
            />
            <button
              type="submit"
              style={{
                background: "var(--clr-saffron)",
                color: "var(--clr-bark)",
                border: "none",
                borderRadius: "999px",
                padding: "0.65rem 1rem",
                cursor: "pointer",
              }}
            >
              Go
            </button>
          </form>
          <Link
            href="/cart"
            onClick={() => setMenuOpen(false)}
            style={{ color: "var(--clr-saffron)", fontWeight: 600 }}
          >
            🛒 Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            style={{ color: "var(--clr-cream)" }}
          >
            🔐 Sign In
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 960px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </MotionNav>
  );
}
