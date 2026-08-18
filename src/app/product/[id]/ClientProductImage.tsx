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
          }}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--clr-muted)" strokeWidth="1.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" />
          </svg>
        </div>
      )}
    </div>
  );
}
