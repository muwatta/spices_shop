"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const type = searchParams.get("type");
  const accessToken = searchParams.get("access_token");

  useEffect(() => {
    if (type === "recovery" && accessToken) {
      setReady(true);
    } else {
      setMessage({
        text: "The password reset link is invalid or has expired.",
        type: "error",
      });
    }
  }, [type, accessToken]);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    if (password.length < 6) {
      setMessage({
        text: "Password must be at least 6 characters.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({
        text: "Password updated successfully. Please sign in.",
        type: "success",
      });
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => router.push("/login"), 2500);
    }

    setLoading(false);
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
            Reset Password
          </h1>
          <p
            style={{
              color: "var(--clr-muted)",
              textAlign: "center",
              marginBottom: "2rem",
              fontSize: "0.9rem",
            }}
          >
            Choose a new password for your account.
          </p>

          {message.text && (
            <div
              className={`alert alert-${message.type}`}
              style={{ marginBottom: "1rem" }}
            >
              {message.text}
            </div>
          )}

          {ready ? (
            <form
              onSubmit={handleUpdatePassword}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="form-input"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  className="form-input"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? "Updating password..." : "Update password"}
              </button>
            </form>
          ) : (
            <div style={{ color: "var(--clr-muted)", textAlign: "center" }}>
              If you believe this message is wrong, please request a new reset
              link.
            </div>
          )}

          <p
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              fontSize: "0.9rem",
              color: "var(--clr-muted)",
            }}
          >
            Remembered your password?{" "}
            <a
              href="/login"
              style={{ color: "var(--clr-saffron-dark)", fontWeight: 600 }}
            >
              Sign in
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
