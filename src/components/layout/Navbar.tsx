"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/store/cart";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MotionNav = motion.nav;

function getDisplayName(fullName: string | null | undefined) {
  const name = fullName?.trim() || "";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1]}`;
}

function getInitials(fullName: string | null | undefined) {
  const name = fullName?.trim() || "";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

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

// ── Logout confirmation modal ──
function LogoutModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        style={{
          background: "white",
          borderRadius: "1.25rem",
          padding: "2rem",
          maxWidth: "360px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>👋</p>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.25rem",
            marginBottom: "0.5rem",
            color: "var(--clr-bark)",
          }}
        >
          Leaving so soon?
        </h3>
        <p
          style={{
            color: "var(--clr-muted)",
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
          }}
        >
          Are you sure you want to log out?
        </p>
        <div
          style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}
        >
          <button
            onClick={onCancel}
            className="btn btn-outline"
            style={{ flex: 1 }}
          >
            Stay
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-danger"
            style={{ flex: 1 }}
          >
            Log Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}

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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => setMounted(true), []);
  const cartCount = mounted ? totalItems() : 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query =
      new URLSearchParams(window.location.search).get("q")?.trim() || "";
    setSearchTerm(query);
  }, []);

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
        const fullName =
          customer?.full_name ||
          user.user_metadata?.full_name ||
          user.email ||
          "";
        setUserName(getDisplayName(fullName));
        const avatarUrl = user.user_metadata?.avatar_url || null;
        setProfileImage(typeof avatarUrl === "string" ? avatarUrl : null);
      } else {
        setUser(null);
        setUserName("");
        setProfileImage(null);
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

  async function confirmLogout() {
    setLoggingOut(true);
    useCartStore.getState().clearCart();
    await supabase.auth.signOut();
    setShowLogoutModal(false);
    setDropdownOpen(false);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  function requestLogout() {
    setDropdownOpen(false);
    setMenuOpen(false);
    setShowLogoutModal(true);
  }

  return (
    <>
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
              loading="lazy"
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
                placeholder="Search products, tips..."
                aria-label="Search"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="nav__search-button"
              >
                <Icon.search />
                <span>Search</span>
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
                  title={userName || user.email || "Account"}
                >
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt={userName || "User"}
                      width={40}
                      height={40}
                      className="nav__user-avatar"
                      loading="lazy"
                      onError={() => setProfileImage(null)}
                    />
                  ) : (
                    <span className="nav__user-initials">
                      {getInitials(userName || user?.email || "")}
                    </span>
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
                    <button
                      onClick={requestLogout}
                      className="nav__dropdown-logout"
                    >
                      {loggingOut ? "Logging out..." : "Logout"}
                    </button>
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
                    placeholder="Search..."
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
                        onClick={requestLogout}
                        className="nav__drawer-logout"
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
        .nav__center { display: none; }
        .desktop-search { display: none; }
        .nav__actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }
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
        .nav__cart:active, .nav__user-btn:active { transform: scale(0.93); }
        .nav__cart {
          background: var(--clr-saffron);
          color: var(--clr-bark);
          position: relative;
        }
        .nav__badge {
          position: absolute;
          top: -3px; right: -3px;
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
        .nav__user-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
        .nav__user-initials {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
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
        .nav__dropdown-logout {
          color: var(--clr-chili) !important;
          border-top: 1px solid var(--clr-cream-dark) !important;
          font-weight: 600 !important;
        }

        /* Drawer */
        .nav__overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
        }
        .nav__drawer {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 75vw;
          max-width: 280px;
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
          width: 30px; height: 30px;
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
          padding: 0.5rem 0 1rem;
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
          width: 100%;
          font-family: var(--font-body);
          transition: background 120ms ease, color 120ms ease;
        }
        .nav__drawer-links a:hover,
        .nav__drawer-links button:hover {
          background: rgba(255,255,255,0.06);
          color: var(--clr-saffron);
        }
        .nav__drawer-logout {
          color: rgba(255,110,110,0.85) !important;
          margin-top: auto !important;
          border-top: 1px solid rgba(255,255,255,0.07) !important;
        }

        /* MD */
        @media (min-width: 768px) {
          .nav__inner { padding: 0.65rem 1.5rem; }
          .nav__brand { font-size: 0.9375rem; gap: 0.6rem; }
          .nav__logo { width: 42px !important; height: 42px !important; }
          .nav__cart, .nav__user-btn { width: 42px; height: 42px; }
          .nav__actions { gap: 0.625rem; }
        }

        /* LG */
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
          .nav__center a.active { color: var(--clr-saffron); font-weight: 600; }
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
          .nav__search-button {
            background: none;
            border: none;
            color: var(--clr-saffron);
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.35rem 0.6rem;
            border-radius: 999px;
            font-size: 0.8rem;
            font-weight: 700;
            transition: background 150ms ease;
          }
          .nav__search-button:hover { background: rgba(255,255,255,0.12); }
        }
      `}</style>
      </MotionNav>

      {/* Logout confirmation modal — outside nav so it covers everything */}
      <AnimatePresence>
        {showLogoutModal && (
          <LogoutModal
            onConfirm={confirmLogout}
            onCancel={() => setShowLogoutModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
