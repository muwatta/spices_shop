import type { ProductCategory } from "@/types";

const CATEGORY_BENEFITS: Record<ProductCategory, string[]> = {
  spices: ["Adds rich flavor with less salt", "Supports versatile everyday cooking", "A little goes a long way"],
  herbs: ["Adds fresh, aromatic character", "Brightens soups, sauces, and salads", "Easy to use in everyday meals"],
  seasonings: ["Makes meals flavorful in less time", "Creates consistent taste every time", "Works across meat, rice, and vegetables"],
  blends: ["Balances complementary flavors", "Simplifies meal preparation", "Ideal for quick, reliable cooking"],
  peppers: ["Adds bold heat and depth", "Brings character to sauces and marinades", "Easy to adjust to your preferred heat"],
  flours: ["Useful for baking and thickening", "Supports everyday kitchen staples", "Easy to measure and store"],
  oils: ["Enhances flavor and texture", "Useful for cooking and finishing", "Complements authentic Nigerian dishes"],
  other: ["Useful for everyday kitchen needs", "Easy to add to regular meal routines", "A practical pantry essential"],
};

export function getProductBenefits(benefits: string | null | undefined, category: ProductCategory | null): string[] {
  const savedBenefits = benefits?.split("\n").map((benefit) => benefit.trim()).filter(Boolean) ?? [];
  if (savedBenefits.length >= 3) return savedBenefits.slice(0, 3);
  const defaults = CATEGORY_BENEFITS[category ?? "other"];
  return [...savedBenefits, ...defaults].slice(0, 3);
}