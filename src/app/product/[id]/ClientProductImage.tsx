"use client";

import { useState } from "react";
import Image from "next/image";

export default function ClientProductImage({
  imageUrl,
  productName,
}: {
  imageUrl: string | null;
  productName: string;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "1",
        background: "var(--clr-cream-dark)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      {imageUrl && !imgError ? (
        <Image
          src={imageUrl}
          alt={productName}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "6rem",
          }}
        >
          🌶
        </div>
      )}
    </div>
  );
}
