"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/types";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUS_OPTIONS = ["pending", "verified", "paid", "failed", "refunded"];

interface OrderActivity {
  id: string;
  action: string;
  old_value: string;
  new_value: string;
  notes: string;
  created_at: string;
}

export default function AdminOrderDetailPage() {
  const { id } = useParams() as { id: string };
  const supabase = createClient();
  const [order, setOrder] = useState<any>(null);
  const [activity, setActivity] = useState<OrderActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  async function loadOrder() {
    const response = await fetch(`/api/admin/orders/${id}`);
    const result = await response.json();
    if (!response.ok) { setOrder(null); setLoading(false); return; }
    setOrder(result.data);
    setActivity(result.activity ?? []);

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
    if (response.ok) await loadOrder();
    setSaving(false);
  }

  async function updatePaymentStatus(payment_status: string) {
    setSaving(true);
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_status }),
    });
    if (response.ok) await loadOrder();
    setSaving(false);
  }

  useEffect(() => { loadOrder(); }, [id]);

  if (loading) return (
    <div style={{ padding: "3rem", textAlign: "center" }}>
      <span className="spinner" style={{ margin: "0 auto", display: "block" }} />
    </div>
  );
  if (!order) return <div style={{ padding: "2rem" }}>Order not found.</div>;

  return (
    <div style={{ padding: "1rem", width: "100%", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/admin/orders" style={{ color: "var(--clr-terracotta)", fontSize: "0.875rem" }}>
          All Orders
        </Link>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", marginTop: "0.25rem" }}>
          Order #{order.transaction_id ?? order.id.slice(0, 8).toUpperCase()}
        </h1>
        <p style={{ color: "var(--clr-muted)", margin: "0.25rem 0 0", fontSize: "0.85rem" }}>
          {new Date(order.created_at).toLocaleString("en-NG", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      <div className="admin-order-detail-grid">
        {/* Customer info */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", marginBottom: "0.75rem" }}>Customer</h2>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            <span style={{ padding: "0.3rem 0.6rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", background: "#f3f4f6", color: "#111827", fontWeight: 600 }}>
              {order.payment_method === "bank_transfer" ? "Transfer" : "COD"}
            </span>
            <span style={{ padding: "0.3rem 0.6rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700, textTransform: "capitalize", background: "#FEF3C7", color: "#92400E" }}>
              {PAYMENT_STATUS_LABELS[order.payment_status as keyof typeof PAYMENT_STATUS_LABELS] || "Pending"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
            <div><strong>Name:</strong> {order.customers?.full_name ?? "—"}</div>
            <div><strong>Phone:</strong> {order.customers?.phone ?? "—"}</div>
            <div><strong>Address:</strong> {order.delivery_address ?? order.customers?.address ?? "—"}</div>
          </div>
          {order.customers?.phone && (
            <a
              href={`https://wa.me/${order.customers.phone.replace(/\D/g, "")}?text=Hello ${order.customers.full_name}, your order #${order.id.slice(0, 8).toUpperCase()} has been ${order.status}.`}
              target="_blank" rel="noopener noreferrer"
              className="btn whatsapp-btn btn-sm"
              style={{ marginTop: "0.75rem", width: "fit-content" }}
            >
              Message Customer
            </a>
          )}
        </div>

        {/* Status controls */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", marginBottom: "0.75rem" }}>Order Status</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            {STATUS_OPTIONS.map((s) => (
              <button key={s} onClick={() => updateStatus(s)} disabled={saving || order.status === s}
                className="btn btn-sm"
                style={{ background: order.status === s ? "var(--clr-terracotta)" : "white", color: order.status === s ? "#fff" : "var(--clr-bark)", border: "1px solid var(--clr-cream-dark)", textTransform: "capitalize", justifyContent: "flex-start", textAlign: "left" }}>
                {ORDER_STATUS_LABELS[s as keyof typeof ORDER_STATUS_LABELS]}
              </button>
            ))}
          </div>

          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", marginTop: "1.25rem", marginBottom: "0.75rem" }}>Payment Status</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            {PAYMENT_STATUS_OPTIONS.map((s) => (
              <button key={s} onClick={() => updatePaymentStatus(s)} disabled={saving || order.payment_status === s}
                className="btn btn-sm"
                style={{ background: order.payment_status === s ? "#2563EB" : "white", color: order.payment_status === s ? "#fff" : "var(--clr-bark)", border: "1px solid var(--clr-cream-dark)", textTransform: "capitalize", justifyContent: "flex-start" }}>
                {PAYMENT_STATUS_LABELS[s as keyof typeof PAYMENT_STATUS_LABELS]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="card" style={{ padding: "1.25rem", marginTop: "1.25rem" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", marginBottom: "0.75rem" }}>Items</h2>
        {(order.order_items as any[]).map((item: any) => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--clr-cream-dark)", fontSize: "0.875rem" }}>
            <span>{item.products?.name ?? "Product"} × {item.quantity}</span>
            <span style={{ fontWeight: 600 }}>{formatNaira(item.unit_price * item.quantity)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem", fontWeight: 700 }}>
          <span>Total</span>
          <span style={{ fontFamily: "var(--font-display)", color: "var(--clr-terracotta)" }}>{formatNaira(order.total_amount)}</span>
        </div>
      </div>

      {/* Payment proof */}
      {proofUrl && (
        <div className="card" style={{ padding: "1.25rem", marginTop: "1.25rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", marginBottom: "0.75rem" }}>Payment Proof</h2>
          <a href={proofUrl} target="_blank" rel="noopener noreferrer">
            <img src={proofUrl} alt="Payment proof" style={{ maxWidth: 400, borderRadius: "var(--radius-md)", border: "2px solid var(--clr-cream-dark)" }} />
          </a>
          <p style={{ fontSize: "0.8rem", color: "var(--clr-muted)", marginTop: "0.5rem" }}>Click to open full size</p>
        </div>
      )}

      {/* Activity log */}
      {activity.length > 0 && (
        <div className="card" style={{ padding: "1.25rem", marginTop: "1.25rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", marginBottom: "0.75rem" }}>Activity Log</h2>
          {activity.map((a) => (
            <div key={a.id} style={{ display: "flex", gap: "0.75rem", padding: "0.5rem 0", borderBottom: "1px solid var(--clr-cream-dark)", fontSize: "0.825rem" }}>
              <span style={{ color: "var(--clr-muted)", whiteSpace: "nowrap" }}>
                {new Date(a.created_at).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
              <span>
                <strong>{a.action === "status_change" ? "Status" : "Payment"}</strong>: {a.old_value || "—"} → {a.new_value}
                {a.notes && <span style={{ color: "var(--clr-muted)" }}> ({a.notes})</span>}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
