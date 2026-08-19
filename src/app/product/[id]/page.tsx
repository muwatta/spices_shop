import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AddToCartButton from "@/components/product/AddToCartButton";
import WhatsAppOrderButton from "@/components/product/WhatsAppOrderButton";
import ProductCard from "@/components/product/ProductCard";
import { formatNaira } from "@/lib/utils";
import { CATEGORY_LABELS, type ProductCategory } from "@/types";
import ClientProductImage from "./ClientProductImage";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, description, price")
    .eq("id", id)
    .single();

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.description || `Buy ${product.name} for ${formatNaira(product.price)} - 100% natural Nigerian spice.`,
    openGraph: {
      title: product.name,
      description: product.description || `Premium ${product.name} from KMA Spices & Herbs.`,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const outOfStock = product.stock !== null && product.stock === 0;

  // Fetch related products (same category, excluding current)
  let relatedProducts: any[] = [];
  if (product.category) {
    const { data } = await supabase
      .from("products")
      .select("id, name, price, image_url, stock, description, created_at, category")
      .eq("category", product.category)
      .neq("id", product.id)
      .limit(4);
    relatedProducts = data ?? [];
  }
  // If not enough related by category, fill with other products
  if (relatedProducts.length < 4) {
    const existingIds = [product.id, ...relatedProducts.map((p) => p.id)];
    const { data } = await supabase
      .from("products")
      .select("id, name, price, image_url, stock, description, created_at, category")
      .not("id", "in", `(${existingIds.join(",")})`)
      .limit(4 - relatedProducts.length);
    relatedProducts = [...relatedProducts, ...(data ?? [])];
  }

  return (
    <>
      <Navbar />
      <main>
        <div className="container" style={{ padding: "2rem var(--space-md) var(--space-3xl)" }}>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{
              marginBottom: "2rem",
              fontSize: "var(--text-sm)",
              color: "var(--clr-muted)",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              flexWrap: "wrap",
            }}
          >
            <a href="/" style={{ color: "var(--clr-terracotta)", fontWeight: 500 }}>
              Shop
            </a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ opacity: 0.4 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span aria-current="page">{product.name}</span>
          </nav>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "3rem",
              alignItems: "start",
            }}
          >
            {/* Product image */}
            <ClientProductImage
              imageUrl={product.image_url}
              productName={product.name}
            />

            {/* Product info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  marginBottom: "0.75rem",
                }}
              >
                {product.name}
              </h1>

              {product.category && (
                <div
                  style={{
                    display: "inline-flex",
                    alignSelf: "flex-start",
                    padding: "0.25rem 0.75rem",
                    background: "rgba(180, 90, 60, 0.08)",
                    borderRadius: "var(--radius-full)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    color: "var(--clr-terracotta)",
                    textTransform: "capitalize",
                    marginBottom: "0.5rem",
                  }}
                >
                  {CATEGORY_LABELS[product.category as ProductCategory] || product.category}
                </div>
              )}

                <div
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "var(--clr-bark)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {formatNaira(product.price)}
                </div>
              </div>

              {product.stock !== null && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    color: outOfStock ? "var(--clr-chili)" : "var(--clr-success)",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: outOfStock ? "var(--clr-chili)" : "var(--clr-success)",
                      display: "inline-block",
                    }}
                  />
                  {outOfStock
                    ? "Out of Stock"
                    : `In Stock \u00B7 ${product.stock} available`}
                </div>
              )}

              {product.description && (
                <div>
                  <h3
                    style={{
                      fontSize: "var(--text-xs)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: "0.5rem",
                      color: "var(--clr-muted)",
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
                    }}
                  >
                    About this product
                  </h3>
                  <p style={{ color: "var(--clr-bark-mid)", lineHeight: 1.8, fontSize: "var(--text-base)" }}>
                    {product.description}
                  </p>
                </div>
              )}

              <div className="divider" />

              {!outOfStock && <AddToCartButton product={product} />}
              <WhatsAppOrderButton product={product} />

              <div
                style={{
                  background: "var(--clr-cream)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem 1.25rem",
                  fontSize: "var(--text-sm)",
                  color: "var(--clr-muted)",
                  lineHeight: 1.7,
                  border: "1px solid var(--clr-cream-dark)",
                }}
              >
                <strong
                  style={{
                    color: "var(--clr-bark)",
                    display: "block",
                    marginBottom: "0.25rem",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Payment &amp; Delivery
                </strong>
                Pay via bank transfer or choose cash on delivery. We deliver nationwide across Nigeria.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="catalog-section" style={{ background: "var(--clr-cream)", padding: "var(--space-3xl) var(--space-md)" }}>
          <div className="container">
            <div className="section-header">
              <p className="section-eyebrow">You may also like</p>
              <h2 className="section-title">Related products</h2>
            </div>
            <div className="product-grid">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
