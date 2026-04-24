"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/store/cart";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MotionNav = motion.nav;

const Icon = {
  menu: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 6h16M4 12h16M4 18h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  cart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6h15l-2 9H8L6 4H3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    </svg>
  ),
  search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <line
        x1="20"
        y1="20"
        x2="16.5"
        y2="16.5"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ),
  user: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
        fill="currentColor"
      />
    </svg>
  ),
};

export default function Navbar(): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const totalItems = useCartStore((s) => s.totalItems);
  const supabase = createClient();

  const [mounted, setMounted] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  useEffect(() => setMounted(true), []);
  const cartCount = mounted ? totalItems() : 0;

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: customer } = await supabase
          .from("customers")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (customer?.full_name) setUserName(customer.full_name.split(" ")[0]);
      } else {
        setUser(null);
        setUserName("");
      }
    }
    fetchUser();
  }, [supabase]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    setSearchTerm("");
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    useCartStore.getState().clearCart();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <MotionNav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="nav"
    >
      <div className="nav__inner">
        {/* Hamburger — mobile only */}
        <button
          className="nav__menu"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Icon.menu />
        </button>

        {/* Brand */}
        <Link href="/" className="nav__brand">
          <Image
            src="/images/logo.jpg"
            alt="KMA Spices"
            width={40}
            height={40}
            className="nav__logo"
          />
          <span>KMA Spices</span>
        </Link>

        {/* Desktop center links */}
        <div className="nav__center">
          <Link href="/" className={pathname === "/" ? "active" : ""}>
            Shop
          </Link>
          <Link
            href="/do-you-know"
            className={pathname === "/do-you-know" ? "active" : ""}
          >
            Tips
          </Link>
        </div>

        {/* Right actions */}
        <div className="nav__actions">
          <form
            onSubmit={handleSearchSubmit}
            className="nav__search desktop-search"
          >
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              aria-label="Search"
            />
            <button type="submit" aria-label="Submit search">
              <Icon.search />
            </button>
          </form>

          <Link href="/cart" className="nav__cart" aria-label="Cart">
            <Icon.cart />
            {cartCount > 0 && <span className="nav__badge">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="nav__user">
              <button
                className="nav__user-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Account"
              >
                {userName ? (
                  <span className="nav__user-name">{userName}</span>
                ) : (
                  <Icon.user />
                )}
              </button>
              {dropdownOpen && (
                <div className="nav__dropdown">
                  <Link
                    href="/account/overview"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Overview
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link
                    href="/account/profile"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/account/security"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Security
                  </Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="nav__user-btn" aria-label="Login">
              <Icon.user />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="nav__overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="nav__drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28 }}
            >
              <div className="nav__drawer-header">
                <span>KMA Spices</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <Icon.close />
                </button>
              </div>

              <form
                onSubmit={handleSearchSubmit}
                className="nav__drawer-search"
              >
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                />
                <button type="submit" aria-label="Search">
                  <Icon.search />
                </button>
              </form>

              <nav className="nav__drawer-links">
                <Link href="/" onClick={() => setMenuOpen(false)}>
                  🏠 Shop
                </Link>
                <Link href="/do-you-know" onClick={() => setMenuOpen(false)}>
                  💡 Tips
                </Link>
                <Link href="/cart" onClick={() => setMenuOpen(false)}>
                  🛒 Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
                {user ? (
                  <>
                    <Link
                      href="/account/overview"
                      onClick={() => setMenuOpen(false)}
                    >
                      📊 Overview
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setMenuOpen(false)}
                    >
                      📦 Orders
                    </Link>
                    <Link
                      href="/account/profile"
                      onClick={() => setMenuOpen(false)}
                    >
                      👤 Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                    >
                      🚪 Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    🔐 Login
                  </Link>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        /* ════════════════════════════════
           BASE — mobile first (< 768px)
        ════════════════════════════════ */
        .nav {
          background: var(--clr-bark);
          color: var(--clr-cream);
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 12px rgba(0,0,0,0.25);
        }
        .nav__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 1rem;
          gap: 0.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }

        /* Brand */
        .nav__brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.875rem;
          color: var(--clr-saffron);
          text-decoration: none;
          flex-shrink: 0;
        }
        .nav__logo {
          border-radius: 50%;
          object-fit: cover;
          width: 36px !important;
          height: 36px !important;
        }

        /* Hamburger */
        .nav__menu {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: var(--clr-cream);
          cursor: pointer;
          flex-shrink: 0;
          padding: 0.2rem;
        }

        /* Center nav — hidden on mobile */
        .nav__center { display: none; }

        /* Desktop search — hidden on mobile */
        .desktop-search { display: none; }

        /* Actions */
        .nav__actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        /* Shared circle button styles */
        .nav__cart,
        .nav__user-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
          transition: opacity 150ms ease, transform 150ms ease;
          text-decoration: none;
        }
        .nav__cart:active,
        .nav__user-btn:active { transform: scale(0.93); }

        .nav__cart {
          background: var(--clr-saffron);
          color: var(--clr-bark);
          position: relative;
        }
        .nav__badge {
          position: absolute;
          top: -3px;
          right: -3px;
          background: var(--clr-chili);
          color: #fff;
          font-size: 0.6rem;
          font-weight: 700;
          min-width: 15px;
          height: 15px;
          padding: 0 0.2rem;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .nav__user-btn {
          background: rgba(255,255,255,0.1);
          color: var(--clr-cream);
          font-family: var(--font-body);
        }
        .nav__user-name {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
          padding: 0 0.2rem;
        }

        /* Dropdown */
        .nav__user { position: relative; }
        .nav__dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          background: #fff;
          border-radius: 0.625rem;
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
          min-width: 148px;
          z-index: 200;
          overflow: hidden;
        }
        .nav__dropdown a,
        .nav__dropdown button {
          display: block;
          width: 100%;
          padding: 0.625rem 1rem;
          text-align: left;
          background: none;
          border: none;
          color: var(--clr-bark);
          text-decoration: none;
          font-size: 0.84rem;
          cursor: pointer;
          font-family: var(--font-body);
          transition: background 120ms ease;
        }
        .nav__dropdown a:hover,
        .nav__dropdown button:hover { background: var(--clr-cream-dark); }

        /* ════════════════════════════════
           DRAWER
        ════════════════════════════════ */
        .nav__overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
        }
        .nav__drawer {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 75vw;
          max-width: 200px;
          background: var(--clr-bark-mid);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        .nav__drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1.125rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }
        .nav__drawer-header span {
          font-family: var(--font-display);
          color: var(--clr-saffron);
          font-size: 1rem;
          font-weight: 700;
        }
        .nav__drawer-header button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: none;
          color: var(--clr-cream);
          cursor: pointer;
        }

        .nav__drawer-search {
          display: flex;
          align-items: center;
          margin: 0.875rem 1.125rem;
          background: rgba(255,255,255,0.1);
          border-radius: 999px;
          padding: 0.3rem 0.75rem;
          flex-shrink: 0;
        }
        .nav__drawer-search input {
          flex: 1;
          border: none;
          background: transparent;
          color: #fff;
          padding: 0.4rem 0.25rem;
          outline: none;
          font-size: 0.875rem;
          font-family: var(--font-body);
          min-width: 0;
        }
        .nav__drawer-search input::placeholder { color: rgba(255,255,255,0.4); }
        .nav__drawer-search button {
          background: none;
          border: none;
          color: var(--clr-saffron);
          cursor: pointer;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .nav__drawer-links {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 0.375rem 0 1rem;
        }
        .nav__drawer-links a,
        .nav__drawer-links button {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          color: rgba(255,255,255,0.82);
          text-decoration: none;
          font-size: 0.9375rem;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          padding: 0.75rem 1.125rem;
          width: 50%;
          font-family: var(--font-body);
          transition: background 120ms ease, color 120ms ease;
        }
        .nav__drawer-links a:hover,
        .nav__drawer-links button:hover {
          background: rgba(255,255,255,0.06);
          color: var(--clr-saffron);
        }
        /* Logout stands out */
        .nav__drawer-links button:last-of-type {
          color: rgba(255, 110, 110, 0.85);
          margin-top: auto;
          border-top: 1px solid rgba(255,255,255,0.07);
        }

        /* ════════════════════════════════
           MD — 768px
        ════════════════════════════════ */
        @media (min-width: 768px) {
          .nav__inner { padding: 0.65rem 1.5rem; }
          .nav__brand { font-size: 0.9375rem; gap: 0.6rem; }
          .nav__logo { width: 50px !important; height: 50px !important; }
          .nav__cart,
          .nav__user-btn { width: 50px; height: 50px; }
          .nav__actions { gap: 0.625rem; }
        }

        /* ════════════════════════════════
           LG — 900px (desktop layout)
        ════════════════════════════════ */
        @media (min-width: 900px) {
          .nav__menu { display: none; }

          .nav__center {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            flex: 1;
            justify-content: center;
          }
          .nav__center a {
            text-decoration: none;
            color: rgba(253,246,236,0.68);
            font-size: 0.9375rem;
            transition: color 150ms ease;
          }
          .nav__center a:hover { color: var(--clr-cream); }
          .nav__center a.active {
            color: var(--clr-saffron);
            font-weight: 600;
          }

          .desktop-search {
            display: flex;
            align-items: center;
            background: rgba(255,255,255,0.09);
            border-radius: 999px;
            padding: 0.25rem 0.5rem 0.25rem 1rem;
            gap: 0.25rem;
          }
          .desktop-search input {
            border: none;
            background: transparent;
            color: #fff;
            padding: 0.35rem 0;
            outline: none;
            width: 150px;
            font-size: 0.875rem;
            font-family: var(--font-body);
          }
          .desktop-search input::placeholder { color: rgba(255,255,255,0.38); }
          .desktop-search button {
            background: none;
            border: none;
            color: var(--clr-saffron);
            cursor: pointer;
            display: flex;
            align-items: center;
            padding: 0.35rem;
          }

          .nav__cart,
          .nav__user-btn { width: 50px; height: 50px; }
        }
      `}</style>
    </MotionNav>
  );
}
