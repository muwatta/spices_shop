export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroCarousel from "@/components/layout/HeroCarousel";
import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import CategoryCard from "@/components/ui/CategoryCard";
import InspirationCard from "@/components/ui/InspirationCard";
import NewsletterForm from "@/components/ui/NewsletterForm";
import WhatsAppHeroButton from "@/components/ui/WhatsAppHeroButton";

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
  { emoji: "🌶", name: "Spices", href: "/shop?category=spices", colorClass: "category-card__icon--spices" },
  { emoji: "🌿", name: "Herbs", href: "/shop?category=herbs", colorClass: "category-card__icon--herbs" },
  { emoji: "🧂", name: "Seasonings", href: "/shop?category=seasonings", colorClass: "category-card__icon--seasonings" },
  { emoji: "🔥", name: "Pepper & Heat", href: "/shop?category=peppers", colorClass: "category-card__icon--peppers" },
  { emoji: "🍲", name: "Cooking Blends", href: "/shop?category=blends", colorClass: "category-card__icon--blends" },
  { emoji: "🫒", name: "Oils & Flours", href: "/shop?category=oils", colorClass: "category-card__icon--oils" },
];

const INSPIRATION_ITEMS = [
  { emoji: "🍚", name: "Jollof Rice", href: "/search?q=jollof" },
  { emoji: "🍗", name: "Chicken", href: "/search?q=chicken" },
  { emoji: "🥘", name: "Pepper Soup", href: "/search?q=pepper+soup" },
  { emoji: "🐟", name: "Grilled Fish", href: "/search?q=fish" },
  { emoji: "🥩", name: "Suya", href: "/search?q=suya" },
  { emoji: "🍛", name: "Curry Stew", href: "/search?q=curry" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero section */}
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="hero-eyebrow">KMA Spices &amp; Herbs</span>
              <h1 className="hero-title">
                Bring Every Meal to Life.
              </h1>
              <p className="hero-description">
                Premium Nigerian spices and seasonings for everyday cooking.
                Carefully sourced, freshly packed, delivered to your kitchen.
              </p>
              <div className="hero-actions">
                <Link href="/shop" className="btn btn-primary">
                  Shop Spices
                </Link>
                <WhatsAppHeroButton />
              </div>
            </div>
            <HeroCarousel />
          </div>
        </section>

        {/* Shop by category */}
        <section id="categories" className="categories-section">
          <div className="container">
            <div className="section-header">
              <p className="section-eyebrow">Browse by category</p>
              <h2 className="section-title">Find what your kitchen needs</h2>
            </div>
            <div className="category-grid">
              {CATEGORIES.map((cat) => (
                <CategoryCard key={cat.name} {...cat} />
              ))}
            </div>
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
            <span className="trust-bar__description">Bank transfer and cash on delivery</span>
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

        {/* Best sellers */}
        <section id="catalog" className="catalog-section">
          <div className="container">
            <div className="section-header">
              <p className="section-eyebrow">Our products</p>
              <h2 className="section-title">Fresh spices ready to ship</h2>
              <p className="section-subtitle">
                Browse our curated selection of premium Nigerian spices, herbs,
                and cooking essentials.
              </p>
              <Link href="/shop" className="section-link">
                View all products
              </Link>
            </div>
            <Suspense fallback={<HomeSkeletonGrid />}>
              <ProductGrid />
            </Suspense>
          </div>
        </section>

        {/* Cooking inspiration */}
        <section className="inspiration-section">
          <div className="container">
            <div className="section-header">
              <p className="section-eyebrow">What are you cooking?</p>
              <h2 className="section-title">Find the right spices for your dish</h2>
              <p className="section-subtitle">
                From jollof to pepper soup, we have the spices that make every Nigerian meal memorable.
              </p>
            </div>
            <div className="inspiration-grid">
              {INSPIRATION_ITEMS.map((item) => (
                <InspirationCard key={item.name} {...item} />
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="newsletter-section">
          <div className="container">
            <div className="newsletter-box">
              <h2 className="newsletter-box__title">Get more from your kitchen</h2>
              <p className="newsletter-box__description">
                Recipes, cooking ideas and occasional offers. Straight to your inbox.
              </p>
              <NewsletterForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
