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
        {/* Hero section – static, no suspense */}
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="hero-eyebrow">KMA Spices and Herbs</span>
              <h1 className="hero-title">
                Pure, premium spices that bring rich flavor and natural wellness
                to every meal.
              </h1>
              <p className="hero-description">
                Discover carefully sourced spices, herbs, flours, condiments,
                foodsuff and unadulterated oils. Order securely with bank
                transfer, cash delivery.
              </p>

              <div className="hero-actions">
                <Link href="#catalog" className="btn btn-primary">
                  Browse products
                </Link>
                <Link href="/do-you-know" className="btn btn-outline">
                  Do you Know
                </Link>
                <Link href="/cart" className="btn btn-outline">
                  View cart
                </Link>
              </div>
            </div>

            <HeroCarousel />
          </div>
        </section>

        {/* Catalog section with lazy loading */}
        <section id="catalog" className="catalog-section">
          <div className="container">
            <div className="catalog-intro">
              <p className="catalog-eyebrow">Catalog preview</p>
              <h2 className="section-title">Fresh spices ready to sell.</h2>
              <p className="catalog-text">
                Designed for Nigerian spice brands: fast browsing, clear product
                cards, and a checkout flow built for cash, bank transfer, and
                USSD customers.
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
