/**
 * Product Image Sourcing Script
 * 
 * Fetches product images from Pexels API for products without images.
 * Requires PEXELS_API_KEY environment variable.
 * 
 * Usage:
 *   PEXELS_API_KEY=your_key npx tsx scripts/source-product-images.ts
 * 
 * Steps:
 *   1. Pulls product list from Supabase
 *   2. For each product without image_url, searches Pexels by ingredient name
 *   3. Downloads the top result
 *   4. Saves to public/images/products/{slug}.jpg
 *   5. Updates product.image_url in Supabase
 *   6. Logs source/license info to image-sources.csv
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!PEXELS_API_KEY) {
  console.error("Error: PEXELS_API_KEY environment variable is required");
  console.error("Get a free API key at https://www.pexels.com/api/");
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface PexelsPhoto {
  id: number;
  src: {
    large2x: string;
    large: string;
    medium: string;
    small: string;
    original: string;
  };
  alt: string;
  photographer: string;
  photographer_url: string;
  url: string;
  width: number;
  height: number;
}

interface PexelsResponse {
  photos: PexelsPhoto[];
  total_results: number;
}

// Search queries mapped to product name patterns
function getSearchQuery(productName: string): string {
  const name = productName.toLowerCase();
  
  // Direct ingredient mappings
  const mappings: Record<string, string> = {
    "cinnamon": "cinnamon sticks close up",
    "cloves": "dried cloves macro",
    "turmeric": "turmeric powder bowl",
    "ginger": "ginger powder spice",
    "garlic": "garlic powder spice",
    "cardamom": "cardamom pods close up",
    "curry": "curry powder bowl",
    "pepper": "black pepper corns",
    "chili": "dried chili peppers",
    "thyme": "dried thyme herbs",
    "oregano": "dried oregano",
    "basil": "dried basil leaves",
    "nutmeg": "nutmeg whole spice",
    "star anise": "star anise spice",
    "saffron": "saffron threads spice",
    "paprika": "paprika powder red",
    "cumin": "cumin seeds spice",
    "coriander": "coriander seeds spice",
    "bay leaf": "bay leaves dried",
    "rosemary": "rosemary dried herbs",
    "sage": "sage dried herbs",
    "mint": "dried mint leaves",
    "fennel": "fennel seeds spice",
    "fenugreek": "fenugreek seeds spice",
    "tamarind": "tamarind fruit",
    "bay leaves": "bay leaves dried",
    "lemongrass": "lemongrass dried",
    "suya": "suya spice mix",
    "jollof": "jollof seasoning blend",
    "pepper soup": "pepper soup spice mix",
    "ogbono": "ogbono seeds",
    "groundnut": "groundnut peanut",
    "palm oil": "palm oil red",
    "okro": "dried okra",
    "okra": "dried okra",
    "egusi": "melon seeds",
    "plantain": "plantain flour",
    "yam": "yam flour",
    "cassava": "cassava flour",
    "coconut": "coconut oil",
    "shea": "shea butter",
    "cocoa": "cocoa powder",
    "honey": "natural honey",
  };

  for (const [key, query] of Object.entries(mappings)) {
    if (name.includes(key)) return query;
  }

  // Fallback: use product name directly
  return `${productName} spice ingredient`;
}

async function searchPexels(query: string): Promise<PexelsPhoto | null> {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=square`;
  
  const response = await fetch(url, {
    headers: { Authorization: PEXELS_API_KEY! },
  });

  if (!response.ok) {
    console.error(`  Pexels API error: ${response.status} ${response.statusText}`);
    return null;
  }

  const data: PexelsResponse = await response.json();
  
  if (data.photos.length === 0) {
    console.log(`  No results for "${query}"`);
    return null;
  }

  // Prefer well-lit, square-ish images
  const photo = data.photos.find((p) => {
    const ratio = p.width / p.height;
    return ratio > 0.8 && ratio < 1.2; // Roughly square
  }) || data.photos[0];

  return photo;
}

async function downloadImage(url: string, destPath: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) return false;
    
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(destPath, buffer);
    return true;
  } catch (err) {
    console.error(`  Download failed: ${err}`);
    return false;
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  console.log("=== KMA Product Image Sourcing ===\n");

  // Fetch products without images
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, category, image_url")
    .order("name");

  if (error) {
    console.error("Failed to fetch products:", error.message);
    process.exit(1);
  }

  const productsNeedingImages = products.filter((p) => !p.image_url);
  const productsWithImages = products.filter((p) => p.image_url);

  console.log(`Total products: ${products.length}`);
  console.log(`Already have images: ${productsWithImages.length}`);
  console.log(`Need images: ${productsNeedingImages.length}\n`);

  if (productsNeedingImages.length === 0) {
    console.log("All products already have images!");
    return;
  }

  // Ensure output directory exists
  const outputDir = path.join(process.cwd(), "public", "images", "products");
  await fs.mkdir(outputDir, { recursive: true });

  // CSV log
  const csvLines: string[] = ["product_id,product_name,category,pexels_id,photographer,photographer_url,source_url,image_path"];
  
  let successCount = 0;
  let failCount = 0;

  for (const product of productsNeedingImages) {
    console.log(`Processing: ${product.name} (${product.category || "uncategorized"})`);
    
    const query = getSearchQuery(product.name);
    console.log(`  Search query: "${query}"`);
    
    const photo = await searchPexels(query);
    if (!photo) {
      console.log(`  ⚠ No suitable image found\n`);
      failCount++;
      continue;
    }

    console.log(`  Found: Pexels #${photo.id} by ${photo.photographer}`);
    console.log(`  Source: ${photo.url}`);

    const slug = slugify(product.name);
    const filename = `${slug}.jpg`;
    const filepath = path.join(outputDir, filename);

    // Download the large version
    const downloaded = await downloadImage(photo.src.large2x || photo.src.large, filepath);
    if (!downloaded) {
      console.log(`  ⚠ Download failed\n`);
      failCount++;
      continue;
    }

    // Update Supabase
    const imageUrl = `/images/products/${filename}`;
    const { error: updateError } = await supabase
      .from("products")
      .update({ image_url: imageUrl })
      .eq("id", product.id);

    if (updateError) {
      console.log(`  ⚠ Database update failed: ${updateError.message}\n`);
      failCount++;
      continue;
    }

    // Log to CSV
    csvLines.push(
      `${product.id},"${product.name}",${product.category || ""},${photo.id},"${photo.photographer}","${photo.photographer_url}","${photo.url}","${imageUrl}"`
    );

    console.log(`  ✓ Saved to ${filename}\n`);
    successCount++;

    // Rate limit: 200 requests/hour on Pexels free tier
    await new Promise((r) => setTimeout(r, 500));
  }

  // Write CSV log
  const csvPath = path.join(process.cwd(), "image-sources.csv");
  await fs.writeFile(csvPath, csvLines.join("\n"));
  console.log(`\nImage source log saved to: ${csvPath}`);

  console.log(`\n=== Complete ===`);
  console.log(`✓ Success: ${successCount}`);
  console.log(`✗ Failed: ${failCount}`);
  console.log(`→ Remaining without images: ${failCount}`);
}

main().catch(console.error);
