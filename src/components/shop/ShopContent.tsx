"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import type { Product, ProductCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import ProductCard from "@/components/product/ProductCard";

interface Props {
  products: Product[];
  categories: { category: string; count: number }[];
  initialSearch: string;
  initialCategory: ProductCategory | null;
  initialSort: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A–Z" },
];

export default function ShopContent({
  products,
  categories,
  initialSearch,
  initialCategory,
  initialSort,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync URL when debounced search changes
  const updateURL = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  useEffect(() => {
    if (debouncedSearch !== initialSearch) {
      updateURL("q", debouncedSearch || null);
    }
  }, [debouncedSearch, initialSearch, updateURL]);

  function handleCategoryChange(cat: string | null) {
    updateURL("category", cat);
  }

  function handleSortChange(value: string) {
    updateURL("sort", value !== "newest" ? value : null);
  }

  function clearAll() {
    setSearch("");
    setDebouncedSearch("");
    updateURL("q", null);
    updateURL("category", null);
    updateURL("sort", null);
  }

  const hasActiveFilters = initialSearch || initialCategory || initialSort !== "newest";
  const resultCount = products.length;

  return (
    <main className="shop-main">
      <div className="container">
        {/* Header */}
        <div className="shop-header">
          <div className="shop-header__text">
            <h1 className="shop-header__title">Shop Our Spices</h1>
            <p className="shop-header__subtitle">
              Everything you need to add better flavour to your meals.
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="shop-search">
          <Search size={18} className="shop-search__icon" />
          <input
            ref={inputRef}
            type="text"
            className="shop-search__input"
            placeholder="Search spices, herbs and seasonings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
          {search && (
            <button
              className="shop-search__clear"
              onClick={() => { setSearch(""); inputRef.current?.focus(); }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter bar */}
        <div className="shop-toolbar">
          <div className="shop-toolbar__categories">
            <button
              className={`shop-pill ${!initialCategory ? "shop-pill--active" : ""}`}
              onClick={() => handleCategoryChange(null)}
            >
              All
            </button>
            {categories.map(({ category, count }) => (
              <button
                key={category}
                className={`shop-pill ${initialCategory === category ? "shop-pill--active" : ""}`}
                onClick={() => handleCategoryChange(category)}
              >
                {CATEGORY_LABELS[category as ProductCategory] || category}
                <span className="shop-pill__count">{count}</span>
              </button>
            ))}
          </div>

          <div className="shop-toolbar__right">
            <span className="shop-toolbar__count">
              {resultCount} product{resultCount !== 1 ? "s" : ""}
            </span>

            <div className="shop-sort">
              <ArrowUpDown size={14} />
              <select
                className="shop-sort__select"
                value={initialSort}
                onChange={(e) => handleSortChange(e.target.value)}
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile filter toggle */}
            <button
              className="shop-toolbar__filter-btn"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="shop-active-filters">
            {initialSearch && (
              <span className="shop-active-filter">
                Search: &ldquo;{initialSearch}&rdquo;
                <button onClick={() => { setSearch(""); updateURL("q", null); }} aria-label="Remove search filter">
                  <X size={12} />
                </button>
              </span>
            )}
            {initialCategory && (
              <span className="shop-active-filter">
                {CATEGORY_LABELS[initialCategory] || initialCategory}
                <button onClick={() => handleCategoryChange(null)} aria-label="Remove category filter">
                  <X size={12} />
                </button>
              </span>
            )}
            {initialSort !== "newest" && (
              <span className="shop-active-filter">
                {SORT_OPTIONS.find(o => o.value === initialSort)?.label}
                <button onClick={() => handleSortChange("newest")} aria-label="Remove sort">
                  <X size={12} />
                </button>
              </span>
            )}
            <button className="shop-active-filters__clear" onClick={clearAll}>
              Clear all
            </button>
          </div>
        )}

        {/* Mobile filter drawer */}
        {mobileFiltersOpen && (
          <div className="shop-mobile-filters">
            <div className="shop-mobile-filters__overlay" onClick={() => setMobileFiltersOpen(false)} />
            <div className="shop-mobile-filters__drawer">
              <div className="shop-mobile-filters__header">
                <h3>Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                  <X size={20} />
                </button>
              </div>
              <div className="shop-mobile-filters__body">
                <h4>Category</h4>
                <div className="shop-mobile-filters__options">
                  <button
                    className={`shop-mobile-option ${!initialCategory ? "shop-mobile-option--active" : ""}`}
                    onClick={() => { handleCategoryChange(null); setMobileFiltersOpen(false); }}
                  >
                    All Products
                  </button>
                  {categories.map(({ category, count }) => (
                    <button
                      key={category}
                      className={`shop-mobile-option ${initialCategory === category ? "shop-mobile-option--active" : ""}`}
                      onClick={() => { handleCategoryChange(category); setMobileFiltersOpen(false); }}
                    >
                      {CATEGORY_LABELS[category as ProductCategory] || category}
                      <span>{count}</span>
                    </button>
                  ))}
                </div>
                <h4>Sort by</h4>
                <div className="shop-mobile-filters__options">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`shop-mobile-option ${initialSort === opt.value ? "shop-mobile-option--active" : ""}`}
                      onClick={() => { handleSortChange(opt.value); setMobileFiltersOpen(false); }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product grid */}
        {products.length === 0 ? (
          <div className="shop-empty">
            <div className="shop-empty__icon">
              <Search size={48} strokeWidth={1} />
            </div>
            <h3 className="shop-empty__title">No products found</h3>
            <p className="shop-empty__description">
              {initialSearch
                ? `We couldn't find any products matching "${initialSearch}". Try a different search or clear your filters.`
                : "No products available in this category yet."}
            </p>
            {hasActiveFilters && (
              <button className="btn btn-outline" onClick={clearAll}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
