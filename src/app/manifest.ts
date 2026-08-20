import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KMA Spices & Herbs",
    short_name: "KMA Spices",
    description: "Shop natural Nigerian spices, herbs, and seasonings.",
    start_url: "/",
    display: "standalone",
    background_color: "#1E1710",
    theme_color: "#1E1710",
    orientation: "portrait-primary",
    lang: "en-NG",
    categories: ["shopping", "food", "lifestyle"],
    icons: [
      {
        src: "/images/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/images/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/images/logo.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/images/logo.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  };
}