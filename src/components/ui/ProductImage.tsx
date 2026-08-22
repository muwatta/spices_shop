"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ProductCategory } from "@/types";

const CATEGORY_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  spices:     { bg: "#FDF2E4", fg: "#B45A3C", label: "Spices" },
  herbs:      { bg: "#E8F5E9", fg: "#2E7D32", label: "Herbs" },
  seasonings: { bg: "#FFF3E0", fg: "#E65100", label: "Seasonings" },
  blends:     { bg: "#FFF8E1", fg: "#F57F17", label: "Blends" },
  peppers:    { bg: "#FFEBEE", fg: "#C62828", label: "Peppers" },
  oils:       { bg: "#F1F8E9", fg: "#558B2F", label: "Oils" },
  flours:     { bg: "#FFFDE7", fg: "#F9A825", label: "Flours" },
  other:      { bg: "#F5F0EB", fg: "#8B7355", label: "Product" },
};

const FALLBACK = { bg: "#F5F0EB", fg: "#8B7355", label: "KMA" };

interface ProductImageProps {
  src: string | null;
  alt: string;
  category?: ProductCategory | null;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  style?: React.CSSProperties;
}

export default function ProductImage({
  src,
  alt,
  category,
  className,
  fill = true,
  sizes = "(max-width: 480px) 50vw, (max-width: 768px) 33vw, 25vw",
  priority = false,
  style,
}: ProductImageProps) {
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const colors = category ? CATEGORY_STYLES[category] ?? FALLBACK : FALLBACK;
  const showImage = src && !imgError;

  const handleError = useCallback(() => setImgError(true), []);

  if (!showImage) {
    return (
      <div
        className={`product-image-placeholder ${className ?? ""}`}
        style={{
          background: colors.bg,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          ...style,
        }}
        role="img"
        aria-label={alt}
      >
        <span
          style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            color: colors.fg,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            textAlign: "center",
            maxWidth: "80%",
            lineHeight: 1.3,
          }}
        >
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", ...style }}>
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: colors.bg,
          }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={className}
        style={{ objectFit: "cover", opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}
        onError={handleError}
        onLoad={() => setLoaded(true)}
        quality={75}
      />
    </div>
  );
}
