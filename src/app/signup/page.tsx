"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { sanitizeRedirect } from "@/lib/utils";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="1"
        y1="1"
        x2="23"
        y2="23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SignupContent() {
  const searchParams = useSearchParams();
  const redirect = sanitizeRedirect(searchParams.get("redirect"), "/account");

  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const normalizedEmail = form.email.trim().toLowerCase();

    if (!form.full_name.trim()) {
      setError("Please enter your full name.");
      setLoading(false);
      return;
    }
    if (ADMIN_EMAIL && normalizedEmail === ADMIN_EMAIL) {
      setError("This email is reserved. Please use the admin login page.");
      setLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: form.full_name.trim(),
        email: normalizedEmail,
        password: form.password,
        phone: form.phone.trim(),
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Unable to create account. Please try again.");
      setLoading(false);
      return;
    }

    setMessage(result.message);
    setLoading(false);
  }

  const PasswordField = ({
    label,
    value,
    show,
    onToggle,
    onChange,
    placeholder,
    name,
    autoComplete,
  }: {
    label: string;
    value: string;
    show: boolean;
    onToggle: () => void;
    onChange: (v: string) => void;
    placeholder: string;
    name: string;
    autoComplete: string;
  }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: "relative" }}>
        <input
          className="form-input"
          type={show ? "text" : "password"}
          required
          minLength={6}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{ paddingRight: "3rem", width: "100%" }}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          style={{
            position: "absolute",
            right: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--clr-muted)",
            display: "flex",
            alignItems: "center",
            padding: "0.25rem",
          }}
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          padding: "2rem var(--space-md)",
        }}
      >
        <div
          className="card"
          style={{ width: "100%", maxWidth: "420px", padding: "2.5rem" }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.75rem",
              marginBottom: "0.5rem",
              textAlign: "center",
            }}
          >
            Create Account
          </h1>
          <p
            style={{
              color: "var(--clr-muted)",
              textAlign: "center",
              marginBottom: "2rem",
              fontSize: "0.9rem",
            }}
          >
            Join to track your spice orders
          </p>

          {error && (
            <div
              className="alert alert-error"
              style={{ marginBottom: "1rem", fontSize: "0.875rem" }}
            >
              {error}
            </div>
          )}
          {message && (
            <div
              className="alert alert-success"
              style={{ marginBottom: "1rem", fontSize: "0.875rem" }}
            >
              {message}
            </div>
          )}

          <form
            onSubmit={handleSignup}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                type="text"
                required
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                placeholder="Your full name"
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                className="form-input"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="08012345678"
                autoComplete="tel"
              />
            </div>

            <PasswordField
              label="Password"
              name="password"
              value={form.password}
              show={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              onChange={(v) => setForm({ ...form, password: v })}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              value={form.confirmPassword}
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              onChange={(v) => setForm({ ...form, confirmPassword: v })}
              placeholder="Repeat your password"
              autoComplete="new-password"
            />

            {/* Password match indicator */}
            {form.confirmPassword && (
              <p
                style={{
                  fontSize: "0.78rem",
                  marginTop: "-0.5rem",
                  color:
                    form.password === form.confirmPassword
                      ? "var(--clr-success)"
                      : "var(--clr-chili)",
                }}
              >
                {form.password === form.confirmPassword
                  ? "✓ Passwords match"
                  : "✗ Passwords do not match"}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ marginTop: "0.5rem" }}
            >
              {loading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    justifyContent: "center",
                  }}
                >
                  <span className="spinner" /> Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              fontSize: "0.9rem",
              color: "var(--clr-muted)",
            }}
          >
            Already have an account?{" "}
            <Link
              href={`/login?redirect=${redirect}`}
              style={{ color: "var(--clr-saffron-dark)", fontWeight: 600 }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
