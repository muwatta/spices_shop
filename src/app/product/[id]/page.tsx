import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AddToCartButton from "@/components/product/AddToCartButton";
import WhatsAppOrderButton from "@/components/product/WhatsAppOrderButton";
import { formatNaira } from "@/lib/utils";
import ClientProductImage from "./ClientProductImage";

export const revalidate = 60;

interface Props {
  params: { id: string };
}

export default async function ProductPage({ params }: Props) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!product) notFound();

  const outOfStock = product.stock !== null && product.stock === 0;

  return (
    <>
      <Navbar />
      <main>
        <div className="container" style={{ padding: "2rem var(--space-md)" }}>
          <nav
            style={{
              marginBottom: "1.5rem",
              fontSize: "0.875rem",
              color: "var(--clr-muted)",
            }}
          >
            <a href="/" style={{ color: "var(--clr-saffron-dark)" }}>
              Shop
            </a>
            {" / "}
            <span>{product.name}</span>
          </nav>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2.5rem",
              alignItems: "start",
            }}
          >
            <ClientProductImage
              imageUrl={product.image_url}
              productName={product.name}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                }}
              >
                {product.name}
              </h1>

              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--clr-saffron-dark)",
                }}
              >
                {formatNaira(product.price)}
              </div>

              {product.stock !== null && (
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: outOfStock
                      ? "var(--clr-chili)"
                      : "var(--clr-success)",
                    fontWeight: 600,
                  }}
                >
                  {outOfStock
                    ? "✗ Out of Stock"
                    : `✓ In Stock (${product.stock} available)`}
                </p>
              )}

              {product.description && (
                <div>
                  <h3
                    style={{
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "0.5rem",
                      color: "var(--clr-muted)",
                    }}
                  >
                    Description
                  </h3>
                  <p style={{ color: "var(--clr-bark-mid)", lineHeight: 1.8 }}>
                    {product.description}
                  </p>
                </div>
              )}

              <div className="divider" />

              {!outOfStock && <AddToCartButton product={product} />}
              <WhatsAppOrderButton product={product} />

              <div
                style={{
                  background: "var(--clr-cream-dark)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem",
                  fontSize: "0.875rem",
                  color: "var(--clr-muted)",
                  lineHeight: 1.7,
                }}
              >
                <strong
                  style={{
                    color: "var(--clr-bark)",
                    display: "block",
                    marginBottom: "0.25rem",
                  }}
                >
                  Payment Options
                </strong>
                🏦 Bank Transfer &nbsp;|&nbsp; 💵 Cash on Delivery
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
