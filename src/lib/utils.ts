export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function sanitizeRedirect(
  redirect: string | null | undefined,
  fallback = "/account",
): string {
  if (!redirect || typeof redirect !== "string") return fallback;
  if (!redirect.startsWith("/")) return fallback;
  if (redirect.startsWith("//")) return fallback;
  return redirect;
}

export function sanitizeSearchQuery(query: string): string {
  return query.replace(/[^a-zA-Z0-9\s%\-_.@]/g, "").trim();
}

export function generateTransactionId(): string {
  const prefix = "KMA26";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return (
    prefix +
    Array.from(
      { length: 4 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("")
  );
}

export function buildWhatsAppUrl(phone: string, orderSummary: string): string {
  const message = encodeURIComponent(orderSummary);
  return `https://wa.me/${phone}?text=${message}`;
}

export function buildOrderWhatsAppMessage(
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
): string {
  const lines = items
    .map(
      (i) =>
        `• ${i.name} x${i.quantity} — ${formatNaira(i.price * i.quantity)}`,
    )
    .join("\n");
  return `Hello! I'd like to order:\n\n${lines}\n\nTotal: ${formatNaira(total)}\n\nPlease confirm availability.`;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "#f59e0b",
    confirmed: "#3b82f6",
    delivered: "#10b981",
    cancelled: "#ef4444",
  };
  return map[status] ?? "#6b7280";
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return map[status] ?? status;
}
