import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types";
import ProductCard from "./ProductCard";

async function getProducts(): Promise<{ products: Product[]; total: number }> {
  const supabase = createClient();
  const { data, count, error } = await supabase
    .from("products")
    .select("id, name, price, image_url, images, stock, description, category", { count: "exact" })
    .neq("status", "archived")
    .order("created_at", { ascending: false })
    ;

  if (error) {
    const { data: fallback } = await supabase
      .from("products")
      .select("id, name, price, image_url, stock, description", { count: "exact" })
      .neq("status", "archived")
      .order("created_at", { ascending: false });
    return { products: (fallback ?? []) as Product[], total: fallback?.length ?? 0 };
  }

  return { products: (data ?? []) as Product[], total: count ?? data?.length ?? 0 };
}

export default async function ProductGrid() {
  const { products, total } = await getProducts();

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
    <>
      <div className="product-grid__summary" aria-live="polite">
        <span>{total} {total === 1 ? "product" : "products"} available</span>
      </div>
      <div className="product-grid">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </>
  );
}
