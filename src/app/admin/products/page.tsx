"use client";

import { useEffect, useState, useCallback } from "react";
import { formatNaira } from "@/lib/utils";
import {
  Product,
  ProductStatus,
  ProductCategory,
  PRODUCT_STATUS_LABELS,
  CATEGORY_LABELS,
} from "@/types";
import Image from "next/image";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const STATUS_COLORS: Record<ProductStatus, { bg: string; color: string }> = {
  active: { bg: "#D1FAE5", color: "#065F46" },
  out_of_stock: { bg: "#FEF3C7", color: "#92400E" },
  draft: { bg: "#E5E7EB", color: "#374151" },
  archived: { bg: "#FEE2E2", color: "#991B1B" },
};

export default function AdminProductsPage() {
  const [data, setData] = useState<PaginatedProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    benefits: "",
    price: "",
    stock: "",
    category: "",
    status: "active" as ProductStatus,
    low_stock_threshold: "5",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<(File | null)[]>([null, null, null, null, null]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null);
  const [bulkArchiveOpen, setBulkArchiveOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search) params.set("search", search);
    if (filterCategory) params.set("category", filterCategory);
    if (filterStatus) params.set("status", filterStatus);

    try {
      const res = await fetch(`/api/admin/products?${params}`);
      const payload = await res.json();
      if (res.ok) {
        setData(payload);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, filterCategory, filterStatus]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    setPage(1);
  }, [search, filterCategory, filterStatus]);

  function openCreate() {
    setEditingProduct(null);
    setForm({
      name: "",
      description: "",
      benefits: "",
      price: "",
      stock: "",
      category: "",
      status: "active",
      low_stock_threshold: "5",
    });
    setImageFile(null);
    setError("");
    setMessage(null);
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description ?? "",
      benefits: product.benefits ?? "",
      price: String(product.price),
      stock: product.stock !== null ? String(product.stock) : "",
      category: product.category ?? "",
      status: product.status || "active",
      low_stock_threshold: String(product.low_stock_threshold ?? 5),
    });
    setImageFile(null);
    setGalleryFiles([null, null, null, null, null]);
    setError("");
    setMessage(null);
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage(null);
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("benefits", form.benefits);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("category", form.category);
      formData.append("status", form.status);
      formData.append("low_stock_threshold", form.low_stock_threshold);
      if (imageFile) formData.append("image", imageFile);
      galleryFiles.forEach((file, idx) => {
        if (file) formData.append(`images_${idx}`, file);
      });
      if (editingProduct) formData.append("id", editingProduct.id);

      const response = await fetch("/api/admin/products", {
        method: editingProduct ? "PUT" : "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save product.");

      setShowForm(false);
      setMessage({
        type: "success",
        text: editingProduct ? "Product updated." : "Product created.",
      });
      loadProducts();
    } catch (err: any) {
      setError(err.message ?? "Failed to save product.");
      setMessage({ type: "error", text: err.message ?? "Failed to save product." });
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusToggle(product: Product) {
    const newStatus: ProductStatus =
      product.status === "active" ? "out_of_stock" : "active";
    try {
      const res = await fetch("/api/admin/products/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, status: newStatus }),
      });
      if (res.ok) {
        setMessage({
          type: "success",
          text: `${product.name} → ${PRODUCT_STATUS_LABELS[newStatus]}`,
        });
        loadProducts();
      }
    } catch {}
  }

  function handleArchive(product: Product) {
    setArchiveTarget(product);
  }

  function confirmArchive() {
    if (!archiveTarget) return;
    fetch("/api/admin/products/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: archiveTarget.id, status: "archived" }),
    }).then((res) => {
      if (res.ok) {
        setMessage({ type: "success", text: `"${archiveTarget.name}" archived.` });
        loadProducts();
      }
    }).finally(() => setArchiveTarget(null));
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (!data) return;
    if (selected.size === data.products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.products.map((p) => p.id)));
    }
  }

  function bulkArchive() {
    setBulkArchiveOpen(true);
  }

  async function confirmBulkArchive() {
    setBulkArchiveOpen(false);
    let archived = 0;
    for (const id of selected) {
      const res = await fetch("/api/admin/products/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "archived" }),
      });
      if (res.ok) archived++;
    }
    setSelected(new Set());
    setMessage({ type: "success", text: `${archived} product(s) archived.` });
    loadProducts();
  }

  async function bulkSetActive() {
    let count = 0;
    for (const id of selected) {
      const res = await fetch("/api/admin/products/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "active" }),
      });
      if (res.ok) count++;
    }
    setSelected(new Set());
    setMessage({ type: "success", text: `${count} product(s) set to Active.` });
    loadProducts();
  }

  return (
    <div style={{ padding: "1rem" }}>
      <div className="admin-products-header">
        <div className="admin-products-header__top">
          <div>
            <h1 className="admin-products-header__title">
              Products
            </h1>
            {data && (
              <p className="admin-products-header__sub">
                {data.total} total · {data.totalPages} page{data.totalPages !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="admin-products-actions">
            <button className="btn btn-primary" onClick={openCreate}>
              + Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="admin-products-filter">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
        />
        <select
          className="form-input"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="form-input"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {Object.entries(PRODUCT_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <div
          className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}
          style={{ marginBottom: "1rem" }}
        >
          {message.text}
        </div>
      )}

      {selected.size > 0 && (
        <div className="admin-products-bulk">
          <span style={{ fontWeight: 600 }}>{selected.size} selected</span>
          <button className="btn btn-sm" style={{ background: "var(--clr-success)", color: "#fff", border: "none" }} onClick={bulkSetActive}>
            Set Active
          </button>
          <button className="btn btn-sm" style={{ background: "var(--clr-chili)", color: "#fff", border: "none" }} onClick={bulkArchive}>
            Archive
          </button>
          <button className="btn btn-sm btn-outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }} onClick={() => setSelected(new Set())}>
            Clear Selection
          </button>
        </div>
      )}

      {showForm && (
        <div className="admin-form-overlay" role="dialog" aria-modal="true">
          <div className="admin-form-panel">
            <div className="admin-form-header">
              <h2>
                {editingProduct ? "Edit Product" : "New Product"}
              </h2>
              <button className="admin-form-close" onClick={() => setShowForm(false)} aria-label="Close">
                &times;
              </button>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cameroon Pepper" />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the spice..." style={{ resize: "vertical" }} />
                <label className="form-label">Benefits</label>
                <textarea className="form-input" rows={3} value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} placeholder="One benefit per line (up to 3)" style={{ resize: "vertical" }} />
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Price (₦) *</label>
                  <input className="form-input" type="number" required min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="2500" />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input className="form-input" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Unlimited" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Uncategorized</option>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Low Stock Alert</label>
                  <input className="form-input" type="number" min="0" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} placeholder="5" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}>
                  {Object.entries(PRODUCT_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Product Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} className="form-input" style={{ padding: "0.5rem" }} />
                {editingProduct?.image_url && !imageFile && (
                  <p style={{ fontSize: "0.8rem", color: "var(--clr-muted)" }}>Current image kept if none selected.</p>
                )}
                {imageFile && (
                  <div style={{ marginTop: "0.5rem", position: "relative", aspectRatio: "4/3", maxWidth: 200, borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--clr-cream-dark)" }}>
                    <Image src={URL.createObjectURL(imageFile)} alt="Preview" fill style={{ objectFit: "cover" }} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Gallery Images (up to 5)</label>
                <p style={{ fontSize: "0.8rem", color: "var(--clr-muted)", marginBottom: "0.5rem" }}>
                  Additional images shown in the product detail page carousel.
                </p>
                {editingProduct?.images && editingProduct.images.length > 0 && (
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    {editingProduct.images.map((img, idx) => (
                      <div key={idx} style={{ position: "relative", width: 60, height: 60, borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--clr-cream-dark)" }}>
                        <Image src={img} alt={`Gallery ${idx + 1}`} fill style={{ objectFit: "cover" }} />
                      </div>
                    ))}
                    <span style={{ fontSize: "0.75rem", color: "var(--clr-muted)", alignSelf: "center" }}>
                      {editingProduct.images.length} existing
                    </span>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {[0, 1, 2, 3, 4].map((idx) => (
                    <input
                      key={idx}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const newFiles = [...galleryFiles];
                        newFiles[idx] = e.target.files?.[0] ?? null;
                        setGalleryFiles(newFiles);
                      }}
                      className="form-input"
                      style={{ padding: "0.5rem", fontSize: "0.8rem" }}
                    />
                  ))}
                </div>
                {galleryFiles.some((f) => f !== null) && (
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                    {galleryFiles.filter(Boolean).map((file, idx) => (
                      <div key={idx} style={{ position: "relative", width: 60, height: 60, borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--clr-cream-dark)" }}>
                        <Image src={URL.createObjectURL(file!)} alt={`New ${idx + 1}`} fill style={{ objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="admin-form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <span className="spinner" style={{ margin: "0 auto", display: "block" }} />
        </div>
      ) : !data || data.products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "#fff", borderRadius: "var(--radius-lg)", color: "var(--clr-muted)" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>No products found</p>
          <p>{search || filterCategory || filterStatus ? "Try adjusting your filters." : "Add your first spice!"}</p>
        </div>
      ) : (
        <>
          <div className="admin-products-table" style={{ display: "none" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--clr-cream-dark)", textAlign: "left" }}>
                  <th style={{ padding: "0.75rem 0.5rem", width: 40 }}>
                    <input
                      type="checkbox"
                      checked={data && data.products.length > 0 && selected.size === data.products.length}
                      onChange={toggleSelectAll}
                      style={{ cursor: "pointer" }}
                    />
                  </th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Product</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Category</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Price</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Stock</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Status</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((product) => {
                  const sc = STATUS_COLORS[product.status] || STATUS_COLORS.active;
                  const isLowStock =
                    product.stock !== null &&
                    product.stock <= (product.low_stock_threshold ?? 5) &&
                    product.stock > 0;
                  return (
                    <tr key={product.id} style={{ borderBottom: "1px solid var(--clr-cream-dark)" }}>
                      <td style={{ padding: "0.625rem 0.5rem" }}>
                        <input
                          type="checkbox"
                          checked={selected.has(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                      <td style={{ padding: "0.625rem 0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                          <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--clr-cream-dark)", flexShrink: 0, position: "relative" }}>
                            {product.image_url ? (
                              <Image src={product.image_url} alt="" fill style={{ objectFit: "cover" }} />
                            ) : null}
                          </div>
                          <span style={{ fontWeight: 600 }}>{product.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "0.625rem 0.5rem", textTransform: "capitalize" }}>
                        {product.category || "—"}
                      </td>
                      <td style={{ padding: "0.625rem 0.5rem", fontFamily: "var(--font-display)", fontWeight: 600 }}>
                        {formatNaira(product.price)}
                      </td>
                      <td style={{ padding: "0.625rem 0.5rem", color: isLowStock ? "var(--clr-chili)" : product.stock === 0 ? "var(--clr-chili)" : "var(--clr-muted)" }}>
                        {product.stock === null ? "∞" : product.stock}
                        {isLowStock && <span style={{ fontSize: "0.75rem", marginLeft: 4 }}>low</span>}
                      </td>
                      <td style={{ padding: "0.625rem 0.5rem" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.2rem 0.625rem",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            background: sc.bg,
                            color: sc.color,
                          }}
                        >
                          {PRODUCT_STATUS_LABELS[product.status] || product.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.625rem 0.5rem" }}>
                        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleStatusToggle(product)}
                            title={product.status === "active" ? "Mark out of stock" : "Mark active"}
                          >
                            {product.status === "active" ? "Disable" : "Enable"}
                          </button>
                          <button className="btn btn-sm btn-outline" onClick={() => openEdit(product)}>
                            Edit
                          </button>
                          {product.status !== "archived" && (
                            <button className="btn btn-sm btn-danger" onClick={() => handleArchive(product)}>
                              Archive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="admin-products-cards" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--clr-muted)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={data && data.products.length > 0 && selected.size === data.products.length}
                onChange={toggleSelectAll}
              />
              Select all on this page
            </label>
            {data.products.map((product) => {
              const sc = STATUS_COLORS[product.status] || STATUS_COLORS.active;
              const isLowStock =
                product.stock !== null &&
                product.stock <= (product.low_stock_threshold ?? 5) &&
                product.stock > 0;
              return (
                <div key={product.id} className="card" style={{ padding: "0.875rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                      <input
                        type="checkbox"
                        checked={selected.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        style={{ cursor: "pointer", width: 18, height: 18 }}
                      />
                      <div style={{ width: 56, height: 56, borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--clr-cream-dark)", flexShrink: 0, position: "relative" }}>
                      {product.image_url ? (
                        <Image src={product.image_url} alt="" fill style={{ objectFit: "cover" }} />
                      ) : null}
                    </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {product.name}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "var(--clr-muted)", textTransform: "capitalize" }}>
                            {product.category || "Uncategorized"}
                          </div>
                        </div>
                        <span
                          style={{
                            padding: "0.15rem 0.5rem",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            background: sc.bg,
                            color: sc.color,
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          {PRODUCT_STATUS_LABELS[product.status]}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.375rem" }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem", color: "var(--clr-terracotta)" }}>
                          {formatNaira(product.price)}
                        </span>
                        <span style={{ fontSize: "0.78rem", color: isLowStock ? "var(--clr-chili)" : "var(--clr-muted)" }}>
                          {product.stock === null ? "∞ in stock" : `${product.stock} left`}
                          {isLowStock && <span style={{ fontSize: "0.7rem", color: "var(--clr-chili)" }}>low</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                    <button
                      className="btn btn-sm"
                      onClick={() => handleStatusToggle(product)}
                      style={{
                        flex: 1,
                        background: product.status === "active" ? "var(--clr-chili)" : "var(--clr-success)",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      {product.status === "active" ? "Disable" : "Enable"}
                    </button>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(product)} style={{ flex: 1 }}>
                      Edit
                    </button>
                    {product.status !== "archived" && (
                      <button className="btn btn-sm btn-outline" onClick={() => handleArchive(product)} style={{ color: "var(--clr-chili)" }}>
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {data.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
              <button
                className="btn btn-sm btn-outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </button>
              <span style={{ fontSize: "0.85rem", color: "var(--clr-muted)" }}>
                Page {data.page} of {data.totalPages}
              </span>
              <button
                className="btn btn-sm btn-outline"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={!!archiveTarget}
        title="Archive Product"
        message={`Archive "${archiveTarget?.name}"? It will be hidden from the storefront but preserved in order history.`}
        confirmLabel="Archive"
        variant="danger"
        onConfirm={confirmArchive}
        onCancel={() => setArchiveTarget(null)}
      />

      <ConfirmModal
        open={bulkArchiveOpen}
        title="Archive Multiple Products"
        message={`Archive ${selected.size} product(s)? They will be hidden from the storefront but preserved in order history.`}
        confirmLabel={`Archive ${selected.size} product(s)`}
        variant="danger"
        onConfirm={confirmBulkArchive}
        onCancel={() => setBulkArchiveOpen(false)}
      />

    </div>
  );
}
