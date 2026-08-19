/**
 * Maps product names to available local images in public/images/.
 * Used as a fallback when a product has no image_url in the database.
 */

const IMAGE_FALLBACKS: { pattern: RegExp; image: string }[] = [
  { pattern: /cardamom/i,          image: "/images/cardamom.jpg" },
  { pattern: /curry/i,             image: "/images/curry_mix.png" },
  { pattern: /ginger/i,            image: "/images/ginger_powder.jpg" },
  { pattern: /garlic/i,            image: "/images/garlic_powder.jpg" },
  { pattern: /turmeric|tumeric/i,  image: "/images/tumeric.png" },
  { pattern: /baobab|kuka/i,       image: "/images/bacbab.jpg" },
  { pattern: /okro|okra/i,         image: "/images/dry_okra.jpg" },
  { pattern: /mixed.?spice/i,      image: "/images/mixed_spices.png" },
  { pattern: /thyme|herb/i,        image: "/images/kma_leaf.jpg" },
  { pattern: /pepper|chilli|chili|cayenne|paprika|scotch|cameroon/i, image: "/images/curry_mix1.jpg" },
  { pattern: /clove|anise|nutmeg|cinnamon|fennel|coriander|fenugreek|mustard/i, image: "/images/mixed_spices_1.jpg" },
  { pattern: /suya|masala|season|blend|jerk|jollof|chinese/i, image: "/images/curry_mix.png" },
  { pattern: /flour|coconut|tiger|groundnut|bean/i, image: "/images/bacbab.jpg" },
  { pattern: /rosemary|oregano|basil|bay/i, image: "/images/kma_leaf.jpg" },
];

const DEFAULT_IMAGE = "/images/mixed_spices_1.jpg";

export function getFallbackImage(productName: string): string {
  for (const { pattern, image } of IMAGE_FALLBACKS) {
    if (pattern.test(productName)) return image;
  }
  return DEFAULT_IMAGE;
}
