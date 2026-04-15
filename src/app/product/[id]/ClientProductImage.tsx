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
          style={{ objectFit: "cover" }}
          priority
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
