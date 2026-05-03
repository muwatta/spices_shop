import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import BackgroundAnimations from "@/components/ui/BackgroundAnimations";
import CartReminder from "@/components/ui/CartReminder";
import BackToTop from "@/components/ui/BackToTop";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "KMA Spices and Herbs – Pure Nigerian Spices",
  description: "KMA Spices and Herbs delivers pure natural spices...",
  icons: {
    icon: [
      { url: "/public/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/public/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <BackToTop />
        <BackgroundAnimations />
        <SpeedInsights />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </div>

        <CartReminder />
        <Analytics />
      </body>
    </html>
  );
}
