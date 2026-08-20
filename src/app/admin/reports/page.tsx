"use client";

import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";

interface OrderSummary {
  id: string;
  transaction_id?: string;
  created_at: string;
  status: string;
  total_amount: number;
  payment_method: string;
  customers: { full_name: string; phone: string; email: string } | null;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AdminReportsPage() {
  const now = new Date();
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
    lowStockProducts: [] as any[],
  });
  const [orders, setOrders] = useState<OrderSummary[]>([]);

  const years = Array.from(
    { length: 4 },
    (_, index) => now.getFullYear() - index,
  );

  async function loadReport() {
    setLoading(true);
    const response = await fetch(
      `/api/admin/reports?month=${month}&year=${year}`,
    );
    const payload = await response.json();

    if (!response.ok) {
      console.error("[reports] failed to load", payload.error);
      setLoading(false);
      return;
    }

    setStats({
      totalOrders: payload.totalOrders ?? 0,
      totalSales: payload.totalSales ?? 0,
      pendingOrders: payload.pendingOrders ?? 0,
      lowStockProducts: payload.lowStockProducts ?? [],
    });
    setOrders(payload.orders ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadReport();
  }, [month, year]);

  function downloadCsv() {
    const headers = [
      "Order ID",
      "Customer",
      "Phone",
      "Email",
      "Status",
      "Payment Method",
      "Total Amount",
      "Created At",
    ];
    const rows = orders.map((order) => [
      order.transaction_id ?? order.id,
      order.customers?.full_name ?? "",
      order.customers?.phone ?? "",
      order.customers?.email ?? "",
      order.status,
      order.payment_method === "bank_transfer"
        ? "Bank Transfer"
        : "Cash on Delivery",
      formatNaira(order.total_amount),
      new Date(order.created_at).toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kma-orders-${year}-${String(month).padStart(2, "0")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading report...
      </div>
    );

  return (
    <div style={{ padding: "2rem" }}>
      <div className="admin-report-header">
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.75rem",
              marginBottom: "0.5rem",
            }}
          >
            Inventory & Sales Report
          </h1>
          <p style={{ color: "var(--clr-muted)", margin: 0 }}>
            View order totals and inventory for {MONTHS[month - 1]} {year}.
          </p>
        </div>
        <button onClick={downloadCsv} className="btn btn-primary btn-sm">
          Export month CSV
        </button>
      </div>

      <div className="admin-report-controls">
        <label className="admin-report-field">
          <span style={{ fontSize: "0.85rem", color: "var(--clr-muted)" }}>
            Month
          </span>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="form-input"
          >
            {MONTHS.map((label, index) => (
              <option key={label} value={index + 1}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-report-field admin-report-field--compact">
          <span style={{ fontSize: "0.85rem", color: "var(--clr-muted)" }}>
            Year
          </span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="form-input"
          >
            {years.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-report-stats" style={{ marginBottom: "2rem" }}>
        <div className="card admin-stat-card">
          <div className="admin-stat-value">{stats.totalOrders}</div>
          <div className="admin-stat-label">Orders</div>
        </div>
        <div className="card admin-stat-card">
          <div
            className="admin-stat-value"
            style={{ color: "var(--clr-terracotta)" }}
          >
            {formatNaira(stats.totalSales)}
          </div>
          <div className="admin-stat-label">Sales</div>
        </div>
        <div className="card admin-stat-card">
          <div className="admin-stat-value">{stats.pendingOrders}</div>
          <div className="admin-stat-label">Pending Orders</div>
        </div>
      </div>

      <div className="card admin-report-section">
        <h2 className="admin-report-section__title">Monthly Orders</h2>
        {orders.length === 0 ? (
          <p style={{ color: "var(--clr-muted)" }}>
            No orders were placed during {MONTHS[month - 1]} {year}.
          </p>
        ) : (
          <div className="admin-report-order-list">
            {orders.map((order) => (
              <div key={order.id} className="admin-report-order-card">
                <div>
                  <div className="admin-report-order__id">
                    #{order.transaction_id ?? order.id.slice(0, 8).toUpperCase()}
                  </div>
                  <div className="admin-report-order__meta">
                    <span>{order.customers?.full_name ?? "-"}</span>
                    <span>• {formatNaira(order.total_amount)}</span>
                    <span>
                      •{" "}
                      {new Date(order.created_at).toLocaleString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <div className="admin-report-order__actions">
                  <span
                    className={`badge badge-${order.status}`}
                    style={{ fontSize: "0.85rem" }}
                  >
                    {order.status}
                  </span>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="btn btn-ghost btn-sm"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card admin-report-section">
        <h2 className="admin-report-section__title">
          Low Stock Products (≤5 left)
        </h2>
        {stats.lowStockProducts.length === 0 ? (
          <p style={{ color: "var(--clr-muted)" }}>
            All products have sufficient stock.
          </p>
        ) : (
          <ul className="admin-report-list">
            {stats.lowStockProducts.map((p) => (
              <li key={p.name} className="admin-report-list__item">
                <strong>{p.name}</strong> – Only {p.stock} left
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
