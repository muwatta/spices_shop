"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useMiniCartStore } from "@/lib/store/miniCart";
import type { Product } from "@/types";

export default function ReorderButton({ orderId }: { orderId: string }) {
  const addItem = useCartStore((state) => state.addItem);
  const openMiniCart = useMiniCartStore((state) => state.open);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [message, setMessage] = useState("");

  async function reorder() {
    setStatus("loading");
    setMessage("");
    const response = await fetch(`/api/account/orders/${orderId}/reorder`, { method: "POST" });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Could not reorder this purchase.");
      setStatus("idle");
      return;
    }

    const available = result.items.filter((item: { available: boolean }) => item.available);
    available.forEach((item: { product: Product; quantity: number }) => addItem(item.product.id, item.quantity, item.product.stock));
    if (available[0]) openMiniCart(available[0].product, available[0].quantity);
    const unavailable = result.unavailable?.length ?? 0;
    setMessage(unavailable ? `${available.length} added; ${unavailable} unavailable.` : "Previous items added to cart.");
    setStatus("done");
  }

  return (
    <div className="reorder-action">
      <button className="btn btn-primary btn-sm" onClick={reorder} disabled={status === "loading"}>
        {status === "loading" ? "Checking stock..." : "Buy again"}
      </button>
      {message && <span role="status">{message}</span>}
    </div>
  );
}
