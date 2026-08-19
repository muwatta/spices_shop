
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const OUTPUT_DIR = path.join(process.cwd(), "output", "products");
const BUCKET = "product-images";

// Map of slug -> display name (must match product names in the DB exactly)
// Update this list with your actual product names
const SLUG_TO_NAME: Record<string, string> = {
  "ceylon-cinnamon-sticks": "Ceylon Cinnamon Sticks",
  "whole-cloves": "Whole Cloves",
  "star-anise": "Star Anise",
  "turmeric-powder": "Turmeric Powder",
  "ginger-powder": "Ginger Powder",
  "black-pepper": "Black Pepper",
  "curry-powder-blend": "Curry Powder Blend",
  "suya-spice-mix": "Suya Spice Mix",
  "cardamom-pods": "Cardamom Pods",
  "nutmeg-whole": "Nutmeg Whole",
  // Add the rest of your products here
};

interface UploadResult {
  name: string;
  slug: string;
  url: string;
  status: "uploaded" | "skipped" | "error";
  error?: string;
}

async function uploadOne(
  slug: string,
  productName: string
): Promise<UploadResult> {
  const masterPath = path.join(OUTPUT_DIR, slug, "master.jpg");

  if (!fs.existsSync(masterPath)) {
    return { name: productName, slug, url: "", status: "error", error: "master.jpg not found" };
  }

  const buffer = fs.readFileSync(masterPath);
  const storagePath = `${slug}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    return { name: productName, slug, url: "", status: "error", error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  const publicUrl = urlData.publicUrl;

  // Find product by name and update image_url
  const { data: product, error: findError } = await supabase
    .from("products")
    .select("id, name")
    .ilike("name", productName)
    .limit(1)
    .single();

  if (findError || !product) {
    return {
      name: productName,
      slug,
      url: publicUrl,
      status: "error",
      error: `Product "${productName}" not found in database`,
    };
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({ image_url: publicUrl })
    .eq("id", product.id);

  if (updateError) {
    return {
      name: productName,
      slug,
      url: publicUrl,
      status: "error",
      error: `Upload OK but DB update failed: ${updateError.message}`,
    };
  }

  return { name: productName, slug, url: publicUrl, status: "uploaded" };
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    console.error(`Output directory not found: ${OUTPUT_DIR}`);
    console.error("Run download_product_images.py first.");
    process.exit(1);
  }

  const slugs = Object.keys(SLUG_TO_NAME);
  console.log(`Found ${slugs.length} products to upload.\n`);

  const results: UploadResult[] = [];

  for (const slug of slugs) {
    const name = SLUG_TO_NAME[slug];
    process.stdout.write(`Uploading: ${name} ... `);
    const result = await uploadOne(slug, name);
    results.push(result);

    if (result.status === "uploaded") {
      console.log(`OK -> ${result.url}`);
    } else if (result.status === "error") {
      console.log(`ERROR: ${result.error}`);
    }
  }

  // Summary
  const uploaded = results.filter((r) => r.status === "uploaded").length;
  const errors = results.filter((r) => r.status === "error");

  console.log(`\nDone. ${uploaded}/${slugs.length} uploaded successfully.`);
  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`);
    errors.forEach((e) => console.log(`  - ${e.name}: ${e.error}`));
  }

  // Write results CSV
  const csvPath = path.join(process.cwd(), "output", "upload_results.csv");
  const csvContent = [
    "name,slug,status,url,error",
    ...results.map(
      (r) =>
        `"${r.name}","${r.slug}","${r.status}","${r.url}","${r.error || ""}"`
    ),
  ].join("\n");

  fs.writeFileSync(csvPath, csvContent);
  console.log(`\nResults written to: ${csvPath}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
