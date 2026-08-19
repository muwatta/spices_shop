/**
 * Assign Local Images to Products
 * ---------------------------------
 * Maps public/images/ files to products in your database by name match.
 * Uploads images to Supabase Storage and sets image_url on each product.
 *
 * SETUP
 *   export NEXT_PUBLIC_SUPABASE_URL="https://kwfmjsyylslutjlfdwpn.supabase.co"
 *   export SUPABASE_SERVICE_ROLE_KEY="your_key"
 *   npx tsx scripts/assign-images-to-products.ts
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const supabase = createClient(url, key);
const BUCKET = "product-images";

// product name fragment -> local image file
const IMAGE_MAP: Record<string, string> = {
  "cardamom":      "cardamom.jpg",
  "curry":         "curry_mix.png",
  "ginger":        "ginger_powder.jpg",
  "garlic":        "garlic_powder.jpg",
  "turmeric":      "tumeric.png",
  "baobab":        "bacbab.jpg",
  "kuka":          "bacbab.jpg",
  "okro":          "dry_okra.jpg",
  "okra":          "dry_okra.jpg",
  "mixed spice":   "mixed_spices.png",
  "thyme":         "kma_leaf.jpg",
  "herb":          "kma_leaf.jpg",
};

const IMAGES_DIR = path.join(process.cwd(), "public", "images");

async function main() {
  // Get all products without an image
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, image_url");

  if (error) {
    console.error("Failed to fetch products:", error.message);
    process.exit(1);
  }

  console.log(`Found ${products.length} products total.\n`);

  let assigned = 0;
  let skipped = 0;

  for (const product of products) {
    if (product.image_url) {
      skipped++;
      continue;
    }

    const nameLower = product.name.toLowerCase();
    let matched = false;

    for (const [keyword, filename] of Object.entries(IMAGE_MAP)) {
      if (nameLower.includes(keyword)) {
        const filePath = path.join(IMAGES_DIR, filename);
        if (!fs.existsSync(filePath)) {
          console.log(`  SKIP ${product.name}: file ${filename} not found`);
          continue;
        }

        const buffer = fs.readFileSync(filePath);
        const storagePath = `${product.id}.jpg`;

        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, buffer, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadErr) {
          console.log(`  ERROR ${product.name}: ${uploadErr.message}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(storagePath);

        const { error: updateErr } = await supabase
          .from("products")
          .update({ image_url: urlData.publicUrl })
          .eq("id", product.id);

        if (updateErr) {
          console.log(`  ERROR updating DB for ${product.name}: ${updateErr.message}`);
          continue;
        }

        console.log(`  OK ${product.name} -> ${filename}`);
        assigned++;
        matched = true;
        break;
      }
    }

    if (!matched) {
      console.log(`  NO MATCH: ${product.name}`);
    }
  }

  console.log(`\nDone: ${assigned} assigned, ${skipped} already had images, ${products.length - assigned - skipped} unmatched`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
