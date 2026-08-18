export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroCarousel from "@/components/layout/HeroCarousel";
import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";

function HomeSkeletonGrid() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 6 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero section */}
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="hero-eyebrow">KMA Spices and Herbs</span>
              <h1 className="hero-title">
                Premium Nigerian spices for bold flavor and natural wellness.
              </h1>
              <p className="hero-description">
                Carefully sourced spices, herbs, flours, condiments, and
                unadulterated oils. Order securely with bank transfer or cash
                on delivery.
              </p>

              <div className="hero-actions">
                <Link href="#catalog" className="btn btn-primary">
                  Browse products
                </Link>
                <Link href="/do-you-know" className="btn btn-ghost">
                  Spice tips
                </Link>
              </div>
            </div>

            <HeroCarousel />
          </div>
        </section>

        {/* Trust signals */}
        <section className="trust-bar container">
          <div className="trust-bar__item">
            <div className="trust-bar__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="trust-bar__label">Secure ordering</span>
            <span className="trust-bar__description">Bank transfer &amp; cash on delivery</span>
          </div>
          <div className="trust-bar__item">
            <div className="trust-bar__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <span className="trust-bar__label">Nationwide delivery</span>
            <span className="trust-bar__description">We deliver across Nigeria</span>
          </div>
          <div className="trust-bar__item">
            <div className="trust-bar__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span className="trust-bar__label">100% natural</span>
            <span className="trust-bar__description">No additives or preservatives</span>
          </div>
          <div className="trust-bar__item">
            <div className="trust-bar__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <span className="trust-bar__label">WhatsApp orders</span>
            <span className="trust-bar__description">Order directly via chat</span>
          </div>
        </section>

        {/* Catalog section */}
        <section id="catalog" className="catalog-section">
          <div className="container">
            <div className="catalog-intro">
              <p className="catalog-eyebrow">Our products</p>
              <h2 className="section-title">Fresh spices ready to ship.</h2>
              <p className="catalog-text">
                Browse our curated selection of premium Nigerian spices, herbs,
                and cooking essentials. Fast checkout with bank transfer or cash
                on delivery.
              </p>
            </div>

            <Suspense fallback={<HomeSkeletonGrid />}>
              <ProductGrid />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
