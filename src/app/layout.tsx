import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import BackgroundAnimations from "@/components/ui/BackgroundAnimations";
import CartReminder from "@/components/ui/CartReminder";

export const metadata: Metadata = {
  title: "KMA Spices and Herbs – Pure Nigerian Spices",
  description: "KMA Spices and Herbs delivers pure natural spices...",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ position: "relative", minHeight: "100vh" }}>
        <BackgroundAnimations />
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        <CartReminder />
        <Analytics />
      </body>
    </html>
  );
}
