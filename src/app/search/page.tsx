export const dynamic = "force-dynamic";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import type { Product, DoYouKnowItem } from "@/types";
import SearchResults from "@/components/search/SearchResults";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = String(q || "").trim();

  const supabase = createClient();
  const products: Product[] = [];
  const guides: DoYouKnowItem[] = [];

  if (query) {
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

    if (productError) {
      const { data: fallbackData } = await supabase
        .from("products")
        .select("id, name, description, price, image_url, stock, created_at")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      if (fallbackData) products.push(...(fallbackData as Product[]));
    } else if (productData) {
      products.push(...(productData as Product[]));
    }

    const { data: guideData, error: guideError } = await supabase
      .from("do_you_know_items")
      .select("*")
      .or(
        `name.ilike.%${query}%,subtitle.ilike.%${query}%,benefits.ilike.%${query}%,recommendation.ilike.%${query}%`,
      );

    if (guideError) console.error("[search] guides:", guideError.message);
    if (guideData) guides.push(...(guideData as DoYouKnowItem[]));
  }

  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: "3rem 0" }}>
        <SearchResults query={query} products={products} guides={guides} />
      </main>
      <Footer />
    </>
  );
}
