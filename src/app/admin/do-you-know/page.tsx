"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DoYouKnowItem } from "@/types";

const supabase = createClient();

export default function AdminDoYouKnowPage() {
  const [items, setItems] = useState<DoYouKnowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<DoYouKnowItem | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    subtitle: "",
    benefits: "",
    recommendation: "",
  });

  useEffect(() => {
    setLoading(true);
    supabase
      .from("do_you_know_items")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setItems((data ?? []) as DoYouKnowItem[]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setEditingItem(null);
    setForm({ name: "", subtitle: "", benefits: "", recommendation: "" });
    setImageFile(null);
    setMessage(null);
    setError(null);
  };

  const handleEdit = (item: DoYouKnowItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      subtitle: item.subtitle || "",
      benefits: item.benefits || "",
      recommendation: item.recommendation || "",
    });
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const endpoint = "/api/admin/do-you-know";
    const method = editingItem ? "PUT" : "POST";
    const payload = new FormData();

    if (editingItem) payload.append("id", editingItem.id);
    payload.append("name", form.name);
    payload.append("subtitle", form.subtitle);
    payload.append("benefits", form.benefits);
    payload.append("recommendation", form.recommendation);
    if (imageFile) payload.append("image", imageFile);

    const response = await fetch(endpoint, { method, body: payload });
    const result = await response.json();

    if (!response.ok || result.error) {
      setError(result.error || "Unable to save guide.");
      setSaving(false);
      return;
    }

    const refresh = await supabase
      .from("do_you_know_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (refresh.error) {
      setError(refresh.error.message);
    } else {
      setItems((refresh.data ?? []) as DoYouKnowItem[]);
      setMessage(editingItem ? "Guide updated." : "Guide added.");
      resetForm();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this guide?")) return;
    setSaving(true);
    setError(null);
    const response = await fetch("/api/admin/do-you-know", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await response.json();
    if (!response.ok || result.error) {
      setError(result.error || "Unable to delete guide.");
      setSaving(false);
      return;
    }
    const refresh = await supabase
      .from("do_you_know_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (refresh.error) {
      setError(refresh.error.message);
    } else {
      setItems((refresh.data ?? []) as DoYouKnowItem[]);
      setMessage("Guide removed.");
    }
    setSaving(false);
  };

  const benefitsPreview = useMemo(
    () => (form.benefits ? form.benefits.split("\n").filter(Boolean) : []),
    [form.benefits],
  );

  return (
    <main className="container" style={{ padding: "2rem 0" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
          Admin: Do You Know Guides
        </h1>
        <p style={{ maxWidth: "45rem", lineHeight: 1.8, color: "#555" }}>
          Manage the health benefit and recommendation content displayed on the
          Do You Know page.
        </p>
      </div>

      <section
        style={{
          marginBottom: "2rem",
          padding: "1.75rem",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: "1rem",
          background: "white",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>
          {editingItem ? "Edit guide" : "Add new guide"}
        </h2>
        {message && (
          <div style={{ color: "var(--clr-saffron)", marginBottom: "1rem" }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ color: "var(--clr-chili)", marginBottom: "1rem" }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <label>
            Title
            <input
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              required
              style={{ width: "100%", padding: "0.8rem", marginTop: "0.5rem" }}
            />
          </label>
          <label>
            Subtitle
            <input
              value={form.subtitle}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, subtitle: event.target.value }))
              }
              style={{ width: "100%", padding: "0.8rem", marginTop: "0.5rem" }}
            />
          </label>
          <label>
            Benefits
            <textarea
              value={form.benefits}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, benefits: event.target.value }))
              }
              rows={5}
              style={{ width: "100%", padding: "0.8rem", marginTop: "0.5rem" }}
            />
          </label>
          <label>
            Recommendation
            <textarea
              value={form.recommendation}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  recommendation: event.target.value,
                }))
              }
              rows={3}
              required
              style={{ width: "100%", padding: "0.8rem", marginTop: "0.5rem" }}
            />
          </label>
          <label>
            Image (optional)
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setImageFile(event.target.files?.[0] ?? null)
              }
              style={{ width: "100%", marginTop: "0.5rem" }}
            />
          </label>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: "var(--clr-saffron)",
                color: "var(--clr-bark)",
                border: "none",
                padding: "0.9rem 1.5rem",
                borderRadius: "999px",
                cursor: "pointer",
              }}
            >
              {saving
                ? "Saving..."
                : editingItem
                  ? "Update guide"
                  : "Add guide"}
            </button>
            {editingItem && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: "rgba(0,0,0,0.06)",
                  border: "none",
                  padding: "0.9rem 1.5rem",
                  borderRadius: "999px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2 style={{ marginBottom: "1rem" }}>Existing guides</h2>
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p>No guides yet. Create the first Do You Know item.</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {items.map((item) => (
              <article
                key={item.id}
                style={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: "1rem",
                  padding: "1.25rem",
                  background: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, color: "#888" }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                    <h3 style={{ margin: "0.35rem 0" }}>{item.name}</h3>
                    {item.subtitle && (
                      <p style={{ margin: 0 }}>{item.subtitle}</p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleEdit(item)}
                      style={{
                        background: "var(--clr-saffron)",
                        border: "none",
                        color: "var(--clr-bark)",
                        padding: "0.7rem 1rem",
                        borderRadius: "999px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        background: "var(--clr-chili)",
                        border: "none",
                        color: "white",
                        padding: "0.7rem 1rem",
                        borderRadius: "999px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {item.recommendation && (
                  <p style={{ marginTop: "1rem" }}>
                    <strong>Recommendation: </strong>
                    {item.recommendation}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
