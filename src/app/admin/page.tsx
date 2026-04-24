"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";

interface Stats {
  totalOrders: number;
  totalSales: number;
  pendingOrders: number;
  productCount: number;
  lowStockCount: number;
}

const STAT_CARDS = (stats: Stats) => [
  {
    label: "Total Sales",
    value: formatNaira(stats.totalSales),
    icon: "💰",
    accent: "var(--clr-success)",
    bg: "#D1FAE5",
  },
  {
    label: "Total Orders",
    value: stats.totalOrders,
    icon: "📦",
    accent: "#2563EB",
    bg: "#DBEAFE",
  },
  {
    label: "Pending Orders",
    value: stats.pendingOrders,
    icon: "⏳",
    accent: "var(--clr-saffron-dark)",
    bg: "#FEF3C7",
  },
  {
    label: "Total Products",
    value: stats.productCount,
    icon: "🌶",
    accent: "var(--clr-bark)",
    bg: "var(--clr-cream-dark)",
  },
  {
    label: "Low Stock",
    value: stats.lowStockCount,
    icon: "⚠️",
    accent: "var(--clr-chili)",
    bg: "#FEE2E2",
  },
];

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
    productCount: 0,
    lowStockCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const [
        { data: orders },
        { data: products },
        { data: lowStock },
        { data: recent },
      ] = await Promise.all([
        supabase.from("orders").select("status, total_amount"),
        supabase.from("products").select("id"),
        supabase
          .from("products")
          .select("id")
          .not("stock", "is", null)
          .lte("stock", 5),
        supabase
          .from("orders")
          .select("id, status, total_amount, created_at, customers(full_name)")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setStats({
        totalOrders: orders?.length ?? 0,
        totalSales: orders?.reduce((s, o) => s + o.total_amount, 0) ?? 0,
        pendingOrders:
          orders?.filter((o) => o.status === "pending").length ?? 0,
        productCount: products?.length ?? 0,
        lowStockCount: lowStock?.length ?? 0,
      });
      setRecentOrders(recent ?? []);
      setLoading(false);
    }
    loadStats();
  }, []);

  const cards = STAT_CARDS(stats);

  return (
    <div className="dash">
      {/* ── Header ── */}
      <div className="dash__header">
        <div>
          <h1 className="dash__title">Dashboard</h1>
          <p className="dash__sub">Sales, inventory and order overview</p>
        </div>
        <div className="dash__actions">
          <Link href="/admin/orders" className="btn btn-primary btn-sm">
            Orders
          </Link>
          <Link href="/admin/products" className="btn btn-outline btn-sm">
            Products
          </Link>
          <Link href="/admin/reports" className="btn btn-outline btn-sm">
            Reports
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
        <>
          {/* ── Stat cards ── */}
          <div className="dash__grid">
            {cards.map((card) => (
              <div key={card.label} className="stat-card">
                <div
                  className="stat-card__icon"
                  style={{ background: card.bg }}
                >
                  {card.icon}
                </div>
                <div className="stat-card__body">
                  <div
                    className="stat-card__value"
                    style={{ color: card.accent }}
                  >
                    {card.value}
                  </div>
                  <div className="stat-card__label">{card.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Recent orders ── */}
          <div className="dash__section">
            <div className="dash__section-header">
              <h2 className="dash__section-title">Recent Orders</h2>
              <Link href="/admin/orders" className="dash__see-all">
                View all →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="dash__empty">No orders yet.</div>
            ) : (
              <div className="orders-table-wrap">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="orders-table__id"
                          >
                            #{order.id.slice(0, 8).toUpperCase()}
                          </Link>
                        </td>
                        <td>{(order.customers as any)?.full_name ?? "—"}</td>
                        <td className="orders-table__amount">
                          {formatNaira(order.total_amount)}
                        </td>
                        <td>
                          <span className={`badge badge-${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="orders-table__date">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-NG",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        /* ── Page shell ── */
        .dash {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          padding: 1.25rem 1rem;
          max-width: 1100px;
          width: 100%;
        }

        /* ── Header ── */
        .dash__header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .dash__title {
          font-family: var(--font-display);
          font-size: 1.5rem;
          margin: 0 0 0.25rem;
          color: var(--clr-bark);
        }
        .dash__sub {
          font-size: 0.875rem;
          color: var(--clr-muted);
          margin: 0;
        }
        .dash__actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        /* ── Stat cards grid ── */
        .dash__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .stat-card {
          background: #fff;
          border-radius: var(--radius-lg);
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.875rem;
          box-shadow: var(--shadow-sm);
          min-width: 0;
        }
        .stat-card__icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        .stat-card__body { min-width: 0; }
        .stat-card__value {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .stat-card__label {
          font-size: 0.75rem;
          color: var(--clr-muted);
          margin-top: 0.2rem;
          white-space: nowrap;
        }

        /* ── Section (recent orders) ── */
        .dash__section {
          background: #fff;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }
        .dash__section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--clr-cream-dark);
        }
        .dash__section-title {
          font-family: var(--font-display);
          font-size: 1rem;
          margin: 0;
          color: var(--clr-bark);
        }
        .dash__see-all {
          font-size: 0.8125rem;
          color: var(--clr-saffron-dark);
          text-decoration: none;
          font-weight: 600;
        }
        .dash__empty {
          padding: 2.5rem;
          text-align: center;
          color: var(--clr-muted);
          font-size: 0.875rem;
        }

        /* ── Orders table ── */
        .orders-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .orders-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
          min-width: 480px;
        }
        .orders-table thead tr {
          border-bottom: 2px solid var(--clr-cream-dark);
          background: #fafaf9;
        }
        .orders-table th {
          padding: 0.625rem 1rem;
          text-align: left;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--clr-muted);
          font-weight: 600;
          white-space: nowrap;
        }
        .orders-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--clr-cream-dark);
          color: var(--clr-bark);
          vertical-align: middle;
        }
        .orders-table tbody tr:last-child td { border-bottom: none; }
        .orders-table tbody tr:hover td { background: #fafaf9; }

        .orders-table__id {
          color: var(--clr-saffron-dark);
          font-weight: 700;
          text-decoration: none;
          font-size: 0.8125rem;
        }
        .orders-table__amount { font-weight: 600; }
        .orders-table__date { color: var(--clr-muted); white-space: nowrap; }

        /* ── MD: 768px ── */
        @media (min-width: 768px) {
          .dash { padding: 1.75rem 1.5rem; gap: 2rem; }
          .dash__header { flex-direction: row; justify-content: space-between; align-items: flex-start; }
          .dash__title { font-size: 1.75rem; }
          .dash__grid { grid-template-columns: repeat(3, 1fr); gap: 1rem; }
          .stat-card { padding: 1.25rem; }
          .stat-card__icon { width: 48px; height: 48px; }
          .stat-card__value { font-size: 1.4rem; }
          .stat-card__label { font-size: 0.8125rem; }
        }

        /* ── LG: 1024px ── */
        @media (min-width: 1024px) {
          .dash { padding: 2rem; }
          .dash__grid { grid-template-columns: repeat(5, 1fr); }
        }
      `}</style>
    </div>
  );
}
