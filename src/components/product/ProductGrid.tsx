import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types";
import ProductCard from "./ProductCard";

async function getProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, price, image_url, stock, description, created_at")
    .order("created_at", { ascending: false })
    .limit(12);
  return (data ?? []) as Product[];
}

export default async function ProductGrid() {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" />
          </svg>
        </div>
        <h3 className="empty-state__title">No products yet</h3>
        <p className="empty-state__description">
          Add your spices in the admin panel to show them here.
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
