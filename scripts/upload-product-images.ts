/**
 * Upload Downloaded Product Images to Supabase Storage
 * -----------------------------------------------------
 * Reads output/products/{slug}.jpg and uploads to Supabase Storage,
 * then updates the products table with the public URL.
 *
 * SETUP
 * 1. Run download_product_images.py first
 * 2. Set env vars:
 *    export NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
 *    export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
 * 3. Run: npx tsx scripts/upload-product-images.ts
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const OUTPUT_DIR = path.join(process.cwd(), "output", "products");
const BUCKET = "product-images";

// slug -> exact product name in your database
const SLUG_TO_NAME: Record<string, string> = {
  // Spices
  "ceylon-cinnamon-sticks": "Ceylon Cinnamon Sticks",
  "whole-cloves": "Whole Cloves",
  "star-anise": "Star Anise",
  "nutmeg-whole": "Nutmeg Whole",
  "black-pepper": "Black Pepper",
  "white-pepper": "White Pepper",
  "coriander-seeds": "Coriander Seeds",
  "fennel-seeds": "Fennel Seeds",
  "fenugreek-seeds": "Fenugreek Seeds",
  "mustard-seeds": "Mustard Seeds",
  // Herbs
  "dried-thyme": "Dried Thyme",
  "dried-rosemary": "Dried Rosemary",
  "dried-oregano": "Dried Oregano",
  "bay-leaves": "Bay Leaves",
  "curry-leaves": "Curry Leaves",
  // Powders
  "turmeric-powder": "Turmeric Powder",
  "ginger-powder": "Ginger Powder",
  "garlic-powder": "Garlic Powder",
  "onion-powder": "Onion Powder",
  "cayenne-pepper": "Cayenne Pepper",
  "paprika-powder": "Paprika Powder",
  "chilli-flakes": "Chilli Flakes",
  "black-pepper-powder": "Black Pepper Powder",
  "white-pepper-powder": "White Pepper Powder",
  "cardamom-powder": "Cardamom Powder",
  // Whole Spices
  "cardamom-pods": "Cardamom Pods",
  "dried-ginger": "Dried Ginger",
  "grains-of-paradise": "Grains of Paradise",
  "alligator-pepper": "Alligator Pepper",
  // Blends
  "curry-powder-blend": "Curry Powder Blend",
  "suya-spice-mix": "Suya Spice Mix",
  "garam-masala": "Garam Masala",
  "chinese-five-spice": "Chinese Five Spice",
  "jerk-seasoning": "Jerk Seasoning",
  "fried-rice-spice": "Fried Rice Spice",
  "meat-seasoning": "Meat Seasoning",
  "fish-seasoning": "Fish Seasoning",
  // Peppers
  "cameroon-pepper": "Cameroon Pepper",
  "scotch-bonnet": "Scotch Bonnet Powder",
  "chili-powder": "Chili Powder",
  "tatashe-powder": "Tatashe Powder",
  "shombo-powder": "Shombo Powder",
  // Flours & Others
  "baobab-powder": "Baobab Powder (Kuka)",
  "dry-okro-powder": "Dry Okro Powder",
  "tiger-nut-powder": "Tiger Nut Powder",
  "coconut-flour": "Coconut Flour",
  "groundnut-powder": "Groundnut Powder",
};

interface UploadResult {
  name: string;
  slug: string;
  url: string;
  status: "uploaded" | "skipped" | "error";
  error?: string;
}

async function uploadOne(slug: string, productName: string): Promise<UploadResult> {
  const imgPath = path.join(OUTPUT_DIR, `${slug}.jpg`);
  if (!fs.existsSync(imgPath)) {
    return { name: productName, slug, url: "", status: "error", error: "file not found" };
  }

  const buffer = fs.readFileSync(imgPath);
  const storagePath = `${slug}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: true });

  if (uploadError) {
    return { name: productName, slug, url: "", status: "error", error: uploadError.message };
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  const publicUrl = urlData.publicUrl;

  // Find product by name and update
  const { data: product, error: findError } = await supabase
    .from("products")
    .select("id")
    .ilike("name", productName)
    .limit(1)
    .single();

  if (findError || !product) {
    return { name: productName, slug, url: publicUrl, status: "error", error: `Product "${productName}" not in DB` };
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({ image_url: publicUrl })
    .eq("id", product.id);

  if (updateError) {
    return { name: productName, slug, url: publicUrl, status: "error", error: `Upload OK, DB fail: ${updateError.message}` };
  }

  return { name: productName, slug, url: publicUrl, status: "uploaded" };
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    console.error(`Not found: ${OUTPUT_DIR}\nRun download_product_images.py first.`);
    process.exit(1);
  }

  const slugs = Object.keys(SLUG_TO_NAME);
  console.log(`Uploading ${slugs.length} product images...\n`);

  const results: UploadResult[] = [];
  for (const slug of slugs) {
    const name = SLUG_TO_NAME[slug];
    process.stdout.write(`  ${name} ... `);
    const r = await uploadOne(slug, name);
    results.push(r);
    console.log(r.status === "uploaded" ? "OK" : `${r.status}: ${r.error}`);
  }

  const ok = results.filter((r) => r.status === "uploaded").length;
  const fail = results.filter((r) => r.status === "error");
  console.log(`\nDone: ${ok}/${slugs.length} uploaded`);
  if (fail.length) {
    console.log("Failed:");
    fail.forEach((f) => console.log(`  - ${f.name}: ${f.error}`));
  }
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
