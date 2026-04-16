"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/ui/PageTransition";

export default function AccountSecurityPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login?redirect=/account/security");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    });
    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "Password updated successfully.", type: "success" });
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    }

    setSaving(false);
  }

  return (
    <PageTransition>
      <div className="card" style={{ padding: "2rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1
            style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem" }}
          >
            Security
          </h1>
          <p style={{ color: "var(--clr-muted)", marginTop: "0.5rem" }}>
            Change your password to keep your account secure.
          </p>
        </div>

        {message.text && (
          <div
            className={`alert alert-${message.type}`}
            style={{ marginBottom: "1rem" }}
          >
            {message.text}
          </div>
        )}

        <form
          onSubmit={handleSave}
          style={{ display: "grid", gap: "1rem", maxWidth: "480px" }}
        >
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              className="form-input"
              type="password"
              required
              minLength={6}
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
            />
          </div>

          <div className="form-group">
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
            {saving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </PageTransition>
  );
}
