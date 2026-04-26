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
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    return [
      order.id.toLowerCase(),
      order.customers?.full_name?.toLowerCase() ?? "",
      order.customers?.phone?.toLowerCase() ?? "",
    ].some((value) => value.includes(term));
  });

  const orderCount = filteredOrders.length;

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
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.75rem",
                margin: 0,
              }}
            >
              Orders
            </h1>
            <p
              style={{
                margin: "0.5rem 0 0",
                color: "var(--clr-muted)",
                fontSize: "0.95rem",
              }}
            >
              Manage customer orders, update status, and review payment details.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => loadOrders()}
              className="btn btn-outline btn-sm"
            >
              Refresh
            </button>
            <Link href="/admin" className="btn btn-primary btn-sm">
              Dashboard
            </Link>
          </div>
        </div>

        <div className="admin-orders__summary">
          <span className="admin-orders__summary-pill">
            Showing {orderCount} of {orders.length} orders
          </span>
          <span className="admin-orders__summary-note">
            Filter and search to find specific orders quickly.
          </span>
        </div>

        <div className="admin-orders__toolbar">
          <div className="admin-orders__search">
            <label
              htmlFor="order-search"
              className="form-label"
              style={{
                fontSize: "0.85rem",
                marginBottom: "0.35rem",
                display: "inline-block",
              }}
            >
              Search orders
            </label>
            <input
              id="order-search"
              className="form-input"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order ID, customer name, or phone"
              style={{ width: "100%" }}
            />
          </div>
          <div className="admin-orders__filters">
            {["all", ...STATUS_OPTIONS].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s as typeof filter)}
                className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-outline"}`}
                style={{ textTransform: "capitalize" }}
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
        ) : filteredOrders.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              background: "white",
              borderRadius: "var(--radius-lg)",
              color: "var(--clr-muted)",
            }}
          >
            {orders.length === 0
              ? "No orders found."
              : "No orders match your search."}
          </div>
        ) : (
          <div className="card admin-orders__table-wrapper">
            <table className="admin-orders__table">
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
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    style={{ borderBottom: "1px solid var(--clr-cream-dark)" }}
                  >
                    <td data-label="Order" style={{ padding: "0.875rem 1rem" }}>
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
                    <td
                      data-label="Customer"
                      style={{ padding: "0.875rem 1rem" }}
                    >
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
                    <td data-label="Items" style={{ padding: "0.875rem 1rem" }}>
                      {order.order_items?.length ?? 0}
                    </td>
                    <td
                      data-label="Amount"
                      style={{ padding: "0.875rem 1rem", fontWeight: 700 }}
                    >
                      {formatNaira(order.total_amount)}
                    </td>
                    <td
                      data-label="Payment"
                      style={{ padding: "0.875rem 1rem" }}
                    >
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
                    <td
                      data-label="Status"
                      style={{ padding: "0.875rem 1rem" }}
                    >
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
                          width: "100%",
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
                      data-label="Date"
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
                    <td
                      data-label="Actions"
                      style={{ padding: "0.875rem 1rem" }}
                    >
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
      <style>{`
        .admin-orders__toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 1.25rem;
        }

        .admin-orders__search {
          min-width: 280px;
          flex: 1;
          max-width: 520px;
        }

        .admin-orders__filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .admin-orders__table-wrapper {
          box-shadow: var(--shadow-sm);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .admin-orders__table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          min-width: 900px;
        }

        .admin-orders__table th,
        .admin-orders__table td {
          padding: 1rem 1.1rem;
          border-bottom: 1px solid var(--clr-cream-dark);
          vertical-align: middle;
        }

        .admin-orders__table thead {
          background: var(--clr-cream);
        }

        .admin-orders__table th {
          text-align: left;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--clr-muted);
          white-space: nowrap;
        }

        .admin-orders__summary {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          align-items: center;
        }

        .admin-orders__summary-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.65rem 0.9rem;
          border-radius: 999px;
          background: rgba(255, 243, 205, 0.9);
          color: #92400e;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .admin-orders__summary-note {
          color: var(--clr-muted);
          font-size: 0.9rem;
        }

        .admin-orders__status {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.65rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: capitalize;
        }

        .admin-orders__status--pending {
          background: #fef3c7;
          color: #92400e;
        }
        .admin-orders__status--confirmed {
          background: #dcfce7;
          color: #166534;
        }
        .admin-orders__status--delivered {
          background: #dbeafe;
          color: #1d4ed8;
        }
        .admin-orders__status--cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        .admin-orders__table-wrapper {
          overflow-x: auto;
          padding-bottom: 0.25rem;
        }

        @media (max-width: 960px) {
          .admin-orders__table {
            min-width: 720px;
          }
        }

        @media (max-width: 820px) {
          .admin-orders__toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .admin-orders__search {
            max-width: 100%;
          }

          .admin-orders__filters {
            width: 100%;
          }
        }

        @media (max-width: 740px) {
          .admin-orders__table {
            min-width: 100%;
          }

          .admin-orders__table thead {
            display: none;
          }

          .admin-orders__table,
          .admin-orders__table tbody,
          .admin-orders__table tr,
          .admin-orders__table td {
            display: block;
            width: 100%;
          }

          .admin-orders__table tr {
            margin-bottom: 1rem;
            border: 1px solid var(--clr-cream-dark);
            border-radius: var(--radius-lg);
            background: white;
            box-shadow: 0 10px 30px rgba(0,0,0,0.04);
            overflow: hidden;
          }

          .admin-orders__table td {
            padding: 0.85rem 1rem;
            border: none;
            border-bottom: 1px solid rgba(0,0,0,0.05);
          }

          .admin-orders__table td:last-child {
            border-bottom: none;
          }

          .admin-orders__table td::before {
            content: attr(data-label);
            display: block;
            margin-bottom: 0.45rem;
            font-size: 0.72rem;
            font-weight: 700;
            color: var(--clr-muted);
            letter-spacing: 0.02em;
            text-transform: uppercase;
          }

          .admin-orders__table td[data-label="Actions"] {
            padding-bottom: 1.2rem;
          }
        }
      `}</style>
    </>
  );
}
