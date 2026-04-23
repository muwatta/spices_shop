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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
        if (customer?.full_name) {
          setUserName(customer.full_name.split(" ")[0]);
        }
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
    const supabase = createClient();
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
        {/* Hamburger (left) */}
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
            width={50}
            height={50}
            className="nav__logo"
          />
          <span>KMA Spices</span>
        </Link>

        {/* Desktop Navigation */}
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

        {/* Actions (right side) */}
        <div className="nav__actions">
          <form
            onSubmit={handleSearchSubmit}
            className="nav__search desktop-search"
          >
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              aria-label="Search"
            />
            <button type="submit">
              <Icon.search />
            </button>
          </form>

          <Link href="/cart" className="nav__cart">
            <Icon.cart />
            {cartCount > 0 && <span>{cartCount}</span>}
          </Link>

          {user ? (
            <div className="nav__user">
              <button
                className="nav__user-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
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
            <Link href="/login" className="nav__user-btn">
              <Icon.user />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Drawer (slides from left) */}
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
              transition={{ type: "tween", duration: 0.3 }}
            >
              <div className="nav__drawer-header">
                <button onClick={() => setMenuOpen(false)}>
                  <Icon.close />
                </button>
              </div>

              {/* Search inside drawer */}
              <form
                onSubmit={handleSearchSubmit}
                className="nav__drawer-search"
              >
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                />
                <button type="submit"></button>
              </form>

              <div className="nav__drawer-links">
                <Link href="/" onClick={() => setMenuOpen(false)}>
                🏠Shop
                </Link>
                <Link href="/do-you-know" onClick={() => setMenuOpen(false)}>
                💡Tips
                </Link>
                {user ? (
                  <>
                    <Link
                      href="/account/overview"
                      onClick={() => setMenuOpen(false)}
                    >
                    📊Overview
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setMenuOpen(false)}
                    >
                    📦Orders
                    </Link>
                    <Link
                      href="/account/profile"
                      onClick={() => setMenuOpen(false)}
                    >
                    👤Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                    >
                    🚪Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    🔐Login
                  </Link>
                )}
                <Link href="/cart" onClick={() => setMenuOpen(false)}>
                  🛒Cart ({cartCount})
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .nav {
          background: var(--clr-bark);
          color: var(--clr-cream);
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .nav__inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          gap: 0.75rem;
        }
        .nav__brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 700;
          color: var(--clr-saffron);
          text-decoration: none;
        }
        .nav__logo {
          border-radius: 50%;
          object-fit: cover;
        }
        .nav__center {
          display: flex;
          gap: 1.2rem;
        }
        .nav__center a {
          text-decoration: none;
          color: inherit;
          opacity: 0.75;
        }
        .nav__center a.active {
          color: var(--clr-saffron);
          opacity: 1;
          font-weight: 600;
        }
        .nav__actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .nav__search {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.08);
          border-radius: 999px;
          padding: 0.2rem 0.4rem;
        }
        .nav__search input {
          border: none;
          background: transparent;
          color: white;
          padding: 0.4rem;
          outline: none;
          width: 120px;
        }
        .nav__search button {
          background: none;
          border: none;
          color: var(--clr-saffron);
          cursor: pointer;
        }
        .nav__cart {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--clr-saffron);
          color: var(--clr-bark);
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }
        .nav__cart span {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--clr-chili);
          color: white;
          font-size: 0.65rem;
          padding: 0 0.35rem;
          border-radius: 999px;
        }
        .nav__user {
          position: relative;
        }
        .nav__user-btn {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          color: var(--clr-cream);
        }
        .nav__user-name {
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .nav__dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          min-width: 140px;
          z-index: 10;
          overflow: hidden;
        }
        .nav__dropdown a, .nav__dropdown button {
          display: block;
          width: 100%;
          padding: 0.6rem 1rem;
          text-align: left;
          background: none;
          border: none;
          color: var(--clr-bark);
          text-decoration: none;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .nav__dropdown a:hover, .nav__dropdown button:hover {
          background: var(--clr-cream-dark);
        }
        .nav__menu {
          display: none;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
        }
        /* Mobile drawer */
        .nav__overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
        }
        .nav__drawer {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 200px;
          background: var(--clr-bark-mid);
          z-index: 1001;
          padding: 1px;
          display: flex;
          text-align: left;
          flex-direction: column;
          justify-content: flex-start;
        }
        .nav__drawer-header {
          display: flex;
          justify-content: flex-end;
          width: 100%;
        }
        .nav__drawer-header button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
        }
        .nav__drawer-search {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.15);
          border-radius: 100px;
          padding: 0.2rem 0.4rem;
          width: 70%;
        }
        .nav__drawer-search input {
          flex: 1;
          border: none;
          background: transparent;
          color: white;
          padding: 0.6rem 0.5rem;
          outline: none;
          font-size: 0.9rem;
        }
        .nav__drawer-search button {
          background: none;
          border: none;
          color: var(--clr-saffron);
          cursor: pointer;
        }
        .nav__drawer-links {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
          width: 50%;
        }
        .nav__drawer-links a, .nav__drawer-links button {
          color: white;
          text-decoration: none;
          font-size: 1rem;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          padding: 0.5rem 0;
          margin: 0;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.1rem;
        }
        /* Hide desktop search on mobile, show drawer search */
        @media (max-width: 900px) {
          .nav__center { display: none; }
          .nav__menu { display: block; }
          .desktop-search { display: none; }
          .nav__brand span { font-size: 0.9rem; }
        }
        @media (min-width: 901px) {
          .nav__drawer-search { display: none; }
        }
        @media (max-width: 480px) {
          .nav__inner { padding: 0.5rem 0.8rem; }
          .nav__cart, .nav__user-btn { width: 40px; height: 40px; }
        }
      `}</style>
    </MotionNav>
  );
}
