"use client";

import { useEffect, useState, useCallback } from "react";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import styles from "./page.module.css";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/types";

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
  transaction_id?: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_proof_url: string | null;
  total_amount: number;
  created_at: string;
  customers: Customer | null;
  order_items: OrderItem[];
}

interface PaginatedOrders {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#FEF3C7", color: "#92400E" },
  confirmed: { bg: "#D1FAE5", color: "#065F46" },
  processing: { bg: "#DBEAFE", color: "#1E40AF" },
  out_for_delivery: { bg: "#EDE9FE", color: "#5B21B6" },
  delivered: { bg: "#D1FAE5", color: "#065F46" },
  cancelled: { bg: "#FEE2E2", color: "#991B1B" },
};

const PAYMENT_METHOD_COLORS: Record<string, { bg: string; color: string }> = {
  cash_on_delivery: { bg: "#FEF3C7", color: "#92400E" },
  bank_transfer: { bg: "#DBEAFE", color: "#1E40AF" },
  paystack: { bg: "#D1FAE5", color: "#065F46" },
};

export default function AdminOrdersPage() {
  const [data, setData] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "cod" | "transfer">("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const handleSearch = () => setSearchTerm(searchInput.trim());
  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setFilter("all");
    setPaymentFilter("all");
    setPaymentStatusFilter("all");
    setPage(1);
  };

  function downloadOrdersCsv() {
    const rows = filteredOrders.map((order) => {
      const customer = order.customers;
      return [
        order.transaction_id ?? order.id,
        order.id,
        customer?.full_name ?? "",
        customer?.phone ?? "",
        "",
        ORDER_STATUS_LABELS[order.status],
        order.payment_method === "bank_transfer" ? "Bank Transfer" : "COD",
        PAYMENT_STATUS_LABELS[order.payment_status],
        formatNaira(order.total_amount),
        String(order.order_items?.length ?? 0),
        new Date(order.created_at).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        order.payment_proof_url ? "Yes" : "No",
      ];
    });

    const headers = ["Transaction ID", "Order UUID", "Customer", "Phone", "Email", "Status", "Payment Method", "Payment Status", "Total Amount", "Items", "Created At", "Payment Proof"];
    const csvContent = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (filter !== "all") params.set("status", filter);
    if (paymentFilter !== "all") params.set("payment_method", paymentFilter);
    if (paymentStatusFilter !== "all") params.set("payment_status", paymentStatusFilter);

    const response = await fetch(`/api/admin/orders?${params}`);
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.error || "Failed to load orders");
      setLoading(false);
      return;
    }
    setData(result);
    setLoading(false);
  }, [page, filter, paymentFilter, paymentStatusFilter]);

  useEffect(() => { setPage(1); }, [filter, paymentFilter, paymentStatusFilter]);
  useEffect(() => { loadOrders(); }, [loadOrders]);

  const orders = data?.orders ?? [];
  const filteredOrders = orders.filter((order) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return [
        order.transaction_id?.toLowerCase() ?? "",
        order.id.toLowerCase(),
        order.customers?.full_name?.toLowerCase() ?? "",
        order.customers?.phone?.toLowerCase() ?? "",
      ].some((v) => v.includes(term));
    }
    return true;
  });

  async function updateStatus(orderId: string, status: OrderStatus) {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const result = await response.json();
    if (!response.ok) { toast.error(result.error || "Failed"); return; }
    toast.success("Status updated");
    loadOrders();
  }

  async function updatePaymentStatus(orderId: string, payment_status: PaymentStatus) {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_status }),
    });
    const result = await response.json();
    if (!response.ok) { toast.error(result.error || "Failed"); return; }
    toast.success("Payment status updated");
    loadOrders();
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Orders</h1>
            {data && (
              <p style={{ margin: "0.25rem 0 0", color: "var(--clr-muted)", fontSize: "0.85rem" }}>
                {data.total} total · Page {data.page}/{data.totalPages}
              </p>
            )}
          </div>
          <div className={styles.headerActions}>
            <button onClick={() => loadOrders()} className="btn btn-outline btn-sm">Refresh</button>
            <button onClick={downloadOrdersCsv} className="btn btn-outline btn-sm">Export CSV</button>
            <Link href="/admin" className="btn btn-outline btn-sm">Dashboard</Link>
          </div>
        </div>

        {}
        <div className={styles.filtersSection}>
          <div className={styles.searchRow}>
            <input className="form-input" type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Search by name, phone, or order ID" />
            <button onClick={handleSearch} className="btn btn-primary btn-sm">Search</button>
            <button onClick={clearSearch} className="btn btn-outline btn-sm">Clear</button>
          </div>

          <div className={styles.filterRow}>
            {(["all", "pending", "confirmed", "processing", "delivered", "cancelled"] as const).map((s) => (
              <button key={s} onClick={() => setFilter(s)} className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-outline"}`}>
                {s === "all" ? "All Status" : ORDER_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
          <div className={styles.filterRow}>
            {([["all", "All Payment"], ["cod", "COD"], ["transfer", "Transfer"]] as const).map(([val, label]) => (
              <button key={val} onClick={() => setPaymentFilter(val)} className={`btn btn-sm ${paymentFilter === val ? "btn-primary" : "btn-outline"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className={styles.filterRow}>
            {(["all", "pending", "verified", "paid"] as const).map((s) => (
              <button key={s} onClick={() => setPaymentStatusFilter(s)} className={`btn btn-sm ${paymentStatusFilter === s ? "btn-primary" : "btn-outline"}`}>
                {s === "all" ? "All Pay Status" : PAYMENT_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <span className="spinner" style={{ margin: "0 auto" }} />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", background: "#fff", borderRadius: "var(--radius-lg)", color: "var(--clr-muted)" }}>
            {orders.length === 0 ? "No orders found." : "No orders match your search."}
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--clr-cream-dark)", background: "var(--clr-cream)" }}>
                    {["Order", "Customer", "Items", "Amount", "Payment", "Status", "Actions"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--clr-muted)", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                    const pc = PAYMENT_METHOD_COLORS[order.payment_method] || PAYMENT_METHOD_COLORS.cash_on_delivery;
                    return (
                    <tr key={order.id} style={{ borderBottom: "1px solid var(--clr-cream-dark)" }}>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          <Link href={`/admin/orders/${order.id}`} style={{ color: "var(--clr-terracotta)", fontWeight: 700 }}>
                            #{order.transaction_id ?? order.id.slice(0, 8).toUpperCase()}
                          </Link>
                          <span style={{ fontSize: "0.75rem", color: "var(--clr-muted)" }}>
                            {new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "2-digit" })}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <div style={{ fontWeight: 500 }}>{order.customers?.full_name ?? "—"}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--clr-muted)" }}>{order.customers?.phone}</div>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>{order.order_items?.length ?? 0}</td>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>{formatNaira(order.total_amount)}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                          <span style={{ display: "inline-block", padding: "0.15rem 0.5rem", borderRadius: "var(--radius-full)", fontSize: "0.7rem", fontWeight: 600, background: pc.bg, color: pc.color }}>
                            {order.payment_method === "bank_transfer" ? "Transfer" : "COD"}
                          </span>
                          <span style={{ fontSize: "0.7rem", color: "var(--clr-muted)", textTransform: "capitalize" }}>
                            {PAYMENT_STATUS_LABELS[order.payment_status] || "Pending"}
                          </span>
                          {order.payment_proof_url && (
                            <a href={order.payment_proof_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.7rem", color: "var(--clr-success)" }}>
                              View proof
                            </a>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span style={{ display: "inline-block", padding: "0.2rem 0.625rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 600, background: sc.bg, color: sc.color, textTransform: "capitalize" }}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                          <Link href={`/admin/orders/${order.id}`} className="btn btn-ghost btn-sm">View</Link>
                          {order.payment_method === "cash_on_delivery" && order.payment_status === "pending" && (
                            <button className="btn btn-sm" style={{ background: "var(--clr-success)", color: "#fff", border: "none" }}
                              onClick={() => updatePaymentStatus(order.id, "paid")}>
                              Mark Paid
                            </button>
                          )}
                          {order.payment_method === "bank_transfer" && order.payment_status === "pending" && (
                            <button className="btn btn-sm" style={{ background: "#2563EB", color: "#fff", border: "none" }}
                              onClick={() => updatePaymentStatus(order.id, "verified")}>
                              Verify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.ordersGrid} aria-label="Orders list">
              {filteredOrders.map((order) => {
                const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                const pc = PAYMENT_METHOD_COLORS[order.payment_method] || PAYMENT_METHOD_COLORS.cash_on_delivery;
                return (
                  <article key={order.id} className={styles.orderCard}>
                    <div className={styles.orderCardHeader}>
                      <div>
                        <span className={styles.orderCardLabel}>Order</span>
                        <Link href={`/admin/orders/${order.id}`} className={styles.orderCardId}>
                          #{order.transaction_id ?? order.id.slice(0, 8).toUpperCase()}
                        </Link>
                        <span className={styles.orderCardDate}>
                          {new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "2-digit" })}
                        </span>
                      </div>
                      <strong className={styles.orderCardAmount}>{formatNaira(order.total_amount)}</strong>
                    </div>

                    <div className={styles.orderCardBody}>
                      <div className={styles.orderCardRow}>
                        <span className={styles.orderCardLabel}>Customer</span>
                        <span className={styles.orderCardValue}>{order.customers?.full_name ?? "-"}</span>
                      </div>
                      <div className={styles.orderCardRow}>
                        <span className={styles.orderCardLabel}>Items</span>
                        <span className={styles.orderCardValue}>{order.order_items?.length ?? 0}</span>
                      </div>
                      <div className={styles.orderCardRow}>
                        <span className={styles.orderCardLabel}>Amount</span>
                        <span className={styles.orderCardValue}>{formatNaira(order.total_amount)}</span>
                      </div>
                      <div className={styles.orderCardRow}>
                        <span className={styles.orderCardLabel}>Payment</span>
                        <span className={styles.orderCardValue}>
                          <span className={styles.paymentBadge} style={{ background: pc.bg, color: pc.color }}>
                            {order.payment_method === "bank_transfer" ? "Transfer" : "COD"}
                          </span>
                          <small>{PAYMENT_STATUS_LABELS[order.payment_status] || "Pending"}</small>
                        </span>
                      </div>
                      <div className={styles.orderCardRow}>
                        <span className={styles.orderCardLabel}>Status</span>
                        <span className={styles.statusBadge} style={{ background: sc.bg, color: sc.color }}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </div>
                    </div>

                    <div className={styles.orderCardActions}>
                      <Link href={`/admin/orders/${order.id}`} className="btn btn-ghost btn-sm">View order</Link>
                      {order.payment_method === "cash_on_delivery" && order.payment_status === "pending" && (
                        <button className="btn btn-sm" style={{ background: "var(--clr-success)", color: "#fff", border: "none" }} onClick={() => updatePaymentStatus(order.id, "paid")}>
                          Mark paid
                        </button>
                      )}
                      {order.payment_method === "bank_transfer" && order.payment_status === "pending" && (
                        <button className="btn btn-sm" style={{ background: "#2563EB", color: "#fff", border: "none" }} onClick={() => updatePaymentStatus(order.id, "verified")}>
                          Verify
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {data && data.totalPages > 1 && (
          <div className={styles.pagination}>
            <button className="btn btn-sm btn-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span className={styles.paginationInfo}>Page {data.page} of {data.totalPages}</span>
            <button className="btn btn-sm btn-outline" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </>
  );
}
