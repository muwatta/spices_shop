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
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      setSaving(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({
        text: "Password must be at least 6 characters.",
        type: "error",
      });
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

    const response = await fetch("/api/auth/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwordForm.newPassword }),
    });

    const result = await response.json();
    if (!response.ok) {
      setMessage({
        text: result.error || "Unable to update password.",
        type: "error",
      });
    } else {
      const email = user.email;
      const fullName =
        user.user_metadata?.full_name || user.user_metadata?.name || "Customer";

      if (email) {
        await fetch("/api/send-password-change-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            userName: fullName,
            returnUrl: `${window.location.origin}/account/security`,
          }),
        });
      }

      setMessage({
        text: "Password updated successfully. A confirmation email has been sent.",
        type: "success",
      });
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
          <div className="form-group" style={{ position: "relative" }}>
            <label className="form-label">New Password</label>
            <input
              className="form-input"
              type={showNewPassword ? "text" : "password"}
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
            <button
              type="button"
              onClick={() => setShowNewPassword((current) => !current)}
              style={{
                position: "absolute",
                right: "0.85rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--clr-saffron-dark)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {showNewPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="form-group" style={{ position: "relative" }}>
            <label className="form-label">Confirm New Password</label>
            <input
              className="form-input"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              style={{
                position: "absolute",
                right: "0.85rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--clr-saffron-dark)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </PageTransition>
  );
}
