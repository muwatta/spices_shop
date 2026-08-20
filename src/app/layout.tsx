import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import CartReminder from "@/components/ui/CartReminder";
import BackToTop from "@/components/ui/BackToTop";
import ClientWidgets from "@/components/layout/ClientWidgets";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: {
    default: "KMA Spices & Herbs — Premium Nigerian Spices",
    template: "%s | KMA Spices & Herbs",
  },
  description:
    "Shop 100% natural Nigerian spices, herbs, and seasonings. Curry, thyme, ginger, pepper, and more. Bank transfer or cash on delivery across Nigeria.",
  keywords: [
    "Nigerian spices",
    "buy spices online Nigeria",
    "curry powder Nigeria",
    "thyme",
    "ginger powder",
    "garlic powder",
    "black pepper",
    "turmeric",
    "suya spice",
    "pepper soup spice",
    "jollof seasoning",
    "chicken seasoning",
    "natural spices Lagos",
  ],
  openGraph: {
    title: "KMA Spices & Herbs — Premium Nigerian Spices",
    description:
      "100% natural Nigerian spices, herbs, and seasonings. Curry, thyme, ginger, pepper & more. Bank transfer or cash on delivery.",
    type: "website",
    locale: "en_NG",
    siteName: "KMA Spices & Herbs",
  },
  icons: {
    icon: [
      { url: "/favicon-v2.ico", sizes: "any" },
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon-v2.ico",
    apple: "/images/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1E1710",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientWidgets />
        {children}
        <BackToTop />
        <CartReminder />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
