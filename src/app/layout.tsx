import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "KMA Spices and Herbs – Pure Nigerian Spices",
  description:
    "KMA Spices and Herbs delivers pure natural spices, herbs, flours, condiments, foodsuff and unadulterated oils with quality, freshness, and rich flavor.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
