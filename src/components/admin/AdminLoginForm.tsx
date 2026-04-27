"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);

  const unauthorizedNotice = searchParams.get("unauthorized");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (blocked) return;

    setError("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    if (!ADMIN_EMAIL) {
      setError("Admin login is not configured. Contact the site owner.");
      setLoading(false);
      return;
    }

    if (normalizedEmail !== ADMIN_EMAIL) {
      const response = await fetch("/api/admin/unauthorized", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          action: "login_attempt",
        }),
      });
      const result = await response.json();

      setBlocked(Boolean(result.blocked));
      setError(
        result.message ||
          "Unauthorized: only the admin email can sign in here.",
      );
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--clr-cream)",
      }}
    >
      <div
        className="card"
        style={{ width: "100%", maxWidth: "420px", padding: "2rem" }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.75rem",
            marginBottom: "0.5rem",
            textAlign: "center",
          }}
        >
          Admin Login
        </h1>
        <p
          style={{
            color: "var(--clr-muted)",
            textAlign: "center",
            marginBottom: "2rem",
            fontSize: "0.9rem",
          }}
        >
          Enter your admin credentials to continue.
        </p>

        {unauthorizedNotice && !error && (
          <div className="alert alert-warning" style={{ marginBottom: "1rem" }}>
            Unauthorized admin access was detected. Please sign in with the
            correct admin account.
          </div>
        )}

        {blocked && (
          <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
            Access is temporarily blocked after repeated unauthorized attempts.
            The developer has been notified.
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ position: "relative" }}>
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
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
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading || blocked}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
