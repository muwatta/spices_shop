"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
    productCount: 0,
    lowStockCount: 0,
  });

  useEffect(() => {
    async function loadStats() {
      setLoading(true);

      const [{ data: orders }, { data: products }, { data: lowStock }] =
        await Promise.all([
          supabase.from("orders").select("status, total_amount"),
          supabase.from("products").select("id"),
          supabase
            .from("products")
            .select("id")
            .not("stock", "is", null)
            .lte("stock", 5),
        ]);

      const totalOrders = orders?.length || 0;
      const totalSales =
        orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const pendingOrders =
        orders?.filter((order) => order.status === "pending").length || 0;

      setStats({
        totalOrders,
        totalSales,
        pendingOrders,
        productCount: products?.length || 0,
        lowStockCount: lowStock?.length || 0,
      });
      setLoading(false);
    }

    loadStats();
  }, [supabase]);

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              marginBottom: "0.5rem",
            }}
          >
            Admin Dashboard
          </h1>
          <p style={{ color: "var(--clr-muted)" }}>
            Overview of sales, inventory, and order activity.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/admin/orders" className="btn btn-primary btn-sm">
            View Orders
          </Link>
          <Link href="/admin/products" className="btn btn-outline btn-sm">
            Manage Products
          </Link>
          <Link href="/admin/reports" className="btn btn-outline btn-sm">
            View Reports
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <span
            className="spinner"
            style={{ margin: "0 auto", display: "block" }}
          />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
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
                color: "var(--clr-bark)",
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
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "var(--clr-chili)",
              }}
            >
              {stats.pendingOrders}
            </div>
            <div style={{ color: "var(--clr-muted)" }}>Pending Orders</div>
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
              {stats.productCount}
            </div>
            <div style={{ color: "var(--clr-muted)" }}>Total Products</div>
          </div>
          <div
            className="card"
            style={{ padding: "1.5rem", textAlign: "center" }}
          >
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "var(--clr-chili)",
              }}
            >
              {stats.lowStockCount}
            </div>
            <div style={{ color: "var(--clr-muted)" }}>Low Stock Items</div>
          </div>
        </div>
      )}
    </div>
  );
}
