"use client";

import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/utils";

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
    lowStockProducts: [] as any[],
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await fetch("/api/admin/reports");
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
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading report...
      </div>
    );

  return (
    <div style={{ padding: "2rem" }}>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.75rem",
          marginBottom: "1.5rem",
        }}
      >
        Inventory & Sales Report
      </h1>

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
          <div style={{ color: "var(--clr-muted)" }}>Total Orders</div>
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
          <div style={{ color: "var(--clr-muted)" }}>Total Sales</div>
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
