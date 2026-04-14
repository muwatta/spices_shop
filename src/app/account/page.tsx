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
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(ordersData || []);

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
        <div style={{ padding: "4rem", textAlign: "center" }}>
          Loading your account...
        </div>
        <Footer />
      </>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "orders", label: "Orders", icon: "🛒" },
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "security", label: "Security", icon: "🔒" },
  ];

  // Shared content
  const renderContent = () => (
    <>
      {message.text && (
        <div
          className={`alert alert-${message.type}`}
          style={{ marginBottom: "1rem" }}
        >
          {message.text}
        </div>
      )}

      {activeTab === "overview" && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <div
              className="card"
              style={{
                padding: "1rem",
                textAlign: "center",
                border: "1px solid var(--clr-cream-dark)",
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? "2rem" : "2.5rem",
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
              style={{
                padding: "1rem",
                textAlign: "center",
                border: "1px solid var(--clr-cream-dark)",
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? "1.75rem" : "2rem",
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
              style={{
                padding: "1rem",
                textAlign: "center",
                border: "1px solid var(--clr-cream-dark)",
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? "1.75rem" : "2rem",
                  fontWeight: 700,
                  color: "var(--clr-chili)",
                }}
              >
                {stats.pendingOrders}
              </div>
              <div style={{ color: "var(--clr-muted)" }}>Pending Orders</div>
            </div>
          </div>
          <div
            className="card"
            style={{
              padding: "1.5rem",
              border: "1px solid var(--clr-cream-dark)",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>Quick Actions</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              <Link href="/" className="btn btn-primary">
                Shop Now
              </Link>
              <Link
                href="#"
                className="btn btn-outline"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("profile");
                }}
              >
                Update Profile
              </Link>
            </div>
          </div>
        </>
      )}

      {activeTab === "orders" && (
        <>
          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
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
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "480px",
                }}
              >
                <thead>
                  <tr
                    style={{ borderBottom: "2px solid var(--clr-cream-dark)" }}
                  >
                    <th style={{ textAlign: "left", padding: "0.75rem" }}>
                      Order #
                    </th>
                    <th style={{ textAlign: "left", padding: "0.75rem" }}>
                      Date
                    </th>
                    <th style={{ textAlign: "left", padding: "0.75rem" }}>
                      Total
                    </th>
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
                      style={{
                        borderBottom: "1px solid var(--clr-cream-dark)",
                      }}
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
        </>
      )}

      {activeTab === "profile" && (
        <form
          onSubmit={updateProfile}
          style={{ maxWidth: "500px", width: "100%" }}
        >
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
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {activeTab === "security" && (
        <form
          onSubmit={changePassword}
          style={{ maxWidth: "400px", width: "100%" }}
        >
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
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Updating..." : "Change Password"}
          </button>
        </form>
      )}
    </>
  );

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--clr-cream)", minHeight: "70vh" }}>
        <div className="container" style={{ padding: "2rem var(--space-md)" }}>
          <div
            style={{
              background: "white",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-md)",
              overflow: "hidden",
            }}
          >
            {isMobile ? (
              // Mobile layout: horizontal scrollable tabs
              <div
                style={{
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid var(--clr-cream-dark)",
                }}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "1rem 1.25rem",
                      background: "none",
                      border: "none",
                      borderBottom:
                        activeTab === tab.id
                          ? "3px solid var(--clr-saffron)"
                          : "3px solid transparent",
                      color:
                        activeTab === tab.id
                          ? "var(--clr-saffron-dark)"
                          : "var(--clr-muted)",
                      fontSize: "0.9rem",
                      fontWeight: activeTab === tab.id ? 600 : 400,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>{tab.icon}</span> {tab.label}
                  </button>
                ))}
              </div>
            ) : (
              // Desktop layout: sidebar + content
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "280px 1fr",
                  gap: "0",
                }}
              >
                <aside
                  style={{
                    background: "var(--clr-bark)",
                    color: "var(--clr-cream)",
                    padding: "2rem 0",
                  }}
                >
                  <div
                    style={{
                      padding: "0 1.5rem 1.5rem 1.5rem",
                      borderBottom: "1px solid #fff5e9",
                    }}
                  >
                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.25rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {profile.full_name || user.email}
                    </h2>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--clr-saffron)",
                      }}
                    >
                      Customer since {new Date(user.created_at).getFullYear()}
                    </p>
                  </div>
                  <nav style={{ marginTop: "1rem" }}>
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          width: "100%",
                          padding: "0.875rem 1.5rem",
                          background:
                            activeTab === tab.id
                              ? "rgba(232,160,32,0.15)"
                              : "transparent",
                          border: "none",
                          borderLeft:
                            activeTab === tab.id
                              ? "4px solid var(--clr-saffron)"
                              : "4px solid transparent",
                          color:
                            activeTab === tab.id
                              ? "var(--clr-saffron)"
                              : "rgba(253,246,236,0.8)",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "0.9375rem",
                          fontWeight: activeTab === tab.id ? 600 : 400,
                          transition: "all var(--transition-fast)",
                        }}
                      >
                        <span style={{ fontSize: "1.25rem" }}>{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </aside>
                <main style={{ padding: "2rem" }}>{renderContent()}</main>
              </div>
            )}
            {isMobile && (
              <div style={{ padding: "2rem" }}>{renderContent()}</div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
