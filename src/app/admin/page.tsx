"use client";

import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  ShoppingCart,
  Clock,
  Package,
  AlertTriangle,
  Banknote,
  CreditCard,
} from "lucide-react";

interface Stats {
  totalOrders: number;
  totalSales: number;
  pendingOrders: number;
  totalProducts: number;
  activeProducts: number;
  lowStock: number;
  pendingCod: number;
  pendingTransfers: number;
}

interface OrderItem {
  quantity: number;
  products: { name: string; image_url: string | null } | null;
}

interface RecentOrder {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  delivery_address: string | null;
  payment_method: string;
  payment_status: string;
  customers: { full_name: string; phone: string } | null;
  order_items: OrderItem[];
}

function buildStatCards(stats: Stats) {
  return [
    { label: "Today's Sales", value: formatNaira(stats.totalSales), icon: TrendingUp, bg: "#D1FAE5", color: "#065F46" },
    { label: "Today's Orders", value: stats.totalOrders, icon: ShoppingCart, bg: "#DBEAFE", color: "#1E40AF" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: Clock, bg: "#FEF3C7", color: "#92400E" },
    { label: "Active Products", value: stats.activeProducts, icon: Package, bg: "#E0E7FF", color: "#3730A3" },
    { label: "Low Stock", value: stats.lowStock, icon: AlertTriangle, bg: "#FEE2E2", color: "#991B1B" },
    { label: "Pending COD", value: stats.pendingCod, icon: Banknote, bg: "#FEF3C7", color: "#D97706" },
    { label: "Pending Transfers", value: stats.pendingTransfers, icon: CreditCard, bg: "#EDE9FE", color: "#5B21B6" },
  ];
}

function formatWhatsAppUrl(phone: string, name: string, orderId: string) {
  const text = `Hello ${name}, your KMA Spices order %23${orderId} is being processed.`;
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${text}`;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0, totalSales: 0, pendingOrders: 0,
    totalProducts: 0, activeProducts: 0, lowStock: 0,
    pendingCod: 0, pendingTransfers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadStats() {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/dashboard", { signal: controller.signal });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Failed to load");
        setStats({
          totalOrders: payload.totalOrders ?? 0,
          totalSales: payload.totalSales ?? 0,
          pendingOrders: payload.pendingOrders ?? 0,
          totalProducts: payload.totalProducts ?? 0,
          activeProducts: payload.activeProducts ?? 0,
          lowStock: payload.lowStock ?? 0,
          pendingCod: payload.pendingCod ?? 0,
          pendingTransfers: payload.pendingTransfers ?? 0,
        });
        setRecentOrders(payload.recentOrders ?? []);
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
    return () => controller.abort();
  }, []);

  const cards = buildStatCards(stats);

  return (
    <div className="dash">
      <div className="dash__header">
        <div>
          <h1 className="dash__title">Dashboard</h1>
          <p className="dash__sub">Sales, inventory and order overview</p>
        </div>
        <div className="dash__actions">
          <Link href="/admin/orders" className="btn btn-primary btn-sm">Orders</Link>
          <Link href="/admin/products" className="btn btn-outline btn-sm">Products</Link>
          <Link href="/admin/reports" className="btn btn-outline btn-sm">Reports</Link>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <span className="spinner" />
        </div>
      ) : error ? (
        <div className="admin-empty">
          <p className="admin-empty__title">Failed to load dashboard</p>
          <p>{error}</p>
          <button className="btn btn-outline btn-sm" style={{ marginTop: "1rem" }} onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="dash__grid">
            {cards.map((card) => (
              <div key={card.label} className="stat-card">
                <div className="stat-card__icon" style={{ background: card.bg }}>
                  <card.icon size={22} style={{ color: card.color }} />
                </div>
                <div className="stat-card__body">
                  <div className="stat-card__value" style={{ color: card.color }}>
                    {card.value}
                  </div>
                  <div className="stat-card__label">{card.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="dash__section">
            <div className="dash__section-header">
              <h2 className="dash__section-title">Recent Orders</h2>
              <Link href="/admin/orders" className="dash__see-all">View all</Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="dash__empty">No orders yet.</div>
            ) : (
              <div className="order-cards">
                {recentOrders.map((order) => {
                  const customer = order.customers;
                  const items = order.order_items ?? [];
                  return (
                    <div key={order.id} className="order-card">
                      <div className="order-card__imgs">
                        {items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="order-card__thumb">
                            {item.products?.image_url ? (
                              <Image src={item.products.image_url} alt={item.products.name ?? "Product"} fill style={{ objectFit: "cover" }} />
                            ) : (
                              <span style={{ fontSize: "0.7rem", color: "var(--clr-muted)" }}>N/A</span>
                            )}
                          </div>
                        ))}
                        {items.length > 3 && (
                          <div className="order-card__thumb order-card__thumb--more">
                            +{items.length - 3}
                          </div>
                        )}
                      </div>

                      <div className="order-card__info">
                        <div className="order-card__top">
                          <Link href={`/admin/orders/${order.id}`} className="order-card__id">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </Link>
                          <span className={`status-badge status-badge--${order.status}`}>
                            {order.status}
                          </span>
                          <span className={`payment-badge ${order.payment_method === "bank_transfer" ? "payment-badge--transfer" : "payment-badge--cod"}`}>
                            {order.payment_method === "bank_transfer" ? "Transfer" : "COD"}
                          </span>
                        </div>

                        <div className="order-card__products">
                          {items.map((item, idx) => (
                            <span key={idx} className="order-card__product-tag">
                              {item.products?.name ?? "Product"} x{item.quantity}
                            </span>
                          ))}
                        </div>

                        <div className="order-card__meta">
                          <span>{customer?.full_name ?? "---"}</span>
                          {customer?.phone && (
                            <a href={`tel:${customer.phone}`} className="order-card__phone">
                              {customer.phone}
                            </a>
                          )}
                        </div>

                        {order.delivery_address && (
                          <div className="order-card__address">{order.delivery_address}</div>
                        )}

                        <div className="order-card__footer">
                          <span>{new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "2-digit" })}</span>
                        </div>
                      </div>

                      <div className="order-card__right">
                        <div className="order-card__amount">{formatNaira(order.total_amount)}</div>
                        <Link href={`/admin/orders/${order.id}`} className="btn btn-outline btn-sm">
                          View
                        </Link>
                        {customer?.phone && (
                          <a
                            href={formatWhatsAppUrl(customer.phone, customer.full_name, order.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm whatsapp-btn"
                          >
                            WhatsApp
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
    </div>
  );
}
