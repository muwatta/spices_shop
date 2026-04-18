import { createClient } from "@/lib/supabase/server";
import type { DoYouKnowItem } from "@/types";
import DoYouKnowGrid from "./DoYouKnowGrid";
import Image from "next/image";
import Link from "next/link";

const now = new Date().toISOString();

const defaultSpiceItems: DoYouKnowItem[] = [
  // ... your full defaultSpiceItems array (9 items) ...
];

async function getDoYouKnowItems(): Promise<DoYouKnowItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("do_you_know_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return defaultSpiceItems;
  }
  return data as DoYouKnowItem[];
}

export default async function DoYouKnowContent() {
  const items = await getDoYouKnowItems();

  return (
    <>
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
              sizes="(max-width: 768px) 92px, 92px"
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

      <DoYouKnowGrid items={items} />
    </>
  );
}
