"""
KMA Spices & Herbs — Bulk Product Image Downloader
----------------------------------------------------
Downloads one licensed, commercial-use image per product from Unsplash,
crops it to a 1:1 square, and saves it as a ready-to-upload JPEG.

SETUP (run on YOUR machine, not in a sandbox)
1. Get a free Unsplash API key: https://unsplash.com/developers
2. pip install requests Pillow
3. export UNSPLASH_ACCESS_KEY="your_key_here"
4. python scripts/download_product_images.py

OUTPUT
  ./output/products/{slug}.jpg  — ready-to-upload image per product
  ./output/image_sources.csv    — photographer credits for your records

After downloading, run:
  npx tsx scripts/upload-product-images.ts
"""

import os
import csv
import time
import requests
from io import BytesIO
from PIL import Image

ACCESS_KEY = os.environ.get("UNSPLASH_ACCESS_KEY", "")
OUTPUT_DIR = "output/products"
LOG_PATH = "output/image_sources.csv"

# ── ALL PRODUCTS ────────────────────────────────────────────────────
# (display_name, unsplash_search_query, slug)
PRODUCTS = [
    # Spices
    ("Ceylon Cinnamon Sticks", "cinnamon sticks", "ceylon-cinnamon-sticks"),
    ("Whole Cloves", "cloves spice", "whole-cloves"),
    ("Star Anise", "star anise spice", "star-anise"),
    ("Nutmeg Whole", "whole nutmeg", "nutmeg-whole"),
    ("Black Pepper", "black peppercorns", "black-pepper"),
    ("White Pepper", "white pepper powder", "white-pepper"),
    ("Coriander Seeds", "coriander seeds", "coriander-seeds"),
    ("Fennel Seeds", "fennel seeds", "fennel-seeds"),
    ("Fenugreek Seeds", "fenugreek seeds", "fenugreek-seeds"),
    ("Mustard Seeds", "mustard seeds spice", "mustard-seeds"),

    # Herbs
    ("Dried Thyme", "dried thyme herbs", "dried-thyme"),
    ("Dried Rosemary", "dried rosemary", "dried-rosemary"),
    ("Dried Oregano", "dried oregano", "dried-oregano"),
    ("Bay Leaves", "bay leaves", "bay-leaves"),
    ("Curry Leaves", "curry leaves", "curry-leaves"),

    # Powders
    ("Turmeric Powder", "turmeric powder", "turmeric-powder"),
    ("Ginger Powder", "ginger powder", "ginger-powder"),
    ("Garlic Powder", "garlic powder", "garlic-powder"),
    ("Onion Powder", "onion powder", "onion-powder"),
    ("Cayenne Pepper", "cayenne pepper powder", "cayenne-pepper"),
    ("Paprika Powder", "paprika powder", "paprika-powder"),
    ("Chilli Flakes", "chilli flakes", "chilli-flakes"),
    ("Black Pepper Powder", "ground black pepper", "black-pepper-powder"),
    ("White Pepper Powder", "white pepper ground", "white-pepper-powder"),
    ("Cardamom Powder", "cardamom powder", "cardamom-powder"),

    # Whole Spices / Seeds
    ("Cardamom Pods", "cardamom pods", "cardamom-pods"),
    ("Dried Ginger", "dried ginger root", "dried-ginger"),
    ("Grains of Paradise", "grains of paradise spice", "grains-of-paradise"),
    ("Alligator Pepper", "alligator pepper", "alligator-pepper"),

    # Blends
    ("Curry Powder Blend", "curry powder blend", "curry-powder-blend"),
    ("Suya Spice Mix", "suya spice mix", "suya-spice-mix"),
    ("Garam Masala", "garam masala", "garam-masala"),
    ("Chinese Five Spice", "five spice powder", "chinese-five-spice"),
    ("Jerk Seasoning", "jerk seasoning spice", "jerk-seasoning"),
    ("Fried Rice Spice", "fried rice seasoning", "fried-rice-spice"),
    ("Meat Seasoning", "meat seasoning blend", "meat-seasoning"),
    ("Fish Seasoning", "fish seasoning spice", "fish-seasoning"),

    # Peppers
    ("Cameroon Pepper", "cameroon pepper", "cameroon-pepper"),
    ("Scotch Bonnet Powder", "scotch bonnet pepper", "scotch-bonnet"),
    ("Chili Powder", "chili powder", "chili-powder"),
    ("Tatashe Powder", "red bell pepper powder", "tatashe-powder"),
    ("Shombo Powder", "cayenne pepper flakes", "shombo-powder"),

    # Flours & Others
    ("Baobab Powder (Kuka)", "baobab powder", "baobab-powder"),
    ("Dry Okro Powder", "dried okra powder", "dry-okro-powder"),
    ("Tiger Nut Powder", "tiger nut flour", "tiger-nut-powder"),
    ("Coconut Flour", "coconut flour", "coconut-flour"),
    ("Groundnut Powder", "groundnut powder", "groundnut-powder"),
]


def search_unsplash(query):
    url = "https://api.unsplash.com/search/photos"
    params = {"query": query, "per_page": 5, "orientation": "squarish"}
    headers = {"Authorization": f"Client-ID {ACCESS_KEY}"}
    resp = requests.get(url, params=params, headers=headers, timeout=15)
    resp.raise_for_status()
    results = resp.json().get("results", [])
    return results[0] if results else None


def crop_to_square(img):
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))


def process_product(name, query, slug, log_rows):
    out_path = os.path.join(OUTPUT_DIR, f"{slug}.jpg")
    if os.path.exists(out_path):
        print(f"  SKIP (exists): {name}")
        log_rows.append([name, slug, query, "EXISTS", "", ""])
        return

    print(f"  Downloading: {name} ...")
    result = search_unsplash(query)
    if not result:
        print(f"  NOT FOUND: '{query}' — needs manual photo")
        log_rows.append([name, slug, query, "NOT FOUND", "", ""])
        return

    image_url = result["urls"]["regular"]
    photographer = result["user"]["name"]
    source_page = result["links"]["html"]

    img_resp = requests.get(image_url, timeout=20)
    img = Image.open(BytesIO(img_resp.content)).convert("RGB")
    img = crop_to_square(img)
    img = img.resize((1000, 1000), Image.LANCZOS)
    img.save(out_path, "JPEG", quality=85)

    log_rows.append([name, slug, query, image_url, photographer, source_page])
    print(f"  OK: {out_path}")


def main():
    if not ACCESS_KEY:
        raise SystemExit(
            "Missing UNSPLASH_ACCESS_KEY.\n\n"
            "Steps:\n"
            "1. Go to https://unsplash.com/developers\n"
            "2. Create an app, copy the Access Key\n"
            "3. Run:\n"
            "   export UNSPLASH_ACCESS_KEY='your_key_here'\n"
            "   python scripts/download_product_images.py"
        )

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    log_rows = [["product_name", "slug", "search_query", "image_url", "photographer", "source_page"]]

    print(f"Downloading {len(PRODUCTS)} product images from Unsplash...\n")
    for name, query, slug in PRODUCTS:
        process_product(name, query, slug, log_rows)
        time.sleep(1.5)  # Unsplash free tier: 50 req/hour

    with open(LOG_PATH, "w", newline="", encoding="utf-8") as f:
        csv.writer(f).writerows(log_rows)

    found = sum(1 for r in log_rows[1:] if r[3] not in ("NOT FOUND", "EXISTS"))
    exists = sum(1 for r in log_rows[1:] if r[3] == "EXISTS")
    missing = sum(1 for r in log_rows[1:] if r[3] == "NOT FOUND")

    print(f"\nDone: {found} downloaded, {exists} already existed, {missing} not found")
    print(f"Source log: {LOG_PATH}")
    print(f"\nNext step: npx tsx scripts/upload-product-images.ts")


if __name__ == "__main__":
    main()
