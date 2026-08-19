export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import CategoryCard from "@/components/ui/CategoryCard";
import NewsletterForm from "@/components/ui/NewsletterForm";

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
  {
    name: "Spices",
    description: "Bold flavour for everyday cooking",
    image: "/images/cardamom.jpg",
    href: "/shop?category=spices",
  },
  {
    name: "Herbs",
    description: "Fresh aromatic depth",
    image: "/images/kma_leaf.jpg",
    href: "/shop?category=herbs",
  },
  {
    name: "Seasonings",
    description: "Balanced blends for your favourite dishes",
    image: "/images/curry_mix1.jpg",
    href: "/shop?category=seasonings",
  },
  {
    name: "Peppers & Heat",
    description: "Bring the heat",
    image: "/images/dry_okra.jpg",
    href: "/shop?category=peppers",
  },
  {
    name: "Cooking Blends",
    description: "Ready-made flavour combinations",
    image: "/images/curry_mix.png",
    href: "/shop?category=blends",
  },
];

const COOKING_BUNDLES = [
  {
    name: "Jollof Night",
    products: "Jollof Seasoning, Curry, Thyme, Ginger",
    image: "/images/curry_mix1.jpg",
    href: "/shop?category=seasonings",
  },
  {
    name: "Chicken & Grill",
    products: "Chicken Seasoning, Thyme, Black Pepper",
    image: "/images/ginger_powder.jpg",
    href: "/shop?category=spices",
  },
  {
    name: "Pepper Soup",
    products: "Pepper Soup Spice, Ginger, Garlic",
    image: "/images/garlic_powder.jpg",
    href: "/shop?category=spices",
  },
  {
    name: "Everyday Essentials",
    products: "Curry, Thyme, Ginger, Garlic",
    image: "/images/mixed_spices.png",
    href: "/shop",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="hero-eyebrow">KMA Spices &amp; Herbs</span>
              <h1 className="hero-title">
                Premium Nigerian Spices
              </h1>
              <p className="hero-description">
                Carefully sourced, freshly packed. The authentic flavours that make
                every Nigerian meal memorable.
              </p>
              <div className="hero-actions">
                <Link href="/shop" className="btn btn-primary btn-lg">
                  Shop All Spices
                </Link>
                <Link href="#categories" className="btn btn-outline btn-lg">
                  Browse Categories
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <img
                src="/images/mixed_spices_1.jpg"
                alt="KMA spice collection"
                className="hero-image__img"
              />
            </div>
          </div>
        </section>

        {/* Shop by Category */}
        <section id="categories" className="section-padding">
          <div className="container">
            <div className="section-header">
              <p className="section-eyebrow">Shop by category</p>
              <h2 className="section-title">Find what your kitchen needs</h2>
            </div>
            <div className="category-grid">
              {CATEGORIES.map((cat) => (
                <CategoryCard key={cat.name} {...cat} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="section-padding section-padding--alt">
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

        {/* Cook by Need */}
        <section className="section-padding">
          <div className="container">
            <div className="section-header">
              <p className="section-eyebrow">Cook by need</p>
              <h2 className="section-title">Spices for every dish</h2>
              <p className="section-subtitle">
                From jollof to pepper soup, we have the spices that make every Nigerian meal memorable.
              </p>
            </div>
            <div className="cooking-grid">
              {COOKING_BUNDLES.map((bundle) => (
                <Link key={bundle.name} href={bundle.href} className="cooking-card">
                  <div className="cooking-card__image">
                    <img src={bundle.image} alt={bundle.name} />
                  </div>
                  <div className="cooking-card__content">
                    <h3 className="cooking-card__name">{bundle.name}</h3>
                    <p className="cooking-card__products">{bundle.products}</p>
                    <span className="cooking-card__cta">
                      Shop now
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Signals */}
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
