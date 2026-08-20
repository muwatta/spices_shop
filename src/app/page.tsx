export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import HeroSection from "@/components/home/HeroSection";

function HomeSkeletonGrid() {
  return (
    <div className="product-grid">
      {Array.from({ length: 8 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

const CATEGORIES = [
  { name: "Spices", slug: "spices", image: "/images/cardamom.jpg" },
  { name: "Herbs", slug: "herbs", image: "/images/kma_leaf.jpg" },
  { name: "Seasonings", slug: "seasonings", image: "/images/curry_mix1.jpg" },
  { name: "Peppers", slug: "peppers", image: "/images/dry_okra.jpg" },
  { name: "Blends", slug: "blends", image: "/images/curry_mix.png" },
  { name: "Flours", slug: "flours", image: "/images/bacbab.jpg" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />

        {/* Category tiles */}
        <section className="section-padding">
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow">Browse</span>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">From whole spices to cooking oils — find everything for your kitchen</p>
            </div>
            <div className="home-categories">
              {CATEGORIES.map((cat) => (
                <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className="home-cat-tile">
                  <div className="home-cat-tile__img">
                    <img src={cat.image} alt={cat.name} loading="lazy" />
                    <div className="home-cat-tile__info">
                      <span className="home-cat-tile__name">{cat.name}</span>
                      <span className="home-cat-tile__arrow">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="section-padding section-padding--alt">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">All Products</h2>
              <Link href="/shop" className="section-link">View All</Link>
            </div>
            <Suspense fallback={<HomeSkeletonGrid />}>
              <ProductGrid />
            </Suspense>
          </div>
        </section>

        {/* Trust strip */}
        <div className="trust-strip">
          <div className="container trust-strip__inner">
            <div className="trust-strip__item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              <span>Secure Payment</span>
            </div>
            <div className="trust-strip__item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <span>Nationwide Delivery</span>
            </div>
            <div className="trust-strip__item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <span>100% Natural</span>
            </div>
            <div className="trust-strip__item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
              <span>Cash on Delivery</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
