export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Product, ProductCategory, CATEGORY_LABELS } from "@/types";
import ShopContent from "@/components/shop/ShopContent";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";

const VALID_CATEGORIES = Object.keys(CATEGORY_LABELS) as ProductCategory[];
const VALID_SORT = ["newest", "price_asc", "price_desc", "name_asc"] as const;
type SortOption = (typeof VALID_SORT)[number];

async function getProducts(
  search?: string,
  category?: ProductCategory,
  sort?: SortOption,
): Promise<Product[]> {
  const supabase = createClient();
  let query = supabase
    .from("products")
    .select("id, name, price, image_url, stock, description, created_at, category");

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (category && VALID_CATEGORIES.includes(category)) {
    query = query.eq("category", category);
  }

  switch (sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "name_asc":
      query = query.order("name", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data } = await query;
  return (data ?? []) as Product[];
}

async function getCategories(): Promise<{ category: string; count: number }[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("category");

  if (!data) return [];

  const counts: Record<string, number> = {};
  for (const row of data) {
    const cat = row.category || "uncategorized";
    counts[cat] = (counts[cat] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

function ShopSkeleton() {
  return (
    <div className="shop-page">
      <Navbar />
      <main className="shop-main">
        <div className="container">
          <div className="shop-header">
            <div className="shop-header__text">
              <h1 className="shop-header__title">Shop Our Spices</h1>
              <p className="shop-header__subtitle">Authentic spices, herbs and seasonings to bring every meal to life.</p>
            </div>
          </div>
          <div className="shop-toolbar">
            <div className="shop-search-skeleton" />
            <div className="shop-filters-skeleton" />
          </div>
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : undefined;
  const categoryParam = typeof params.category === "string" ? params.category : undefined;
  const sortParam = typeof params.sort === "string" ? params.sort : undefined;

  const category = VALID_CATEGORIES.includes(categoryParam as ProductCategory)
    ? (categoryParam as ProductCategory)
    : undefined;
  const sort = VALID_SORT.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : "newest";

  const [products, categories] = await Promise.all([
    getProducts(search, category, sort),
    getCategories(),
  ]);

  return (
    <>
      <Navbar />
      <ShopContent
        products={products}
        categories={categories}
        initialSearch={search ?? ""}
        initialCategory={category ?? null}
        initialSort={sort}
      />
      <Footer />
    </>
  );
}
