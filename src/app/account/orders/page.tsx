"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/ui/PageTransition";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AccountOrdersPage() {
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

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      setOrders(ordersData || []);
      setLoading(false);
    }

    loadOrders();
  }, [router]);

  if (loading) {
    return (
      <PageTransition>
        <div className="card" style={{ padding: "2rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <Skeleton style={{ width: "220px", height: "28px", marginBottom: "1rem" }} />
            <Skeleton style={{ width: "180px", height: "16px" }} />
          </div>
          <div className="skeleton-table">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="skeleton-table-row" key={index}>
                <Skeleton className="skeleton-row-cell" />
                <Skeleton className="skeleton-row-cell" />
                <Skeleton className="skeleton-row-cell" />
                <Skeleton className="skeleton-row-cell" />
                <Skeleton className="skeleton-row-cell" />
              </div>
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="card" style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem" }}>
          Orders
        </h1>
        <p style={{ color: "var(--clr-muted)", marginTop: "0.5rem" }}>
          Your recent purchases and order status.
        </p>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p>You have no orders yet.</p>
          <Link
            href="/"
            className="btn btn-primary"
            style={{ marginTop: "1rem" }}
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "520px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid var(--clr-cream-dark)" }}>
                <th style={{ textAlign: "left", padding: "0.75rem" }}>Order</th>
                <th style={{ textAlign: "left", padding: "0.75rem" }}>Date</th>
                <th style={{ textAlign: "left", padding: "0.75rem" }}>Total</th>
                <th style={{ textAlign: "left", padding: "0.75rem" }}>
                  Status
                </th>
                <th style={{ textAlign: "left", padding: "0.75rem" }}></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  style={{ borderBottom: "1px solid var(--clr-cream-dark)" }}
                >
                  <td style={{ padding: "0.75rem" }}>
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    {formatNaira(order.total_amount)}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <span className={`badge badge-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <Link
                      href={`/account/orders/${order.id}`}
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
  );
}
