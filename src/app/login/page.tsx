"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import toast, { Toaster } from "react-hot-toast";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/account";
  const confirmed = searchParams.get("confirmed") === "true";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Show confirmation success message
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

    // Fetch user's profile to get full name
    const { data: customer } = await supabase
      .from("customers")
      .select("full_name, phone, address")
      .eq("id", data.user.id)
      .single();

    const firstName = customer?.full_name?.split(" ")[0] || "there";
    toast.success(`Welcome back, ${firstName}! 🎉`);

    // Check if profile is incomplete (missing phone or address)
    if (!customer?.phone || !customer?.address) {
      toast(
        (t) => (
          <div>
            <strong>Complete your profile</strong>
            <p>
              Please add your phone number and delivery address for faster
              checkout.
            </p>
            <Link
              href="/account/profile"
              onClick={() => toast.dismiss(t.id)}
              className="btn btn-sm btn-primary"
              style={{ marginTop: "0.5rem" }}
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
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
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

          <p
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              fontSize: "0.9rem",
              color: "var(--clr-muted)",
            }}
          >
            No account?{" "}
            <Link
              href={`/signup?redirect=${redirect}`}
              style={{ color: "var(--clr-saffron-dark)", fontWeight: 600 }}
            >
              Create one
            </Link>
          </p>
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
