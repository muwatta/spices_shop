"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import toast, { Toaster } from "react-hot-toast";
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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = sanitizeRedirect(searchParams.get("redirect"), "/account");
  const confirmed = searchParams.get("confirmed") === "true";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (confirmed) {
      toast.success("Email confirmed! Please log in.", { duration: 5000 });
    }
  }, [confirmed]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const { data: customer } = await supabase
      .from("customers")
      .select("full_name, phone, address")
      .eq("id", data.user.id)
      .single();

    const firstName = customer?.full_name?.split(" ")[0] || "there";
    toast.success(`Welcome back, ${firstName}! 🎉`);

    if (!customer?.phone || !customer?.address) {
      toast(
        (t) => (
          <div>
            <strong>Complete your profile</strong>
            <p style={{ margin: "0.25rem 0 0.5rem", fontSize: "0.875rem" }}>
              Add your phone and delivery address for faster checkout.
            </p>
            <Link
              href="/account/profile"
              onClick={() => toast.dismiss(t.id)}
              className="btn btn-sm btn-primary"
              style={{ marginTop: "0.25rem" }}
            >
              Update Profile
            </Link>
          </div>
        ),
        { duration: 10000 },
      );
    }

    router.push(redirect);
    router.refresh();
  }

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
            Welcome Back
          </h1>
          <p
            style={{
              color: "var(--clr-muted)",
              textAlign: "center",
              marginBottom: "2rem",
              fontSize: "0.9rem",
            }}
          >
            Sign in to view your orders
          </p>

          {error && (
            <div
              className="alert alert-error"
              style={{ marginBottom: "1rem", fontSize: "0.875rem" }}
            >
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
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: "3rem", width: "100%" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                    transition: "color 150ms ease",
                  }}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

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
                  <span className="spinner" /> Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem",
              marginTop: "1.5rem",
              fontSize: "0.9rem",
              color: "var(--clr-muted)",
            }}
          >
            <Link
              href="/forgot-password"
              style={{ color: "var(--clr-saffron-dark)", fontWeight: 600 }}
            >
              Forgot password?
            </Link>
            <span>
              No account?{" "}
              <Link
                href={`/signup?redirect=${redirect}`}
                style={{ color: "var(--clr-saffron-dark)", fontWeight: 600 }}
              >
                Create one
              </Link>
            </span>
          </div>
        </div>
      </main>
      <Footer />
      <Toaster position="top-right" />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
