"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/store/cart";
import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import AnnouncementBar from "./AnnouncementBar";
import { CATEGORIES } from "@/lib/categories";

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
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  cart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 6h15l-2 9H8L6 4H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    </svg>
  ),
  search: () => (
    <svg width="10" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <line x1="20" y1="20" x2="16.5" y2="16.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  user: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
    </svg>
  ),
};

function LogoutModal({ onConfirm, onCancel, isLoading }: { onConfirm: () => void; onCancel: () => void; isLoading: boolean }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Confirm logout">
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} className="modal-content" style={{ maxWidth: 360, textAlign: "center" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", marginBottom: "0.5rem", color: "var(--clr-bark)" }}>Leaving so soon?</h3>
        <p style={{ color: "var(--clr-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Are you sure you want to log out?</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button onClick={onCancel} className="btn btn-outline" style={{ flex: 1 }} disabled={isLoading}>Stay</button>
          <button onClick={onConfirm} className="btn btn-danger" style={{ flex: 1 }} disabled={isLoading}>{isLoading ? "Logging out..." : "Log Out"}</button>
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

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen || showLogoutModal) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          if (showLogoutModal) setShowLogoutModal(false);
          else setMenuOpen(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
    document.body.style.overflow = "";
  }, [menuOpen, showLogoutModal]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const cartCount = mounted ? totalItems() : 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = new URLSearchParams(window.location.search).get("q")?.trim() || "";
    setSearchTerm(query);
  }, []);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: customer } = await supabase.from("customers").select("full_name").eq("id", user.id).single();
        const fullName = customer?.full_name || user.user_metadata?.full_name || user.email || "";
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

  // Live search with debounce
  const handleSearchInput = useCallback((value: string) => {
    setSearchTerm(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!value.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from("products")
          .select("id, name, price, image_url, category")
          .ilike("name", `%${value.trim()}%`)
          .limit(6);
        setSearchResults(data ?? []);
      } catch {
        setSearchResults([]);
      }
      setSearchLoading(false);
    }, 300);
  }, [supabase]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    setSearchTerm("");
    setSearchFocused(false);
    setSearchResults([]);
    setMenuOpen(false);
  };

  const handleSearchResultClick = () => {
    setSearchTerm("");
    setSearchFocused(false);
    setSearchResults([]);
  };

  async function confirmLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setShowLogoutModal(false);
    useCartStore.getState().clearCart();
    try { await supabase.auth.signOut(); } catch (e) { console.error("Logout failed:", e); }
    finally { setDropdownOpen(false); setMenuOpen(false); setLoggingOut(false); router.push("/"); }
  }

  function requestLogout() {
    setLoggingOut(false);
    setDropdownOpen(false);
    setMenuOpen(false);
    setShowLogoutModal(true);
  }

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <AnnouncementBar />

      {/* Main nav row */}
      <MotionNav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`nav ${scrolled ? "nav--scrolled" : ""}`}
      >
        <div className="nav__inner">
          <button className="nav__menu" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Icon.menu />
          </button>

          <Link href="/" className="nav__brand">
            <Image src="/images/logo.jpg" alt="KMA Spices" width={40} height={40} loading="lazy" className="nav__logo" />
            <span>KMA Spices</span>
          </Link>

          <div className="nav__center">
            {CATEGORIES.slice(0, 5).map((cat) => {
              const isActive = typeof window !== "undefined" && window.location.search.includes(`category=${cat.slug}`);
              return (
                <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className={pathname === "/shop" && isActive ? "active" : ""}>
                  {cat.label}
                </Link>
              );
            })}
            {(() => {
              const allActive = pathname === "/shop" && !(typeof window !== "undefined" && (window.location.search || "").includes("category"));
              return (
                <Link href="/shop" className={allActive ? "active" : ""}>
                  All
                </Link>
              );
            })()}
          </div>

          <div className="nav__actions">
            <div className="nav__search desktop-search" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} style={{ display: "contents" }}>
                <input
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Search products..."
                  aria-label="Search products"
                  aria-autocomplete="list"
                  aria-expanded={searchFocused && (searchResults.length > 0 || searchLoading)}
                />
                <button type="submit" aria-label="Submit search" className="nav__search-button">
                  <Icon.search />
                  <span>Search</span>
                </button>
              </form>

              {/* Search suggestions dropdown */}
              {searchFocused && (searchResults.length > 0 || searchLoading) && (
                <div className="nav__search-dropdown" role="listbox" aria-label="Search suggestions">
                  {searchLoading && <div className="nav__search-loading">Searching...</div>}
                  {!searchLoading && searchResults.map((p) => (
                    <Link key={p.id} href={`/product/${p.id}`} className="nav__search-item" role="option" onClick={handleSearchResultClick}>
                      <div className="nav__search-item-thumb">
                        {p.image_url ? (
                          <Image src={p.image_url} alt={p.name} fill sizes="40px" style={{ objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "var(--clr-cream-dark)" }} />
                        )}
                      </div>
                      <div className="nav__search-item-info">
                        <span className="nav__search-item-name">{p.name}</span>
                        <span className="nav__search-item-price">₦{p.price?.toLocaleString()}</span>
                      </div>
                    </Link>
                  ))}
                  {!searchLoading && searchTerm.trim() && (
                    <Link href={`/search?q=${encodeURIComponent(searchTerm)}`} className="nav__search-item nav__search-item--all" onClick={handleSearchResultClick}>
                      View all results for &ldquo;{searchTerm}&rdquo;
                    </Link>
                  )}
                </div>
              )}
            </div>

            <Link href="/cart" className="nav__cart" aria-label="Cart">
              <Icon.cart />
              {cartCount > 0 && <span className="nav__badge" aria-live="polite" aria-atomic="true">{cartCount}</span>}
            </Link>

            {user ? (
              <div className="nav__user">
                <button className="nav__user-btn" onClick={() => setDropdownOpen(!dropdownOpen)} aria-label="Account" title={userName || user.email || "Account"}>
                  {profileImage ? (
                    <Image src={profileImage} alt={userName || "User"} width={40} height={40} className="nav__user-avatar" loading="lazy" onError={() => setProfileImage(null)} />
                  ) : (
                    <span className="nav__user-initials">{getInitials(userName || user?.email || "")}</span>
                  )}
                </button>
                {dropdownOpen && (
                  <div className="nav__dropdown">
                    <Link href="/account/overview" onClick={() => setDropdownOpen(false)}>Overview</Link>
                    <Link href="/account/orders" onClick={() => setDropdownOpen(false)}>Orders</Link>
                    <Link href="/account/profile" onClick={() => setDropdownOpen(false)}>Profile</Link>
                    <Link href="/account/security" onClick={() => setDropdownOpen(false)}>Security</Link>
                    <button onClick={requestLogout} className="nav__dropdown-logout">{loggingOut ? "Logging out..." : "Logout"}</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="nav__user-btn" aria-label="Login"><Icon.user /></Link>
            )}
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div className="nav__overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} />
              <motion.div className="nav__drawer" role="dialog" aria-modal="true" aria-label="Site navigation" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", duration: 0.28 }}>
                {/* Header */}
                <div className="nav__drawer-header">
                  <Link href="/" className="nav__drawer-brand" onClick={closeMenu}>
                    <Image src="/images/logo.jpg" alt="KMA" width={32} height={32} className="nav__drawer-logo" />
                    <span>KMA Spices</span>
                  </Link>
                  <button onClick={closeMenu} className="nav__drawer-close" aria-label="Close menu"><Icon.close /></button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="nav__drawer-search">
                  <Icon.search />
                  <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search products..." />
                </form>

                {/* Scrollable content */}
                <div className="nav__drawer-body">
                  {/* Category tiles */}
                  <div className="nav__drawer-section-label">Categories</div>
                  <div className="nav__drawer-cats">
                    {CATEGORIES.map((cat) => (
                      <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className={`nav__drawer-cat ${pathname === "/shop" && typeof window !== "undefined" && window.location.search.includes(`category=${cat.slug}`) ? "nav__drawer-cat--active" : ""}`} onClick={closeMenu} aria-current={pathname === "/shop" && typeof window !== "undefined" && window.location.search.includes(`category=${cat.slug}`) ? "page" : undefined}>
                        {cat.label}
                      </Link>
                    ))}
                  </div>

                  {/* Quick links */}
                  <div className="nav__drawer-section-label">Quick Links</div>
                  <nav className="nav__drawer-links">
                    <Link href="/shop" className={pathname === "/shop" && !(typeof window !== "undefined" && window.location.search.includes("category=")) ? "nav__drawer-link--active" : ""} onClick={closeMenu} aria-current={pathname === "/shop" && !(typeof window !== "undefined" && window.location.search.includes("category=")) ? "page" : undefined}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                      All Products
                    </Link>
                    {user ? (
                      <>
                        <Link href="/account/orders" className={pathname.startsWith("/account/orders") ? "nav__drawer-link--active" : ""} onClick={closeMenu} aria-current={pathname.startsWith("/account/orders") ? "page" : undefined}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                          My Orders
                        </Link>
                        <Link href="/account/profile" className={pathname.startsWith("/account/profile") ? "nav__drawer-link--active" : ""} onClick={closeMenu} aria-current={pathname.startsWith("/account/profile") ? "page" : undefined}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          My Account
                        </Link>
                      </>
                    ) : (
                      <Link href="/login" onClick={closeMenu}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                        Login / Sign Up
                      </Link>
                    )}
                  </nav>

                  <div className="nav__drawer-section-label">Information</div>
                  <nav className="nav__drawer-links">
                    <Link href="/faq" className={pathname === "/faq" ? "nav__drawer-link--active" : ""} onClick={closeMenu} aria-current={pathname === "/faq" ? "page" : undefined}>FAQs</Link>
                    <Link href="/about" className={pathname === "/about" ? "nav__drawer-link--active" : ""} onClick={closeMenu} aria-current={pathname === "/about" ? "page" : undefined}>About KMA</Link>
                    <Link href="/terms" onClick={closeMenu}>Terms of Service</Link>
                    <Link href="/privacy" onClick={closeMenu}>Privacy Policy</Link>
                  </nav>
                </div>

                {/* Footer */}
                {user && (
                  <div className="nav__drawer-footer">
                    <button onClick={requestLogout} className="nav__drawer-logout-btn">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Logout
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </MotionNav>

      <AnimatePresence>
        {showLogoutModal && (
          <LogoutModal onConfirm={confirmLogout} onCancel={() => setShowLogoutModal(false)} isLoading={loggingOut} />
        )}
      </AnimatePresence>
    </>
  );
}
