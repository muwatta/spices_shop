"use client";

import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";
import styles from "./page.module.css";

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
  const [page, setPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const PAGE_SIZE = 20;

  const fetchCustomers = async (requestedPage = page) => {
    setLoading(true);
    const res = await fetch(
      `/api/admin/customers?page=${requestedPage}&limit=${PAGE_SIZE}`,
    );
    if (res.ok) {
      const data = await res.json();
      setCustomers(data.customers);
      setTotalCustomers(data.totalCount);

      const totalPages = Math.max(1, Math.ceil(data.totalCount / PAGE_SIZE));
      if (requestedPage > totalPages) {
        setPage(totalPages);
      }
    } else {
      toast.error("Failed to load customers");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers(page);
  }, [page]);

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
    <div className={styles.pageWrapper}>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>Customers</h1>
        <button className="btn btn-primary" onClick={exportToCSV}>
          📎 Export CSV
        </button>
      </div>

      {loading ? (
        <div className={styles.spinnerWrapper}>
          <span className="spinner" />
        </div>
      ) : customers.length === 0 ? (
        <div className={`card ${styles.emptyState}`}>No customers found.</div>
      ) : (
        <>
          <div className={`card ${styles.tableWrapper}`}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeaderRow}>
                  <th className={styles.tableCell}>Name</th>
                  <th className={styles.tableCell}>Email</th>
                  <th className={styles.tableCell}>Phone</th>
                  <th className={styles.tableCell}>Location</th>
                  <th className={styles.tableCell}>Orders</th>
                  <th className={styles.tableCell}>Total Spent</th>
                  <th className={styles.tableCell}>Joined</th>
                  <th className={styles.tableCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <strong>{c.full_name}</strong>
                    </td>
                    <td className={styles.tableCell}>{c.email}</td>
                    <td className={styles.tableCell}>{c.phone || "—"}</td>
                    <td className={styles.tableCell}>
                      {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className={styles.tableCellCenter}>{c.orderCount}</td>
                    <td className={styles.tableCell}>
                      {formatNaira(c.totalSpent)}
                    </td>
                    <td className={styles.tableCell}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className={styles.tableCell}>
                      <button
                        className={`btn btn-sm btn-ghost ${styles.actionButton}`}
                        onClick={() => handleEdit(c)}
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
          <div className={styles.paginationRow}>
            <span>
              Showing page {page} of{" "}
              {Math.max(1, Math.ceil(totalCustomers / PAGE_SIZE))}
            </span>
            <div className={styles.paginationButtons}>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() =>
                  setPage((prev) =>
                    Math.min(
                      Math.max(1, Math.ceil(totalCustomers / PAGE_SIZE)),
                      prev + 1,
                    ),
                  )
                }
                disabled={
                  page >= Math.max(1, Math.ceil(totalCustomers / PAGE_SIZE))
                }
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editingCustomer && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setEditingCustomer(null)}
        >
          <div
            className={`card ${styles.modalCard}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles.modalTitle}>Edit Customer</h2>
            <form onSubmit={handleUpdate} className={styles.modalForm}>
              <div className="form-group">
                <label htmlFor="full_name" className="form-label">
                  Full Name
                </label>
                <input
                  id="full_name"
                  className="form-input"
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, full_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
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
                <label htmlFor="phone" className="form-label">
                  Phone
                </label>
                <input
                  id="phone"
                  className="form-input"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <input
                  id="address"
                  className="form-input"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="city" className="form-label">
                  City
                </label>
                <input
                  id="city"
                  className="form-input"
                  value={editForm.city}
                  onChange={(e) =>
                    setEditForm({ ...editForm, city: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="state" className="form-label">
                  State
                </label>
                <input
                  id="state"
                  className="form-input"
                  value={editForm.state}
                  onChange={(e) =>
                    setEditForm({ ...editForm, state: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="postal_code" className="form-label">
                  Postal Code
                </label>
                <input
                  id="postal_code"
                  className="form-input"
                  value={editForm.postal_code}
                  onChange={(e) =>
                    setEditForm({ ...editForm, postal_code: e.target.value })
                  }
                />
              </div>
              <div className={styles.formActions}>
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
