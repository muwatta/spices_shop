import type { Metadata } from "next";
import InfoPage, { InfoSection } from "@/components/layout/InfoPage";

export const metadata: Metadata = {
  title: "About KMA Spices & Herbs",
  description: "Learn about KMA Spices & Herbs — premium Nigerian spices, freshly packed and carefully sourced.",
};

const sections: InfoSection[] = [
  {
    title: "Good food starts with good ingredients",
    body: "KMA Spices & Herbs is a Nigerian spice brand helping home cooks bring more depth, aroma, and confidence to everyday meals. We make it easier to find dependable ingredients without losing the character of the food you love.",
  },
  {
    title: "Freshness with purpose",
    body: "Our spices, herbs, and seasonings are selected with flavour and everyday usefulness in mind. From curry and thyme to suya blends and pepper, each product is prepared to be practical in a real kitchen.",
    bullets: ["100% natural product options", "Freshly packed for orders", "Clear stock and pricing information", "Delivery across Nigeria"],
  },
  {
    title: "Made for Nigerian cooking",
    body: "Whether you are preparing jollof rice, pepper soup, suya, grilled chicken, or a simple weekday stew, KMA is built around the ingredients that make familiar meals memorable.",
  },
  {
    title: "A better way to shop",
    body: "Browse by category, search by name, read product details and reviews, save products you like, and use the Spice Guide for suggestions when you are not sure what to choose.",
  },
];

export default function AboutPage() {
  return <InfoPage eyebrow="Our story" title="About KMA Spices & Herbs" intro="Premium Nigerian spices, herbs, and seasonings for confident cooking at home." sections={sections} contactLabel="Have a question about KMA?" />;
}
