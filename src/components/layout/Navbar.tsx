'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const cartCount = mounted ? totalItems() : 0;

  return (
    <nav style={{
      background: 'var(--clr-bark)',
      color: 'var(--clr-cream)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem var(--space-md)',
      }}>
        {/* Logo */}
        <Link href="/" style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          color: 'var(--clr-saffron)',
          fontWeight: 700,
          letterSpacing: '-0.01em',
        }}>
          🌶 Mama Spice
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          <Link href="/" style={{
            color: pathname === '/' ? 'var(--clr-saffron)' : 'var(--clr-cream)',
            fontWeight: pathname === '/' ? 600 : 400,
            transition: 'color var(--transition-fast)',
          }}>
            Shop
          </Link>
          <Link href="/account" style={{
            color: pathname.startsWith('/account') ? 'var(--clr-saffron)' : 'var(--clr-cream)',
            fontWeight: pathname.startsWith('/account') ? 600 : 400,
          }}>
            My Orders
          </Link>
          <Link href="/cart" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--clr-saffron)',
            color: 'var(--clr-bark)',
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            transition: 'all var(--transition-fast)',
          }}>
            🛒 Cart
            {cartCount > 0 && (
              <span style={{
                background: 'var(--clr-chili)',
                color: 'white',
                borderRadius: 'var(--radius-full)',
                padding: '0 0.45rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                lineHeight: 1.6,
              }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--clr-cream)',
            fontSize: '1.5rem',
            display: 'none',
          }}
          aria-label="Menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'var(--clr-bark-mid)',
          padding: '1rem var(--space-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <Link href="/" onClick={() => setMenuOpen(false)} style={{ color: 'var(--clr-cream)' }}>🏠 Shop</Link>
          <Link href="/account" onClick={() => setMenuOpen(false)} style={{ color: 'var(--clr-cream)' }}>📦 My Orders</Link>
          <Link href="/cart" onClick={() => setMenuOpen(false)} style={{ color: 'var(--clr-saffron)', fontWeight: 600 }}>
            🛒 Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
