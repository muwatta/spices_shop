import type { Metadata } from "next";
import InfoPage, { InfoSection } from "@/components/layout/InfoPage";

export const metadata: Metadata = {
  title: "Terms of Service — KMA Spices & Herbs",
  description: "Terms of service for KMA Spices & Herbs online store.",
};

const sections: InfoSection[] = [
  { title: "Acceptance of terms", body: "By accessing or using the KMA Spices & Herbs website, you agree to these terms. If you do not agree, please do not use the store." },
  { title: "Products and information", body: "We work to keep product names, descriptions, images, prices, and stock information accurate. Images are illustrative and packaging or appearance may vary slightly. Products are subject to availability." },
  { title: "Orders and payment", body: "An order is confirmed after we receive and review it. We accept cash on delivery and bank transfer. Bank transfer orders require valid payment proof. We may cancel an order where an item is unavailable, information is incorrect, or fraud is suspected." },
  { title: "Delivery", body: "We deliver across Nigeria. Delivery fees and eligibility are shown at checkout. Delivery times are estimates and may vary by location, courier availability, weather, or other circumstances outside our control." },
  { title: "Returns and refunds", body: "Because our products are food items, returns are generally not accepted after delivery. If an item is damaged or incorrect, contact us within 24 hours with your order number and clear photos so we can review a replacement or refund." },
  { title: "Responsible use", body: "Product information is provided for shopping guidance and is not medical advice. Follow the instructions on product packaging and consider allergies or dietary requirements before use." },
  { title: "Contact", body: "Questions about these terms can be sent to kmafoods22@gmail.com or raised through our available customer support channels." },
];

export default function TermsPage() {
  return <InfoPage eyebrow="Store policy" title="Terms of Service" intro="The practical terms for using the KMA online store and placing an order." updated="August 2026" sections={sections} contactLabel="Need clarification on a term?" />;
}
