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
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
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

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
            minWidth: "170px",
          }}
        >
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

        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
            minWidth: "140px",
          }}
        >
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div
          className="card"
          style={{ padding: "1.5rem", textAlign: "center" }}
        >
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>
            {stats.totalOrders}
          </div>
          <div style={{ color: "var(--clr-muted)" }}>Orders</div>
        </div>
        <div
          className="card"
          style={{ padding: "1.5rem", textAlign: "center" }}
        >
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--clr-saffron-dark)",
            }}
          >
            {formatNaira(stats.totalSales)}
          </div>
          <div style={{ color: "var(--clr-muted)" }}>Sales</div>
        </div>
        <div
          className="card"
          style={{ padding: "1.5rem", textAlign: "center" }}
        >
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>
            {stats.pendingOrders}
          </div>
          <div style={{ color: "var(--clr-muted)" }}>Pending Orders</div>
        </div>
      </div>

      <div
        className="card"
        style={{ padding: "1.5rem", marginBottom: "1.5rem" }}
      >
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
          Monthly Orders
        </h2>
        {orders.length === 0 ? (
          <p style={{ color: "var(--clr-muted)" }}>
            No orders were placed during {MONTHS[month - 1]} {year}.
          </p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "1rem",
                  padding: "1rem",
                  borderRadius: "1rem",
                  background: "rgba(255,255,255,0.95)",
                  border: "1px solid var(--clr-cream-dark)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: "0.25rem",
                      color: "var(--clr-bark)",
                    }}
                  >
                    #
                    {order.transaction_id ?? order.id.slice(0, 8).toUpperCase()}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                      alignItems: "center",
                      color: "var(--clr-muted)",
                      fontSize: "0.9rem",
                    }}
                  >
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
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
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

      <div className="card" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
          Low Stock Products (≤5 left)
        </h2>
        {stats.lowStockProducts.length === 0 ? (
          <p style={{ color: "var(--clr-muted)" }}>
            All products have sufficient stock.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {stats.lowStockProducts.map((p) => (
              <li
                key={p.name}
                style={{
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--clr-cream-dark)",
                }}
              >
                <strong>{p.name}</strong> – Only {p.stock} left
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
