"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";

const STATUS_OPTIONS = ["pending", "confirmed", "delivered", "cancelled"];

export default function AdminOrderDetailPage() {
  const { id } = useParams() as { id: string };
  const supabase = createClient();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  async function loadOrder() {
    const response = await fetch(`/api/admin/orders/${id}`);
    const result = await response.json();

    if (!response.ok) {
      console.error("Failed to load order:", result.error);
      setOrder(null);
      setLoading(false);
      return;
    }

    setOrder(result.data);

    if (result.data?.payment_proof_url) {
      const { data: urlData } = await supabase.storage
        .from("payment-proofs")
        .createSignedUrl(result.data.payment_proof_url, 3600);
      setProofUrl(urlData?.signedUrl ?? null);
    }

    setLoading(false);
  }

  async function updateStatus(status: string) {
    setSaving(true);
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const result = await response.json();

    if (!response.ok) {
      console.error("Failed to update order status:", result.error);
      setSaving(false);
      return;
    }

    await loadOrder();
    setSaving(false);
  }

  useEffect(() => {
    loadOrder();
  }, [id]);

  if (loading)
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <span
          className="spinner"
          style={{ margin: "0 auto", display: "block" }}
        />
      </div>
    );
  if (!order) return <div style={{ padding: "2rem" }}>Order not found.</div>;

  return (
    <div style={{ padding: "2rem", width: "100%", maxWidth: "820px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/admin/orders"
          style={{ color: "var(--clr-saffron-dark)", fontSize: "0.875rem" }}
        >
          ← All Orders
        </Link>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.6rem",
            marginTop: "0.25rem",
          }}
        >
          Order #{order.transaction_id ?? order.id.slice(0, 8).toUpperCase()}
        </h1>
        <p
          style={{
            color: "var(--clr-muted)",
            margin: "0.5rem 0 0",
            fontSize: "0.95rem",
          }}
        >
          {new Date(order.created_at).toLocaleString("en-NG", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="admin-order-detail-grid">
        {/* Customer info */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
              alignItems: "flex-start",
              marginBottom: "1rem",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.05rem",
                  marginBottom: "0.75rem",
                }}
              >
                Customer
              </h2>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.4rem 0.75rem",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    background: "#f3f4f6",
                    color: "#111827",
                  }}
                >
                  {order.payment_method === "bank_transfer"
                    ? "🏦 Transfer"
                    : "💵 COD"}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.4rem 0.75rem",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    background:
                      order.status === "pending"
                        ? "#fef3c7"
                        : order.status === "confirmed"
                          ? "#dcfce7"
                          : order.status === "delivered"
                            ? "#dbeafe"
                            : "#fee2e2",
                    color:
                      order.status === "pending"
                        ? "#92400e"
                        : order.status === "confirmed"
                          ? "#166534"
                          : order.status === "delivered"
                            ? "#1d4ed8"
                            : "#991b1b",
                    textTransform: "capitalize",
                    fontWeight: 700,
                  }}
                >
                  {order.status}
                </span>
              </div>
            </div>
            <div style={{ minWidth: "160px", textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                }}
              >
                {formatNaira(order.total_amount)}
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--clr-muted)",
                  marginTop: "0.35rem",
                }}
              >
                {new Date(order.created_at).toLocaleString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              fontSize: "0.95rem",
              color: "var(--clr-bark)",
            }}
          >
            <div>
              <strong>Name:</strong> {order.customers?.full_name ?? "—"}
            </div>
            <div>
              <strong>Phone:</strong> {order.customers?.phone ?? "—"}
            </div>
            <div>
              <strong>Address:</strong>{" "}
              {order.delivery_address ?? order.customers?.address ?? "—"}
            </div>
          </div>

          {order.customers?.phone && (
            <a
              href={`https://wa.me/${order.customers.phone.replace(/\D/g, "")}?text=Hello ${order.customers.full_name}, your order #${order.id.slice(0, 8).toUpperCase()} has been ${order.status}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn whatsapp-btn btn-sm"
              style={{ marginTop: "1rem", width: "fit-content" }}
            >
              💬 Message Customer
            </a>
          )}
        </div>

        {/* Status control */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.05rem",
              marginBottom: "1rem",
            }}
          >
            Update Status
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                disabled={saving || order.status === s}
                className="btn btn-sm"
                style={{
                  background:
                    order.status === s ? "var(--clr-saffron)" : "white",
                  color: "var(--clr-bark)",
                  border: "2px solid var(--clr-cream-dark)",
                  textTransform: "capitalize",
                  justifyContent: "flex-start",
                  opacity: order.status === s ? 1 : 0.85,
                }}
              >
                {order.status === s ? "✓ " : ""}
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.05rem",
            marginBottom: "1rem",
          }}
        >
          Items
        </h2>
        {(order.order_items as any[]).map((item: any) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.625rem 0",
              borderBottom: "1px solid var(--clr-cream-dark)",
              fontSize: "0.9rem",
            }}
          >
            <span>
              {item.products?.name ?? "Product"} × {item.quantity}
            </span>
            <span style={{ fontWeight: 600 }}>
              {formatNaira(item.unit_price * item.quantity)}
            </span>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1rem",
            fontWeight: 700,
          }}
        >
          <span>Total</span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--clr-saffron-dark)",
              fontSize: "1.1rem",
            }}
          >
            {formatNaira(order.total_amount)}
          </span>
        </div>
      </div>

      {/* Payment proof */}
      {proofUrl && (
        <div
          className="card"
          style={{ padding: "1.5rem", marginTop: "1.5rem" }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.05rem",
              marginBottom: "1rem",
            }}
          >
            Payment Proof
          </h2>
          <a href={proofUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={proofUrl}
              alt="Payment proof"
              style={{
                maxWidth: "400px",
                borderRadius: "var(--radius-md)",
                border: "2px solid var(--clr-cream-dark)",
              }}
            />
          </a>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--clr-muted)",
              marginTop: "0.5rem",
            }}
          >
            Click to open full size
          </p>
        </div>
      )}

      {order.payment_method === "bank_transfer" && !proofUrl && (
        <div className="alert alert-warning" style={{ marginTop: "1.5rem" }}>
          ⚠️ No payment proof uploaded yet.
        </div>
      )}
      <style>{`
        .admin-order-detail-grid {
          display: grid;
          grid-template-columns: 1.35fr 0.9fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 900px) {
          .admin-order-detail-grid {
            grid-template-columns: 1fr;
          }
        }

        .admin-order-detail-grid .card {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
