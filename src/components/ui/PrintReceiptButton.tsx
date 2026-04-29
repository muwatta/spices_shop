"use client";

export default function PrintReceiptButton({
  className,
}: {
  className?: string;
}) {
  return (
    <button
      onClick={() => window.print()}
      className={`btn btn-outline ${className ?? ""}`}
      style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
    >
      🖨️ Print Receipt
    </button>
  );
}
