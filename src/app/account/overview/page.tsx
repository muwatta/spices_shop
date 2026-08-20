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
        <div className="ov">
          <div className="ov__head">
            <Skeleton style={{ width: "180px", height: "28px", marginBottom: "0.75rem" }} />
            <Skeleton style={{ width: "140px", height: "16px" }} />
          </div>
          <div className="ov__stats">
            <Skeleton className="ov__stat-skel" />
            <Skeleton className="ov__stat-skel" />
            <Skeleton className="ov__stat-skel" />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="ov">
        <div className="ov__head">
          <h1 className="ov__title">Overview</h1>
          <p className="ov__sub">Your account summary and quick actions.</p>
          {email && <span className="ov__email">{email}</span>}
        </div>

        <div className="ov__stats">
          <div className="ov__stat ov__stat--orders">
            <span className="ov__stat-num">{stats.totalOrders}</span>
            <span className="ov__stat-label">Total Orders</span>
          </div>
          <div className="ov__stat ov__stat--spent">
            <span className="ov__stat-num">{formatNaira(stats.totalSpent)}</span>
            <span className="ov__stat-label">Total Spent</span>
          </div>
          <div className="ov__stat ov__stat--pending">
            <span className="ov__stat-num">{stats.pendingOrders}</span>
            <span className="ov__stat-label">Pending</span>
          </div>
        </div>

        <div className="ov__actions">
          <Link href="/account/orders" className="btn btn-primary btn-sm">View Orders</Link>
          <Link href="/account/profile" className="btn btn-outline btn-sm">Update Profile</Link>
        </div>

        <section className="ov__recent" aria-labelledby="recent-heading">
          <div className="ov__recent-head">
            <h2 id="recent-heading">Recent orders</h2>
            <Link href="/account/orders" className="ov__see-all">See all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="ov__empty">Your recent orders will appear here after checkout.</p>
          ) : (
            <div className="ov__orders">
              {recentOrders.map((order) => (
                <Link href={`/account/orders/${order.id}`} key={order.id} className="ov__order">
                  <div className="ov__order-left">
                    <strong>#{order.id.slice(0, 8).toUpperCase()}</strong>
                    <span>{new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <div className="ov__order-right">
                    <strong>{formatNaira(order.total_amount)}</strong>
                    <span className={`ov__status ov__status--${order.status}`}>{order.status.replaceAll("_", " ")}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
