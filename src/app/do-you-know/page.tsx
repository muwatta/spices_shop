import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import type { DoYouKnowItem } from "@/types";
import DoYouKnowGrid from "@/components/do-you-know/DoYouKnowGrid";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

async function getDoYouKnowItems() {
  const supabase = createClient();
  const { data } = await supabase
    .from("do_you_know_items")
    .select("*")
    .order("created_at", { ascending: false });

  return (data as DoYouKnowItem[]) ?? [];
}

export default async function DoYouKnowPage() {
  const items = await getDoYouKnowItems();

  return (
    <>
      <Navbar />
      <main style={{ padding: "3rem 0" }}>
        <div className="container" style={{ display: "grid", gap: "2.5rem" }}>
          <section style={{ padding: "2rem 0" }}>
            <div
              style={{
                display: "grid",
                gap: "1.5rem",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Image
                  src="/images/logo.jpg"
                  alt="KMA Spices logo"
                  width={92}
                  height={92}
                  style={{ borderRadius: "1.25rem", objectFit: "cover" }}
                />
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      color: "var(--clr-saffron-dark)",
                      fontWeight: 700,
                      marginBottom: "0.75rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    Do you Know
                  </p>
                  <h1
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(2.4rem, 4vw, 3.4rem)",
                      margin: 0,
                      lineHeight: 1.03,
                    }}
                  >
                    Discover the health benefits and best uses for every spice.
                  </h1>
                </div>
              </div>
              <p
                style={{
                  color: "var(--clr-bark-mid)",
                  lineHeight: 1.8,
                  fontSize: "1.05rem",
                  maxWidth: "760px",
                }}
              >
                Learn why KMA Spices and Herbs are the right choice for your
                kitchen: natural, carefully sourced products that bring flavor,
                nutrition, and convenience to every meal.
              </p>
              <Link
                href="/"
                className="btn btn-outline"
                style={{ marginTop: "0.2rem", width: "max-content" }}
              >
                Back to shop
              </Link>
            </div>
          </section>

          {items.length === 0 ? (
            <section
              style={{
                padding: "2rem",
                background: "white",
                borderRadius: "1rem",
              }}
            >
              <h2>No guides yet</h2>
              <p>
                Admins can add new health benefit and recommendation content
                from the dashboard.
              </p>
            </section>
          ) : (
            <DoYouKnowGrid items={items} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
