
import os
import csv
import time
import shutil
import requests
from io import BytesIO
from PIL import Image

ACCESS_KEY = os.environ.get("UNSPLASH_ACCESS_KEY", "")
OUTPUT_DIR = "output/products"
LOG_PATH = "output/image_sources.csv"

PRODUCTS = [
    ("Ceylon Cinnamon Sticks", "cinnamon sticks", "ceylon-cinnamon-sticks"),
    ("Whole Cloves", "cloves spice macro", "whole-cloves"),
    ("Star Anise", "star anise", "star-anise"),
    ("Turmeric Powder", "turmeric powder bowl", "turmeric-powder"),
    ("Ginger Powder", "ginger powder", "ginger-powder"),
    ("Black Pepper", "black peppercorns", "black-pepper"),
    ("Curry Powder Blend", "curry powder spice blend", "curry-powder-blend"),
    ("Suya Spice Mix", "suya spice mix nigerian", "suya-spice-mix"),
    ("Cardamom Pods", "cardamom pods", "cardamom-pods"),
    ("Nutmeg Whole", "whole nutmeg", "nutmeg-whole"),
    # ... add the rest of your 40 here, same (name, query, slug) format
]

SIZES = {
    "master.jpg": 1000,
    "grid.jpg": 400,
    "cart.jpg": 120,
    "minicart.jpg": 96,
}


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
    print(f"Processing: {name}")
    result = search_unsplash(query)
    if not result:
        print(f"  NO IMAGE FOUND for '{query}' — flag '{name}' for manual photography")
        log_rows.append([name, slug, query, "NOT FOUND", "", ""])
        return

    image_url = result["urls"]["regular"]
    photographer = result["user"]["name"]
    source_page = result["links"]["html"]

    img_resp = requests.get(image_url, timeout=20)
    img = Image.open(BytesIO(img_resp.content)).convert("RGB")
    img = crop_to_square(img)

    product_dir = os.path.join(OUTPUT_DIR, slug)
    os.makedirs(product_dir, exist_ok=True)

    for filename, size in SIZES.items():
        resized = img.resize((size, size), Image.LANCZOS)
        resized.save(os.path.join(product_dir, filename), "JPEG", quality=85)

    log_rows.append([name, slug, query, image_url, photographer, source_page])
    print(f"  Saved to {product_dir}/")

    time.sleep(1.5)


def main():
    if not ACCESS_KEY:
        raise SystemExit(
            "Missing UNSPLASH_ACCESS_KEY. Set it with:\n"
            "  export UNSPLASH_ACCESS_KEY='your_key_here'"
        )

    os.makedirs("output", exist_ok=True)
    log_rows = [["product_name", "slug", "search_query", "image_url", "photographer", "source_page"]]

    for name, query, slug in PRODUCTS:
        process_product(name, query, slug, log_rows)

    with open(LOG_PATH, "w", newline="", encoding="utf-8") as f:
        csv.writer(f).writerows(log_rows)

    print(f"\nDone. {len(PRODUCTS)} products processed. Source log: {LOG_PATH}")
    print("Review any 'NOT FOUND' rows and source those manually.")

    zip_base = "kma_product_images"
    shutil.make_archive(zip_base, "zip", OUTPUT_DIR)
    print(f"Zipped: {zip_base}.zip (contains all product image folders)")

    # Also copy the source log into a top-level zip alongside the images
    # so credits/licensing info travels with the images.
    shutil.copy(LOG_PATH, f"{zip_base}_sources.csv")
    print(f"Source log copied to: {zip_base}_sources.csv")


if __name__ == "__main__":
    main()
