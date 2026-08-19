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

const PAGE_SIZE = 24;

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  spices: "Bold, aromatic spices sourced for depth and warmth in every dish.",
  herbs: "Fresh and dried herbs to bring fragrance and flavor to everyday cooking.",
  seasonings: "Expertly blended seasonings for quick, delicious meals.",
  blends: "Curated spice blends that take the guesswork out of cooking.",
  peppers: "Hot peppers and chili blends for those who love a kick of heat.",
  oils: "Cooking oils and flours for authentic Nigerian cuisine.",
  flours: "Quality flours for baking and cooking.",
  other: "Essential kitchen products and more.",
};

async function getProducts(
  search?: string,
  category?: ProductCategory,
  sort?: SortOption,
  page: number = 1,
): Promise<{ products: Product[]; total: number }> {
  const supabase = createClient();

  let query = supabase
    .from("products")
    .select("id, name, price, image_url, stock, description, created_at, category", { count: "exact" });

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

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    const fallback = supabase
      .from("products")
      .select("id, name, price, image_url, stock, description, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    const { data: fbData, count: fbCount } = await fallback;
    return { products: (fbData ?? []) as Product[], total: fbCount ?? 0 };
  }

  return { products: (data ?? []) as Product[], total: count ?? 0 };
}

async function getCategories(): Promise<{ category: string; count: number }[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("products").select("category");

  if (error || !data) return [];

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
      <div className="shop-hero">
        <div className="container">
          <div className="shop-hero__content">
            <div style={{ height: "40px", width: "300px", background: "rgba(255,255,255,0.15)", borderRadius: "8px", marginBottom: "12px" }} />
            <div style={{ height: "18px", width: "400px", background: "rgba(255,255,255,0.1)", borderRadius: "6px", maxWidth: "100%" }} />
          </div>
        </div>
      </div>
      <main className="shop-main">
        <div className="container">
          <div className="shop-search-skeleton" />
          <div className="shop-filters-skeleton" />
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
  const pageParam = typeof params.page === "string" ? parseInt(params.page, 10) : 1;

  const category = VALID_CATEGORIES.includes(categoryParam as ProductCategory)
    ? (categoryParam as ProductCategory)
    : undefined;
  const sort = VALID_SORT.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : "newest";
  const page = Math.max(1, pageParam || 1);

  const [{ products, total }, categories] = await Promise.all([
    getProducts(search, category, sort, page),
    getCategories(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const categoryDescription = category ? CATEGORY_DESCRIPTIONS[category] : null;

  return (
    <>
      <Navbar />
      <ShopContent
        products={products}
        categories={categories}
        initialSearch={search ?? ""}
        initialCategory={category ?? null}
        initialSort={sort}
        totalCount={total}
        currentPage={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        categoryDescription={categoryDescription}
      />
      <Footer />
    </>
  );
}
