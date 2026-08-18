import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import CartReminder from "@/components/ui/CartReminder";
import BackToTop from "@/components/ui/BackToTop";
import MiniCartDrawer from "@/components/ui/MiniCartDrawer";
import BottomNav from "@/components/layout/BottomNav";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: {
    default: "KMA Spices & Herbs - Premium Nigerian Spices",
    template: "%s | KMA Spices & Herbs",
  },
  description:
    "Premium Nigerian spices and seasonings for everyday cooking. 100% natural, freshly packed. Curry, thyme, ginger, pepper, and more. Order with bank transfer or cash on delivery.",
  keywords: [
    "Nigerian spices",
    "curry powder",
    "thyme",
    "ginger powder",
    "garlic powder",
    "black pepper",
    "paprika",
    "turmeric",
    "seasoning",
    "suya spice",
    "pepper soup spice",
    "jollof seasoning",
    "chicken seasoning",
  ],
  openGraph: {
    title: "KMA Spices & Herbs",
    description:
      "Premium Nigerian spices and seasonings for everyday cooking. 100% natural, freshly packed.",
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
    shortcut: "/favicon.ico",
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
        <BackToTop />
        <SpeedInsights />
        <MiniCartDrawer />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </div>
        <CartReminder />
        <BottomNav />
        <Analytics />
      </body>
    </html>
  );
}
