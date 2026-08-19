"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ProductCategory } from "@/types";

const CATEGORY_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  spices:     { bg: "#FDF2E4", fg: "#B45A3C", label: "🌶" },
  herbs:      { bg: "#E8F5E9", fg: "#2E7D32", label: "🌿" },
  seasonings: { bg: "#FFF3E0", fg: "#E65100", label: "🧂" },
  blends:     { bg: "#FFF8E1", fg: "#F57F17", label: "🍲" },
  peppers:    { bg: "#FFEBEE", fg: "#C62828", label: "🔥" },
  oils:       { bg: "#F1F8E9", fg: "#558B2F", label: "🫒" },
  flours:     { bg: "#FFFDE7", fg: "#F9A825", label: "🌾" },
  other:      { bg: "#F5F5F5", fg: "#616161", label: "📦" },
};

const FALLBACK_COLORS = { bg: "#F5F0EB", fg: "#8B7355", label: "🌿" };

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

  const colors = category ? CATEGORY_COLORS[category] ?? FALLBACK_COLORS : FALLBACK_COLORS;
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
        <span style={{ fontSize: "2.5rem", lineHeight: 1 }} aria-hidden="true">
          {colors.label}
        </span>
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            color: colors.fg,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "2rem", opacity: 0.5 }}>{colors.label}</span>
        </div>
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
        quality={80}
      />
    </div>
  );
}
