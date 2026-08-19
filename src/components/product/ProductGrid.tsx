import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types";
import ProductCard from "./ProductCard";

async function getProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, image_url, stock, description, created_at, category")
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    const { data: fallback } = await supabase
      .from("products")
      .select("id, name, price, image_url, stock, description, created_at")
      .order("created_at", { ascending: false })
      .limit(12);
    return (fallback ?? []) as Product[];
  }

  return (data ?? []) as Product[];
}

export default async function ProductGrid() {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--clr-muted)" }}>
        <p style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--clr-bark)", marginBottom: "0.5rem" }}>
          Our collection is being prepared
        </p>
        <p style={{ fontSize: "var(--text-sm)" }}>
          Check back soon for our full range of premium Nigerian spices.
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
