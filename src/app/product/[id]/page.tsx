import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AddToCartButton from "@/components/product/AddToCartButton";
import ProductCard from "@/components/product/ProductCard";
import ProductGallery from "@/components/product/ProductGallery";
import ProductStickyBar from "@/components/product/ProductStickyBar";
import { formatNaira } from "@/lib/utils";
import { CATEGORY_LABELS, type ProductCategory } from "@/types";
import { getCategoryBySlug } from "@/lib/categories";
import Link from "next/link";

export const revalidate = 60;

const COOKING_SUGGESTIONS: Record<string, string[]> = {
  spices: ["Add to soups and stews", "Marinate meats before grilling", "Mix into rice dishes"],
  herbs: ["Sprinkle over finished dishes", "Add to roasting trays", "Infuse into oils and sauces"],
  seasonings: ["Rub onto meat before cooking", "Stir into soups and sauces", "Season vegetables before roasting"],
  blends: ["Use as an all-purpose seasoning", "Add to one-pot meals", "Perfect for quick weeknight cooking"],
  peppers: ["Add heat to any dish", "Blend into pepper sauces", "Sprinkle on grilled meats"],
};

function getCookingSuggestions(category: string | null): string[] {
  if (!category) return COOKING_SUGGESTIONS.spices;
  return COOKING_SUGGESTIONS[category] || COOKING_SUGGESTIONS.spices;
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, description, price, image_url")
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
      images: product.image_url ? [product.image_url] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = createClient();

  let { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) {
    const { data: fallback } = await supabase
      .from("products")
      .select("id, name, description, price, image_url, stock, created_at")
      .eq("id", id)
      .single();
    product = fallback as any;
  }

  if (!product) notFound();

  const outOfStock = product.stock !== null && product.stock === 0;
  const cookingSuggestions = getCookingSuggestions(product.category);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.image_url || undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: product.price,
      availability: outOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
    brand: {
      "@type": "Brand",
      name: "KMA Spices & Herbs",
    },
  };

  // Fetch related products
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
            <Link href="/" style={{ color: "var(--clr-terracotta)", fontWeight: 500 }}>
              Home
            </Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ opacity: 0.4 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <Link href="/shop" style={{ color: "var(--clr-terracotta)", fontWeight: 500 }}>
              Shop
            </Link>
            {product.category && (() => {
              const catConfig = getCategoryBySlug(product.category);
              return catConfig ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ opacity: 0.4 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <Link href={catConfig.href} style={{ color: "var(--clr-terracotta)", fontWeight: 500 }}>
                    {catConfig.label}
                  </Link>
                </>
              ) : null;
            })()}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ opacity: 0.4 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span aria-current="page">{product.name}</span>
          </nav>

          <div className="product-detail-layout">
            {/* Product image */}
            <ProductGallery
              imageUrl={product.image_url}
              productName={product.name}
              category={product.category}
            />

            {/* Product info */}
            <div className="product-detail-info">
              {product.category && (
                <span className="product-detail-category">
                  {CATEGORY_LABELS[product.category as ProductCategory] || product.category}
                </span>
              )}

              <h1 className="product-detail-title">{product.name}</h1>

              <p className="product-detail-price">{formatNaira(product.price)}</p>

              {product.stock !== null && (
                <div className={`product-detail-stock ${outOfStock ? "product-detail-stock--oos" : ""}`}>
                  <span className="product-detail-stock__dot" />
                  {outOfStock ? "Out of Stock" : `In Stock \u00B7 ${product.stock} available`}
                </div>
              )}

              {product.description && (
                <div className="product-detail-description">
                  <h3 className="product-detail-description__label">About this product</h3>
                  <p>{product.description}</p>
                </div>
              )}

              <div className="divider" />

              {!outOfStock && <AddToCartButton product={product} />}

              {/* Cooking suggestions */}
              <div className="product-detail__suggestions">
                <h3 className="product-detail__suggestions-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M12 2v6m0 8v6M4.93 4.93l4.24 4.24m5.66 5.66l4.24 4.24M2 12h6m8 0h6M4.93 19.07l4.24-4.24m5.66-5.66l4.24-4.24" />
                  </svg>
                  How to use
                </h3>
                <ul className="product-detail__suggestions-list">
                  {cookingSuggestions.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div className="product-detail__delivery-info">
                <strong>Payment &amp; Delivery</strong>
                Pay via bank transfer or choose cash on delivery. We deliver nationwide across Nigeria. Free delivery on orders above &#8358;15,000.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky bottom bar — mobile only */}
      {!outOfStock && (
        <ProductStickyBar
          product={product}
          price={formatNaira(product.price)}
        />
      )}

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="section-padding section-padding--alt">
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
