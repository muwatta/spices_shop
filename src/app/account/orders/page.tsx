"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

function OrdersContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function loadOrders() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirect=/account/orders");
        return;
      }

      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) console.error("[orders]", error.message);
      setOrders(ordersData || []);
      setLoading(false);
    }

    loadOrders();
  }, [router]);

  if (loading) {
    return (
      <div className="card" style={{ padding: "2rem" }}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <span
            className="spinner"
            style={{ margin: "0 auto", display: "block" }}
          />
          <p style={{ color: "var(--clr-muted)", marginTop: "1rem" }}>
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem" }}>
          My Orders
        </h1>
        <p style={{ color: "var(--clr-muted)", marginTop: "0.5rem" }}>
          {orders.length} order{orders.length !== 1 ? "s" : ""} placed
        </p>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</p>
          <p style={{ color: "var(--clr-muted)", marginBottom: "1.5rem" }}>
            You have no orders yet.
          </p>
          <Link href="/" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div
            className="orders-table-wrapper"
            style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}
          >
            <table
              className="orders-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "600px",
                fontSize: "0.9rem",
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
                    "Date",
                    "Items",
                    "Total",
                    "Payment",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "0.75rem 1rem",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "var(--clr-muted)",
                        fontWeight: 600,
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
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          color: "var(--clr-saffron-dark)",
                        }}
                      >
                        #
                        {order.transaction_id ??
                          order.id.slice(0, 8).toUpperCase()}
                      </div>
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
                      {(order.order_items as any[])?.length ?? 0} item
                      {(order.order_items as any[])?.length !== 1 ? "s" : ""}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", fontWeight: 700 }}>
                      {formatNaira(order.total_amount)}
                    </td>
                    <td
                      style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}
                    >
                      {order.payment_method === "bank_transfer"
                        ? "🏦 Transfer"
                        : "💵 COD"}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span className={`badge badge-${order.status}`}>
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="orders-card-list">
            {orders.map((order) => (
              <article key={order.id} className="orders-card">
                <div className="orders-card__header">
                  <div>
                    <div className="orders-card__label">Order</div>
                    <div className="orders-card__value">
                      #
                      {order.transaction_id ??
                        order.id.slice(0, 8).toUpperCase()}
                    </div>
                  </div>
                  <div className="orders-card__status">
                    <span className={`badge badge-${order.status}`}>
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="orders-card__row">
                  <div>
                    <div className="orders-card__label">Date</div>
                    <div className="orders-card__value">
                      {new Date(order.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="orders-card__label">Items</div>
                    <div className="orders-card__value">
                      {(order.order_items as any[])?.length ?? 0}
                    </div>
                  </div>
                </div>
                <div className="orders-card__row">
                  <div>
                    <div className="orders-card__label">Total</div>
                    <div className="orders-card__value">
                      {formatNaira(order.total_amount)}
                    </div>
                  </div>
                  <div>
                    <div className="orders-card__label">Payment</div>
                    <div className="orders-card__value">
                      {order.payment_method === "bank_transfer"
                        ? "Transfer"
                        : "COD"}
                    </div>
                  </div>
                </div>
                <div className="orders-card__actions">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="btn btn-ghost btn-sm"
                  >
                    View order
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AccountOrdersPage() {
  return (
    <>
      <Suspense
        fallback={
          <div
            className="card"
            style={{ padding: "3rem", textAlign: "center" }}
          >
            <span
              className="spinner"
              style={{ margin: "0 auto", display: "block" }}
            />
          </div>
        }
      >
        <OrdersContent />
      </Suspense>
      <style>{ordersStyles}</style>
    </>
  );
}

const ordersStyles = `
  .orders-table-wrapper {
    width: 100%;
  }

  .orders-card-list {
    display: none;
  }

  .orders-card {
    background: white;
    border: 1px solid var(--clr-cream-dark);
    border-radius: 1rem;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
  }

  .orders-card__header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .orders-card__row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .orders-card__label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--clr-muted);
    margin-bottom: 0.35rem;
  }

  .orders-card__value {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--clr-bark);
  }

  .orders-card__status {
    display: flex;
    align-items: center;
  }

  .orders-card__actions {
    text-align: right;
  }

  @media (max-width: 820px) {
    .orders-table-wrapper {
      display: none;
    }

    .orders-card-list {
      display: block;
    }

    .orders-card {
      padding: 1rem;
    }
  }

  @media (max-width: 520px) {
    .orders-card__header,
    .orders-card__row {
      flex-direction: column;
      align-items: stretch;
    }

    .orders-card__actions {
      text-align: left;
    }
  }
`;
