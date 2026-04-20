import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import type { Product, DoYouKnowItem } from "@/types";
import SearchResults from "@/components/search/SearchResults";

interface SearchPageProps {
  searchParams?: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = String(searchParams?.q || "").trim();
  const supabase = createClient();

  const products: Product[] = [];
  const guides: DoYouKnowItem[] = [];

  if (query) {
    const term = `%${query}%`;

    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike."${term}",description.ilike."${term}"`);

    const { data: guideData, error: guideError } = await supabase
      .from("do_you_know_items")
      .select("*")
      .or(
        `name.ilike."${term}",subtitle.ilike."${term}",benefits.ilike."${term}",recommendation.ilike."${term}"`,
      );

    if (productError) console.error("[search] products:", productError.message);
    if (guideError) console.error("[search] guides:", guideError.message);

    if (productData) products.push(...(productData as Product[]));
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
