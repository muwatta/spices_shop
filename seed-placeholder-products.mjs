import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const products = [
  ["Ceylon Cinnamon Sticks", "spices", "cinnamon spice"], ["Whole Cloves", "spices", "cloves spice"],
  ["Star Anise", "spices", "star anise spice"], ["Whole Nutmeg", "spices", "nutmeg spice"],
  ["Black Pepper", "spices", "black pepper spice"], ["White Pepper", "spices", "white pepper spice"],
  ["Coriander Seeds", "spices", "coriander seeds spice"], ["Fennel Seeds", "spices", "fennel seeds spice"],
  ["Fenugreek Seeds", "spices", "fenugreek seeds spice"], ["Mustard Seeds", "spices", "mustard seeds spice"],
  ["Dried Thyme", "herbs", "dried thyme herb"], ["Dried Rosemary", "herbs", "dried rosemary herb"],
  ["Dried Oregano", "herbs", "dried oregano herb"], ["Bay Leaves", "herbs", "bay leaves herb"],
  ["Curry Leaves", "herbs", "curry leaves herb"], ["Turmeric Powder", "spices", "turmeric powder spice"],
  ["Ginger Powder", "spices", "ginger powder spice"], ["Garlic Powder", "seasonings", "garlic powder spice"],
  ["Onion Powder", "seasonings", "onion powder spice"], ["Cayenne Pepper", "peppers", "cayenne pepper spice"],
  ["Paprika Powder", "peppers", "paprika powder spice"], ["Chilli Flakes", "peppers", "chilli flakes spice"],
  ["Black Pepper Powder", "spices", "ground black pepper spice"], ["White Pepper Powder", "spices", "ground white pepper spice"],
  ["Cardamom Powder", "spices", "cardamom spice"], ["Cardamom Pods", "spices", "cardamom pods spice"],
  ["Dried Ginger", "spices", "dried ginger spice"], ["Grains of Paradise", "spices", "grains of paradise spice"],
  ["Alligator Pepper", "peppers", "alligator pepper spice"], ["Curry Powder Blend", "blends", "curry powder spice blend"],
  ["Suya Spice Mix", "blends", "suya spice mix"], ["Garam Masala", "blends", "garam masala spice"],
  ["Chinese Five Spice", "blends", "five spice blend"], ["Jerk Seasoning", "seasonings", "jerk seasoning spice"],
  ["Fried Rice Spice", "seasonings", "fried rice seasoning"], ["Meat Seasoning", "seasonings", "meat seasoning spice"],
  ["Fish Seasoning", "seasonings", "fish seasoning spice"], ["Cameroon Pepper", "peppers", "cameroon pepper spice"],
  ["Scotch Bonnet Powder", "peppers", "scotch bonnet pepper"], ["Chili Powder", "peppers", "chili powder spice"],
  ["Tatashe Powder", "peppers", "red pepper powder spice"], ["Shombo Powder", "peppers", "red chili pepper spice"],
  ["Baobab Powder (Kuka)", "flours", "baobab fruit powder"], ["Dry Okro Powder", "flours", "dried okra"],
  ["Tiger Nut Powder", "flours", "tiger nut flour"], ["Coconut Flour", "flours", "coconut flour"],
  ["Groundnut Powder", "flours", "groundnut powder"], ["Palm Oil", "oils", "palm oil cooking"],
  ["Coconut Oil", "oils", "coconut oil cooking"], ["Natural Honey", "other", "natural honey jar"],
];

function readEnv() {
  return fs.readFile(path.join(process.cwd(), ".env.local"), "utf8").then((text) => {
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
    }
  });
}

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function searchCommons(query) {
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json`;
  for (const wait of [0, 5000, 15000, 30000]) {
    if (wait) await sleep(wait);
    try {
      const response = await fetch(searchUrl, { headers: { "User-Agent": "KMA-Spice-Shop/1.0" } });
      if (response.status === 429) continue;
      if (!response.ok) throw new Error(`image search returned ${response.status}`);
      return response.json();
    } catch (error) {
      if (wait === 30000) throw error;
    }
  }
  throw new Error("image search remained rate limited after retries");
}

async function uploadImage(supabase, bucket, storagePath, image) {
  for (const wait of [0, 5000, 15000, 30000]) {
    if (wait) await sleep(wait);
    try {
      const result = await supabase.storage.from(bucket).upload(storagePath, image, { contentType: "image/jpeg", upsert: true });
      if (!result.error) return;
    } catch (error) {
      if (wait === 30000) throw error;
    }
  }
  throw new Error("image upload remained unavailable after retries");
}

async function main() {
  await readEnv();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error("Supabase credentials are missing from .env.local");

  const supabase = createClient(supabaseUrl, serviceKey);
  const bucket = "product-images";
  await fs.mkdir(path.join(process.cwd(), "output", "placeholder-products"), { recursive: true });

  for (let index = 0; index < products.length; index += 1) {
    const [name, category, query] = products[index];
    const slug = slugify(name);
    const imagePath = path.join(process.cwd(), "output", "placeholder-products", `${slug}.jpg`);
    process.stdout.write(`${index + 1}/${products.length} ${name} ... `);
    let image;
    try {
      image = await fs.readFile(imagePath);
    } catch {
      const searchData = await searchCommons(query);
      const pages = Object.values(searchData.query?.pages ?? {});
      const thumbnail = pages.find((page) => page.imageinfo?.[0]?.thumburl)?.imageinfo?.[0]?.thumburl;
      if (!thumbnail) throw new Error("no relevant Wikimedia image found");
      image = execFileSync("curl", ["-L", "--fail", "--silent", "--show-error", "-A", "KMA-Spice-Shop/1.0", thumbnail]);
      await fs.writeFile(imagePath, image);
    }

    const storagePath = `placeholders/${slug}.jpg`;
    await uploadImage(supabase, bucket, storagePath, image);
    const publicUrl = supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;

    const existing = await supabase.from("products").select("id").eq("name", name).maybeSingle();
    if (existing.error) throw existing.error;
    const values = { image_url: publicUrl, price: 1500, stock: 25 };
    const result = existing.data
      ? await supabase.from("products").update(values).eq("id", existing.data.id)
      : await supabase.from("products").insert({ ...values, name, description: "Placeholder catalog item for handover. Update the image, price, stock, and description from the admin panel." });
    if (result.error) throw result.error;
    console.log("OK");
    await sleep(1500);
  }
  console.log(`\nCompleted ${products.length} editable placeholder products. Review them at /admin/products.`);
}

main().catch((error) => {
  console.error(`\nSeed failed: ${error.stack || error.message || error}`);
  if (error.cause) console.error("Cause:", error.cause);
  process.exit(1);
});
