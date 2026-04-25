"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface Stats {
  totalOrders: number;
  totalSales: number;
  pendingOrders: number;
  productCount: number;
  lowStockCount: number;
}

interface OrderItem {
  quantity: number;
  products: {
    name: string;
    image_url: string | null;
  } | null;
}

interface RecentOrder {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  delivery_address: string | null;
  payment_method: string;
  customers: { full_name: string; phone: string } | null;
  order_items: OrderItem[];
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
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

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
          .select(
            `
            id, status, total_amount, created_at, delivery_address, payment_method,
            customers(full_name, phone),
            order_items(quantity, products(name, image_url))
          `,
          )
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
      setRecentOrders((recent as unknown as RecentOrder[]) ?? []);
      setLoading(false);
    }
    loadStats();

    const channel = supabase
      .channel("dashboard-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => {
          loadStats();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
              <div className="order-cards">
                {recentOrders.map((order) => {
                  const customer = order.customers;
                  const items = order.order_items ?? [];
                  const firstImg =
                    items.find((i) => i.products?.image_url)?.products
                      ?.image_url ?? null;

                  return (
                    <div key={order.id} className="order-card">
                      {/* Left: product thumbnails */}
                      <div className="order-card__imgs">
                        {items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="order-card__thumb">
                            {item.products?.image_url ? (
                              <Image
                                src={item.products.image_url}
                                alt={item.products.name ?? "Product"}
                                fill
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <span style={{ fontSize: "1.25rem" }}>🌶</span>
                            )}
                          </div>
                        ))}
                        {items.length > 3 && (
                          <div className="order-card__thumb order-card__thumb--more">
                            +{items.length - 3}
                          </div>
                        )}
                      </div>

                      {/* Middle: order info */}
                      <div className="order-card__info">
                        {/* Order ID + status */}
                        <div className="order-card__top">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="order-card__id"
                          >
                            #{order.id.slice(0, 8).toUpperCase()}
                          </Link>
                          <span className={`badge badge-${order.status}`}>
                            {order.status}
                          </span>
                        </div>

                        {/* Products list */}
                        <div className="order-card__products">
                          {items.map((item, idx) => (
                            <span key={idx} className="order-card__product-tag">
                              {item.products?.name ?? "Product"} ×
                              {item.quantity}
                            </span>
                          ))}
                        </div>

                        {/* Customer */}
                        <div className="order-card__meta">
                          <span>👤 {customer?.full_name ?? "—"}</span>
                          {customer?.phone && (
                            <a
                              href={`tel:${customer.phone}`}
                              className="order-card__phone"
                            >
                              📞 {customer.phone}
                            </a>
                          )}
                        </div>

                        {/* Delivery address */}
                        {order.delivery_address && (
                          <div className="order-card__address">
                            📍 {order.delivery_address}
                          </div>
                        )}

                        {/* Payment + date */}
                        <div className="order-card__footer">
                          <span>
                            {order.payment_method === "bank_transfer"
                              ? "🏦 Transfer"
                              : "💵 COD"}
                          </span>
                          <span className="order-card__date">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-NG",
                              {
                                day: "numeric",
                                month: "short",
                                year: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Right: amount + action */}
                      <div className="order-card__right">
                        <div className="order-card__amount">
                          {formatNaira(order.total_amount)}
                        </div>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="btn btn-outline btn-sm"
                        >
                          View
                        </Link>
                        {customer?.phone && (
                          <a
                            href={`https://wa.me/${customer.phone.replace(/\D/g, "")}?text=Hi ${customer.full_name}, your KMA Spices order %23${order.id.slice(0, 8).toUpperCase()} is being processed.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm whatsapp-btn"
                          >
                            💬
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        .dash {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          padding: 1.25rem 1rem;
          max-width: 1100px;
          width: 100%;
        }
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

        /* ── Stat cards ── */
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

        /* ── Section ── */
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

        /* ── Order cards ── */
        .order-cards {
          display: flex;
          flex-direction: column;
        }
        .order-card {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--clr-cream-dark);
          align-items: start;
          transition: background 150ms ease;
        }
        .order-card:last-child { border-bottom: none; }
        .order-card:hover { background: #fafaf9; }

        /* Product thumbnails */
        .order-card__imgs {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding-top: 0.125rem;
        }
        .order-card__thumb {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: var(--clr-cream-dark);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 1.1rem;
        }
        .order-card__thumb--more {
          background: var(--clr-bark);
          color: var(--clr-cream);
          font-size: 0.7rem;
          font-weight: 700;
        }

        /* Info column */
        .order-card__info {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          min-width: 0;
        }
        .order-card__top {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .order-card__id {
          font-weight: 700;
          color: var(--clr-saffron-dark);
          text-decoration: none;
          font-size: 0.875rem;
        }
        .order-card__products {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
        }
        .order-card__product-tag {
          font-size: 0.75rem;
          background: var(--clr-cream-dark);
          color: var(--clr-bark);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-full);
          white-space: nowrap;
          font-weight: 500;
        }
        .order-card__meta {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          font-size: 0.8125rem;
          color: var(--clr-bark-mid);
          flex-wrap: wrap;
        }
        .order-card__phone {
          color: var(--clr-saffron-dark);
          text-decoration: none;
          font-weight: 500;
        }
        .order-card__address {
          font-size: 0.8rem;
          color: var(--clr-muted);
          line-height: 1.4;
          max-width: 340px;
        }
        .order-card__footer {
          display: flex;
          gap: 0.75rem;
          font-size: 0.78rem;
          color: var(--clr-muted);
          align-items: center;
        }
        .order-card__date { margin-left: auto; }

        /* Right column */
        .order-card__right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .order-card__amount {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 700;
          color: var(--clr-bark);
          white-space: nowrap;
        }

        /* ── MD ── */
        @media (min-width: 768px) {
          .dash { padding: 1.75rem 1.5rem; gap: 2rem; }
          .dash__header { flex-direction: row; justify-content: space-between; align-items: flex-start; }
          .dash__title { font-size: 1.75rem; }
          .dash__grid { grid-template-columns: repeat(3, 1fr); gap: 1rem; }
          .stat-card { padding: 1.25rem; }
          .stat-card__icon { width: 48px; height: 48px; }
          .stat-card__value { font-size: 1.4rem; }
          .stat-card__label { font-size: 0.8125rem; }
          .order-card__imgs { flex-direction: row; }
        }

        /* ── LG ── */
        @media (min-width: 1024px) {
          .dash { padding: 2rem; }
          .dash__grid { grid-template-columns: repeat(5, 1fr); }
        }
      `}</style>
    </div>
  );
}
