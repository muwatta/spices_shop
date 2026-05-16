import { createClient } from "@/lib/supabase/server";
import dynamic from "next/dynamic";
import { Product } from "@/types";

// Dynamically load the client-side ProductCard to keep framer-motion and
// client-only code out of the initial server-rendered bundle.
const ProductCard = dynamic(() => import("./ProductCard"), { ssr: false });

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
      <div
        className="card"
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "var(--clr-muted)",
        }}
      >
        No products are published yet. Add your spices in the admin panel to
        show them here.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1.5rem",
      }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
