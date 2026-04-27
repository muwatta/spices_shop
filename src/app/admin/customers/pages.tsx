"use client";

import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  orderCount: number;
  totalSpent: number;
  created_at: string;
  is_admin: boolean;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetchCustomers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/customers");
    if (res.ok) {
      const data = await res.json();
      setCustomers(data);
    } else {
      toast.error("Failed to load customers");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id: string) => {
    if (
      !confirm("Delete this customer? This will also delete all their orders.")
    )
      return;
    const res = await fetch("/api/admin/customers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Customer deleted");
      fetchCustomers();
    } else {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditForm({
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone || "",
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      postal_code: customer.postal_code || "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    const res = await fetch(`/api/admin/customers/${editingCustomer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      toast.success("Customer updated");
      setEditingCustomer(null);
      fetchCustomers();
    } else {
      toast.error("Update failed");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Full Name",
      "Email",
      "Phone",
      "Address",
      "City",
      "State",
      "Postal Code",
      "Orders",
      "Total Spent",
      "Joined",
    ];
    const rows = customers.map((c) => [
      c.id,
      c.full_name,
      c.email,
      c.phone || "",
      c.address || "",
      c.city || "",
      c.state || "",
      c.postal_code || "",
      c.orderCount,
      formatNaira(c.totalSpent).replace("₦", ""),
      new Date(c.created_at).toLocaleDateString(),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "customers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem" }}>
          Customers
        </h1>
        <button className="btn btn-primary" onClick={exportToCSV}>
          📎 Export CSV
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <span className="spinner" />
        </div>
      ) : customers.length === 0 ? (
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          No customers found.
        </div>
      ) : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid var(--clr-cream-dark)",
                  background: "var(--clr-cream)",
                }}
              >
                <th style={{ padding: "0.75rem" }}>Name</th>
                <th style={{ padding: "0.75rem" }}>Email</th>
                <th style={{ padding: "0.75rem" }}>Phone</th>
                <th style={{ padding: "0.75rem" }}>Location</th>
                <th style={{ padding: "0.75rem" }}>Orders</th>
                <th style={{ padding: "0.75rem" }}>Total Spent</th>
                <th style={{ padding: "0.75rem" }}>Joined</th>
                <th style={{ padding: "0.75rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.id}
                  style={{ borderBottom: "1px solid var(--clr-cream-dark)" }}
                >
                  <td style={{ padding: "0.75rem" }}>
                    <strong>{c.full_name}</strong>
                  </td>
                  <td style={{ padding: "0.75rem" }}>{c.email}</td>
                  <td style={{ padding: "0.75rem" }}>{c.phone || "—"}</td>
                  <td style={{ padding: "0.75rem" }}>
                    {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td style={{ padding: "0.75rem", textAlign: "center" }}>
                    {c.orderCount}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    {formatNaira(c.totalSpent)}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => handleEdit(c)}
                      style={{ marginRight: "0.5rem" }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(c.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingCustomer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setEditingCustomer(null)}
        >
          <div
            className="card"
            style={{
              background: "white",
              maxWidth: "500px",
              width: "90%",
              padding: "2rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "1rem" }}>Edit Customer</h2>
            <form
              onSubmit={handleUpdate}
              style={{ display: "grid", gap: "0.75rem" }}
            >
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, full_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  className="form-input"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  className="form-input"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  className="form-input"
                  value={editForm.city}
                  onChange={(e) =>
                    setEditForm({ ...editForm, city: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  className="form-input"
                  value={editForm.state}
                  onChange={(e) =>
                    setEditForm({ ...editForm, state: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input
                  className="form-input"
                  value={editForm.postal_code}
                  onChange={(e) =>
                    setEditForm({ ...editForm, postal_code: e.target.value })
                  }
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditingCustomer(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Toaster position="top-right" />
    </div>
  );
}
