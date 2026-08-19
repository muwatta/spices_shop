"use client";

import ProductImage from "@/components/ui/ProductImage";
import { ProductCategory } from "@/types";

export default function ClientProductImage({
  imageUrl,
  productName,
  category,
}: {
  imageUrl: string | null;
  productName: string;
  category?: ProductCategory | null;
}) {
  return (
    <div className="product-detail__image-container">
      <ProductImage
        src={imageUrl}
        alt={productName}
        category={category}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority
      />
    </div>
  );
}
