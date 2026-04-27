"use client";

import { Product } from "@/types";
import {
  buildWhatsAppUrl,
  buildOrderWhatsAppMessage,
  formatNaira,
} from "@/lib/utils";

export default function WhatsAppOrderButton({ product }: { product: Product }) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!phone) return null;

  function handleWhatsApp() {
    const confirmText = `Do you want to order ${product.name} via WhatsApp for ${formatNaira(product.price)}?`;
    if (!window.confirm(confirmText)) {
      return;
    }

    const message = buildOrderWhatsAppMessage(
      [{ name: product.name, quantity: 1, price: product.price }],
      product.price,
    );
    window.open(buildWhatsAppUrl(phone!, message), "_blank");
  }

  return (
    <button
      className="btn btn-lg whatsapp-btn"
      onClick={handleWhatsApp}
      style={{ width: "100%" }}
    >
      💬 Order via WhatsApp
    </button>
  );
}
