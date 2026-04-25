import { Suspense } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import type { DoYouKnowItem } from "@/types";
import DoYouKnowGrid from "@/components/do-you-know/DoYouKnowGrid";
import Image from "next/image";
import Link from "next/link";
import DoYouKnowSkeleton from "@/components/do-you-know/DoYouKnowSkeleton";

export const revalidate = 60;

const now = new Date().toISOString();

const defaultSpiceItems: DoYouKnowItem[] = [
  {
    id: "curry-mix",
    name: "Curry Mix – ₦2,000",
    subtitle: "Aromatic, anti‑inflammatory, and full of flavour",
    benefits:
      "Aids digestion, fights inflammation, rich in turmeric and coriander.",
    recommendation:
      "Use 1–2 tbsp in jollof, fried rice, or chicken stew. Hand‑blended, no fillers.",
    image_url: "/images/curry_mix.png",
    created_at: now,
  },
  {
    id: "mixed-spices",
    name: "Mixed Spices – ₦2,500",
    subtitle: "The all‑purpose flavour booster",
    benefits:
      "Boosts metabolism, supports heart health, packed with antioxidants.",
    recommendation:
      "Rub onto chicken, fish, or tofu before grilling, or sprinkle over roasted potatoes.",
    image_url: "/images/mixed_spices.png",
    created_at: now,
  },
  {
    id: "ginger-powder",
    name: "Ginger Powder – ₦2,500",
    subtitle: "Nature’s tummy soother",
    benefits: "Relieves nausea, reduces muscle pain, fights colds.",
    recommendation:
      "Stir ½ tsp into warm water + honey for a wellness shot, or use in pepper soup, curries, baked goods.",
    image_url: "/images/ginger_powder.jpg",
    created_at: now,
  },
  {
    id: "italian-spice",
    name: "Italian Spice – ₦2,000",
    subtitle: "Mediterranean herbs, locally blended",
    benefits: "Rich in antioxidants, supports immunity, reduces inflammation.",
    recommendation:
      "Sprinkle over pasta, pizza, roasted vegetables, or homemade bread.",
    image_url: "/images/kma_leaf.jpg",
    created_at: now,
  },
  {
    id: "signature-spice",
    name: "Signature Spice – ₦2,500",
    subtitle: "Our chef’s special blend",
    benefits:
      "Smoked paprika, cumin, garlic, coriander, cinnamon – lifts every dish.",
    recommendation:
      "Use as a dry rub for suya, or add to stews and stir‑fries.",
    image_url: "/images/tumeric.png",
    created_at: now,
  },
  {
    id: "garam-masala",
    name: "Garam Masala – ₦2,500",
    subtitle: "Warm, aromatic, essential",
    benefits: "Improves circulation, warms the body, adds sweet‑spicy depth.",
    recommendation:
      "Finish curries, lentil dishes, or roasted meats with a pinch before serving.",
    image_url: "/images/cardamom.jpg",
    created_at: now,
  },
  {
    id: "cardamom",
    name: "Cardamom – ₦5,000",
    subtitle: "The queen of spices",
    benefits: "Detoxifies the body, freshens breath, aids digestion.",
    recommendation:
      "Crush one pod into tea, coffee, rice pudding, meat marinades, or biryani.",
    image_url: "/images/cardamom.jpg",
    created_at: now,
  },
  {
    id: "dry-okro",
    name: "Dry Okro Powder – ₦3,500",
    subtitle: "Natural thickener, rich in fibre",
    benefits: "Low calorie, high fibre, gluten‑free.",
    recommendation:
      "Stir into ogbono, okro soup, or vegetable stew. Also great for gluten‑free baking.",
    image_url: "/images/dry_okra.jpg",
    created_at: now,
  },
  {
    id: "baobab",
    name: "Baobab Powder (Kuka) – ₦2,000",
    subtitle: "The African superfruit",
    benefits:
      "Packed with vitamin C (6× more than orange!), calcium, antioxidants.",
    recommendation:
      "Add a tablespoon to smoothies, yoghurt, water, or use in traditional miyan kuka.",
    image_url: "/images/bacbab.jpg",
    created_at: now,
  },
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

// This component does the actual data fetching and rendering
async function DoYouKnowContent() {
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
              loading="lazy"
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

// The main page component – uses Suspense to show a skeleton while loading
export default function DoYouKnowPage() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "3rem 0" }}>
        <div className="container" style={{ display: "grid", gap: "2.5rem" }}>
          <Suspense fallback={<DoYouKnowSkeleton />}>
            <DoYouKnowContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
