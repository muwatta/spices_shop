"use client";

import { useEffect, useState, useCallback } from "react";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

interface Customer {
  full_name: string;
  phone: string;
  email: string;
}

interface OrderItem {
  id: string;
}

interface Order {
  id: string;
  status: OrderStatus;
  payment_method: "bank_transfer" | "cash_on_delivery";
  payment_proof_url: string | null;
  total_amount: number;
  created_at: string;
  customers: Customer | null;
  order_items: OrderItem[];
}

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "delivered",
  "cancelled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const searchParams = new URLSearchParams();
    if (filter !== "all") searchParams.set("status", filter);

    const response = await fetch(
      `/api/admin/orders?${searchParams.toString()}`,
    );
    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error || "Failed to load orders");
      setLoading(false);
      return;
    }

    setOrders(result.data ?? []);
    setLoading(false);
  }, [filter]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
    );

    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error || "Failed to update status");
      loadOrders();
      return;
    }

    const order = orders.find((o) => o.id === orderId);
    if (order?.customers?.email) {
      await fetch("/api/send-order-status-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: order.customers.email,
          orderId,
          status,
          customerName: order.customers.full_name,
        }),
      });
    }

    toast.success("Order status updated");
  }

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <>
      <Toaster position="top-right" />
      <div style={{ padding: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <h1
            style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem" }}
          >
            Orders
          </h1>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {["all", ...STATUS_OPTIONS].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s as typeof filter)}
                className="btn btn-sm"
                style={{
                  background: filter === s ? "var(--clr-bark)" : "white",
                  color: filter === s ? "var(--clr-cream)" : "var(--clr-bark)",
                  border: "2px solid var(--clr-bark)",
                  textTransform: "capitalize",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <span className="spinner" style={{ margin: "0 auto" }} />
          </div>
        ) : orders.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              background: "white",
              borderRadius: "var(--radius-lg)",
              color: "var(--clr-muted)",
            }}
          >
            No orders found.
          </div>
        ) : (
          <div className="card" style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid var(--clr-cream-dark)",
                    background: "var(--clr-cream)",
                  }}
                >
                  {[
                    "Order",
                    "Customer",
                    "Items",
                    "Amount",
                    "Payment",
                    "Status",
                    "Date",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "0.875rem 1rem",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: "var(--clr-muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    style={{ borderBottom: "1px solid var(--clr-cream-dark)" }}
                  >
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        style={{
                          color: "var(--clr-saffron-dark)",
                          fontWeight: 700,
                        }}
                      >
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ fontWeight: 500 }}>
                        {order.customers?.full_name ?? "—"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--clr-muted)",
                        }}
                      >
                        {order.customers?.phone}
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      {order.order_items?.length ?? 0}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", fontWeight: 700 }}>
                      {formatNaira(order.total_amount)}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      {order.payment_method === "bank_transfer"
                        ? "🏦 Transfer"
                        : "💵 COD"}
                      {order.payment_proof_url && (
                        <span
                          style={{
                            color: "var(--clr-success)",
                            marginLeft: "0.25rem",
                            fontSize: "0.75rem",
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(order.id, e.target.value as OrderStatus)
                        }
                        className="form-input"
                        style={{
                          padding: "0.35rem 0.5rem",
                          fontSize: "0.8125rem",
                          cursor: "pointer",
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td
                      style={{
                        padding: "0.875rem 1rem",
                        color: "var(--clr-muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(order.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
