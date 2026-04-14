"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Tab = "overview" | "orders" | "profile" | "security";

export default function AccountPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    address: "",
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    async function loadUserAndData() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?redirect=/account");
        return;
      }
      setUser(user);

      // Load profile
      const { data: customer } = await supabase
        .from("customers")
        .select("full_name, phone, address")
        .eq("id", user.id)
        .single();
      if (customer) {
        setProfile({
          full_name: customer.full_name || "",
          phone: customer.phone || "",
          address: customer.address || "",
        });
      }

      // Load orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(ordersData || []);

      // Calculate stats
      const totalOrders = ordersData?.length || 0;
      const totalSpent =
        ordersData?.reduce((sum, o) => sum + o.total_amount, 0) || 0;
      const pendingOrders =
        ordersData?.filter((o) => o.status === "pending").length || 0;
      setStats({ totalOrders, totalSpent, pendingOrders });

      setLoading(false);
    }
    loadUserAndData();
  }, []);

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    const { error } = await supabase
      .from("customers")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
      })
      .eq("id", user.id);
    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "Profile updated successfully!", type: "success" });
    }
    setSaving(false);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ text: "New passwords do not match", type: "error" });
      setSaving(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    });
    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "Password changed successfully!", type: "success" });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "4rem", textAlign: "center" }}>Loading...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <div className="container" style={{ padding: "2rem var(--space-md)" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              marginBottom: "2rem",
            }}
          >
            My Account
          </h1>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              borderBottom: "2px solid var(--clr-cream-dark)",
              marginBottom: "2rem",
            }}
          >
            {[
              { id: "overview", label: "Overview" },
              { id: "orders", label: "Orders" },
              { id: "profile", label: "Profile" },
              { id: "security", label: "Security" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                style={{
                  padding: "0.75rem 1rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: activeTab === tab.id ? 700 : 400,
                  color:
                    activeTab === tab.id
                      ? "var(--clr-saffron-dark)"
                      : "var(--clr-muted)",
                  borderBottom:
                    activeTab === tab.id
                      ? "3px solid var(--clr-saffron)"
                      : "none",
                  marginBottom: "-2px",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
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
                  {formatNaira(stats.totalSpent)}
                </div>
                <div style={{ color: "var(--clr-muted)" }}>Total Spent</div>
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
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <>
              {orders.length === 0 ? (
                <div
                  className="card"
                  style={{ padding: "3rem", textAlign: "center" }}
                >
                  <p>You haven't placed any orders yet.</p>
                  <Link
                    href="/"
                    className="btn btn-primary"
                    style={{ marginTop: "1rem" }}
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="card" style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr
                        style={{
                          borderBottom: "2px solid var(--clr-cream-dark)",
                        }}
                      >
                        <th style={{ textAlign: "left", padding: "1rem" }}>
                          Order #
                        </th>
                        <th style={{ textAlign: "left", padding: "1rem" }}>
                          Date
                        </th>
                        <th style={{ textAlign: "left", padding: "1rem" }}>
                          Total
                        </th>
                        <th style={{ textAlign: "left", padding: "1rem" }}>
                          Status
                        </th>
                        <th style={{ textAlign: "left", padding: "1rem" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          style={{
                            borderBottom: "1px solid var(--clr-cream-dark)",
                          }}
                        >
                          <td style={{ padding: "1rem" }}>
                            #{order.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td style={{ padding: "1rem" }}>
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: "1rem" }}>
                            {formatNaira(order.total_amount)}
                          </td>
                          <td style={{ padding: "1rem" }}>
                            <span className={`badge badge-${order.status}`}>
                              {order.status}
                            </span>
                          </td>
                          <td style={{ padding: "1rem" }}>
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
            </>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div
              className="card"
              style={{ maxWidth: "600px", padding: "2rem" }}
            >
              {message.text && (
                <div
                  className={`alert alert-${message.type}`}
                  style={{ marginBottom: "1rem" }}
                >
                  {message.text}
                </div>
              )}
              <form onSubmit={updateProfile}>
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    type="text"
                    value={profile.full_name}
                    onChange={(e) =>
                      setProfile({ ...profile, full_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-input"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                  />
                </div>
                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label className="form-label">Delivery Address</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={profile.address}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div
              className="card"
              style={{ maxWidth: "500px", padding: "2rem" }}
            >
              {message.text && (
                <div
                  className={`alert alert-${message.type}`}
                  style={{ marginBottom: "1rem" }}
                >
                  {message.text}
                </div>
              )}
              <form onSubmit={changePassword}>
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label className="form-label">New Password</label>
                  <input
                    className="form-input"
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    minLength={6}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label className="form-label">Confirm New Password</label>
                  <input
                    className="form-input"
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Updating..." : "Change Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
