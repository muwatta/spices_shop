"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/ui/PageTransition";
import { Skeleton } from "@/components/ui/Skeleton";

interface Stats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export default function AccountOverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function loadOverview() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirect=/account");
        return;
      }

      setEmail(user.email ?? "");

      const { data: ordersData } = await supabase
        .from("orders")
        .select("status, total_amount")
        .eq("customer_id", user.id);

      const totalOrders = ordersData?.length || 0;
      const totalSpent =
        ordersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const pendingOrders =
        ordersData?.filter((order) => order.status === "pending").length || 0;

      setStats({ totalOrders, totalSpent, pendingOrders });
      const { data: latestOrders } = await supabase
        .from("orders")
        .select("id, status, total_amount, created_at")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);
      setRecentOrders((latestOrders ?? []) as RecentOrder[]);
      setLoading(false);
    }

    loadOverview();
  }, [router]);

  if (loading) {
    return (
      <PageTransition>
        <div className="card" style={{ padding: "2rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <Skeleton
              style={{ width: "220px", height: "28px", marginBottom: "1rem" }}
            />
            <Skeleton style={{ width: "160px", height: "16px" }} />
          </div>
          <div className="skeleton-grid" style={{ gap: "1rem" }}>
            <Skeleton className="skeleton-panel" />
            <Skeleton className="skeleton-panel" />
            <Skeleton className="skeleton-panel" />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="card" style={{ padding: "2rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1
            style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem" }}
          >
            Overview
          </h1>
          <p style={{ color: "var(--clr-muted)", marginTop: "0.5rem" }}>
            Your account summary and quick actions.
          </p>
          {email && <p className="account-overview__email">Signed in as {email}</p>}
        </div>

        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            marginBottom: "1.5rem",
          }}
        >
          <div
            className="card"
            style={{ padding: "1.25rem", textAlign: "center" }}
          >
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "var(--clr-terracotta)",
              }}
            >
              {stats.totalOrders}
            </div>
            <div style={{ color: "var(--clr-muted)" }}>Total Orders</div>
          </div>
          <div
            className="card"
            style={{ padding: "1.25rem", textAlign: "center" }}
          >
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "var(--clr-bark)",
              }}
            >
              {formatNaira(stats.totalSpent)}
            </div>
            <div style={{ color: "var(--clr-muted)" }}>Total Spent</div>
          </div>
          <div
            className="card"
            style={{ padding: "1.25rem", textAlign: "center" }}
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
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <Link href="/account/orders" className="btn btn-primary">
            View Orders
          </Link>
          <Link href="/account/profile" className="btn btn-outline">
            Update Profile
          </Link>
        </div>

        <section className="account-overview__recent" aria-labelledby="recent-orders-heading">
          <div className="account-overview__section-heading">
            <div>
              <p className="section-eyebrow">Your activity</p>
              <h2 id="recent-orders-heading">Recent orders</h2>
            </div>
            <Link href="/account/orders">See all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="account-overview__empty">Your recent orders will appear here after checkout.</p>
          ) : (
            <div className="account-overview__orders">
              {recentOrders.map((order) => (
                <Link href={`/account/orders/${order.id}`} key={order.id} className="account-overview__order">
                  <span>
                    <strong>#{order.id.slice(0, 8).toUpperCase()}</strong>
                    <small>{new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</small>
                  </span>
                  <span>
                    <strong>{formatNaira(order.total_amount)}</strong>
                    <small className={`account-overview__status account-overview__status--${order.status}`}>{order.status.replaceAll("_", " ")}</small>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
