"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Product, ProductCategory, CATEGORY_LABELS } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import Image from "next/image";

interface CategoryCount {
  category: string;
  count: number;
}

interface Props {
  products: Product[];
  categories: CategoryCount[];
  initialSearch: string;
  initialCategory: ProductCategory | null;
  initialSort: string;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  categoryDescription: string | null;
}

export default function ShopContent({
  products,
  categories,
  initialSearch,
  initialCategory,
  initialSort,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  categoryDescription,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set("q", value);
        } else {
          params.delete("q");
        }
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }, 300);
    },
    [router, pathname, searchParams],
  );

  const clearSearch = useCallback(() => {
    setSearchValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const setCategory = useCallback(
    (cat: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (cat) {
        params.set("category", cat);
      } else {
        params.delete("category");
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const setSort = useCallback(
    (sort: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", sort);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page > 1) {
        params.set("page", String(page));
      } else {
        params.delete("page");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const clearAllFilters = useCallback(() => {
    setSearchValue("");
    router.push(pathname);
  }, [router, pathname]);

  // Active filters
  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string; type: "search" | "category" }[] = [];
    if (initialSearch) {
      filters.push({ key: "q", label: `"${initialSearch}"`, type: "search" });
    }
    if (initialCategory) {
      filters.push({
        key: "category",
        label: CATEGORY_LABELS[initialCategory] || initialCategory,
        type: "category",
      });
    }
    return filters;
  }, [initialSearch, initialCategory]);

  const hasActiveFilters = activeFilters.length > 0;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="shop-page">
      {/* Hero banner */}
      <div className="shop-hero">
        <div className="container">
          <div className="shop-hero__content">
            <h1 className="shop-hero__title">
              {initialCategory
                ? CATEGORY_LABELS[initialCategory] || initialCategory
                : "Shop Our Spices"}
            </h1>
            <p className="shop-hero__subtitle">
              {categoryDescription ||
                "Premium Nigerian spices, herbs, and seasonings. Carefully sourced, freshly packed, delivered to your kitchen."}
            </p>
          </div>
        </div>
      </div>

      <main className="shop-main">
        <div className="container">
          {/* Search bar */}
          <div className="shop-search" role="search" aria-label="Search products">
            <svg className="shop-search__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="shop-search__input"
              type="search"
              placeholder="Search spices, herbs, seasonings..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              aria-label="Search products"
            />
            {searchValue && (
              <button
                className="shop-search__clear"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Toolbar */}
          <div className="shop-toolbar">
            <div className="shop-toolbar__categories" role="tablist" aria-label="Filter by category">
              <button
                className={`shop-pill ${!initialCategory ? "shop-pill--active" : ""}`}
                onClick={() => setCategory(null)}
                role="tab"
                aria-selected={!initialCategory}
              >
                All
                {totalCount > 0 && (
                  <span className="shop-pill__count">{totalCount}</span>
                )}
              </button>
              {categories.map(({ category, count }) => (
                <button
                  key={category}
                  className={`shop-pill ${initialCategory === category ? "shop-pill--active" : ""}`}
                  onClick={() => setCategory(category)}
                  role="tab"
                  aria-selected={initialCategory === category}
                >
                  {CATEGORY_LABELS[category as ProductCategory] || category}
                  <span className="shop-pill__count">{count}</span>
                </button>
              ))}
            </div>

            <div className="shop-toolbar__right">
              <span className="shop-toolbar__count" aria-live="polite">
                {totalCount === 0
                  ? "No products"
                  : `${startItem}–${endItem} of ${totalCount}`}
              </span>

              <div className="shop-sort">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M3 6h18M6 12h12M9 18h6" />
                </svg>
                <select
                  className="shop-sort__select"
                  value={initialSort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort products"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="name_asc">Name: A → Z</option>
                </select>
              </div>

              <button
                className="shop-toolbar__filter-btn"
                onClick={() => setMobileFiltersOpen(true)}
                aria-label="Open filters"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                </svg>
                Filter
              </button>
            </div>
          </div>

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="shop-active-filters">
              {activeFilters.map((f) => (
                <span key={f.key} className="shop-active-filter">
                  {f.label}
                  <button
                    onClick={() =>
                      f.type === "search" ? clearSearch() : setCategory(null)
                    }
                    aria-label={`Remove filter: ${f.label}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <button
                className="shop-active-filters__clear"
                onClick={clearAllFilters}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product grid */}
          {products.length > 0 ? (
            <div className="product-grid" role="list">
              {products.map((product, i) => (
                <div key={product.id} role="listitem">
                  <ProductCard product={product} index={i} />
                </div>
              ))}
            </div>
          ) : (
            <div className="shop-empty">
              <div className="shop-empty__icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h2 className="shop-empty__title">
                {initialSearch
                  ? `No products found for "${initialSearch}"`
                  : "No products match these filters"}
              </h2>
              <p className="shop-empty__description">
                {initialSearch
                  ? "Try different keywords or browse our full catalog."
                  : "Try adjusting your filters or browse all products."}
              </p>
              <button
                className="btn btn-primary"
                onClick={clearAllFilters}
              >
                {initialSearch ? "Clear Search" : "Clear Filters"}
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="shop-pagination" aria-label="Pagination">
              <button
                className="shop-pagination__btn"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous page"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Previous
              </button>

              <div className="shop-pagination__pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 7) return true;
                    if (p === 1 || p === totalPages) return true;
                    if (Math.abs(p - currentPage) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                    if (i > 0) {
                      const prev = arr[i - 1];
                      if (p - prev > 1) acc.push("ellipsis");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "ellipsis" ? (
                      <span key={`e${i}`} className="shop-pagination__ellipsis">…</span>
                    ) : (
                      <button
                        key={p}
                        className={`shop-pagination__page ${p === currentPage ? "shop-pagination__page--active" : ""}`}
                        onClick={() => setPage(p)}
                        aria-label={`Page ${p}`}
                        aria-current={p === currentPage ? "page" : undefined}
                      >
                        {p}
                      </button>
                    ),
                  )}
              </div>

              <button
                className="shop-pagination__btn"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
              >
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </nav>
          )}
        </div>
      </main>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="shop-mobile-filters">
          <div
            className="shop-mobile-filters__overlay"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />
          <div
            className="shop-mobile-filters__drawer"
            role="dialog"
            aria-label="Filter products"
          >
            <div className="shop-mobile-filters__header">
              <h3>Filter by</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="shop-mobile-filters__body">
              <h4>Category</h4>
              <div className="shop-mobile-filters__options">
                <button
                  className={`shop-mobile-option ${!initialCategory ? "shop-mobile-option--active" : ""}`}
                  onClick={() => { setCategory(null); setMobileFiltersOpen(false); }}
                >
                  All Products <span>{totalCount}</span>
                </button>
                {categories.map(({ category, count }) => (
                  <button
                    key={category}
                    className={`shop-mobile-option ${initialCategory === category ? "shop-mobile-option--active" : ""}`}
                    onClick={() => { setCategory(category); setMobileFiltersOpen(false); }}
                  >
                    {CATEGORY_LABELS[category as ProductCategory] || category} <span>{count}</span>
                  </button>
                ))}
              </div>

              <h4>Sort by</h4>
              <div className="shop-mobile-filters__options">
                {[
                  { value: "newest", label: "Newest" },
                  { value: "price_asc", label: "Price: Low → High" },
                  { value: "price_desc", label: "Price: High → Low" },
                  { value: "name_asc", label: "Name: A → Z" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    className={`shop-mobile-option ${initialSort === value ? "shop-mobile-option--active" : ""}`}
                    onClick={() => { setSort(value); setMobileFiltersOpen(false); }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
