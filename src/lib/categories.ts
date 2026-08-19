import { ProductCategory } from "@/types";

export interface CategoryConfig {
  slug: ProductCategory;
  label: string;
  description: string;
  href: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { slug: "spices", label: "Whole Spices", description: "Bold, aromatic spices sourced for depth and warmth in every dish.", href: "/shop?category=spices" },
  { slug: "herbs", label: "Herbs & Botanicals", description: "Fresh and dried herbs to bring fragrance and flavor to everyday cooking.", href: "/shop?category=herbs" },
  { slug: "seasonings", label: "Seasonings", description: "Expertly blended seasonings for quick, delicious meals.", href: "/shop?category=seasonings" },
  { slug: "blends", label: "Spice Blends", description: "Curated spice blends that take the guesswork out of cooking.", href: "/shop?category=blends" },
  { slug: "peppers", label: "Peppers & Heat", description: "Hot peppers and chili blends for those who love a kick of heat.", href: "/shop?category=peppers" },
  { slug: "flours", label: "Flours & Grains", description: "Quality flours for baking and cooking.", href: "/shop?category=flours" },
  { slug: "oils", label: "Oils & Condiments", description: "Cooking oils and condiments for authentic Nigerian cuisine.", href: "/shop?category=oils" },
  { slug: "other", label: "Other Products", description: "Essential kitchen products and more.", href: "/shop?category=other" },
];

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryLabel(slug: string): string {
  return getCategoryBySlug(slug)?.label ?? slug;
}
