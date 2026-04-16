"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/ui/PageTransition";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AccountProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirect=/account/profile");
        return;
      }

      const { data: customer } = await supabase
        .from("customers")
        .select("full_name, phone, address")
        .eq("id", user.id)
        .single();

      if (customer) {
        setProfile({
          full_name: customer.full_name || "",
          phone: customer.phone || "",
          address: customer.address || "",
        });
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login?redirect=/account/profile");
      return;
    }

    const { error } = await supabase.from("customers").upsert({
      id: user.id,
      full_name: profile.full_name,
      phone: profile.phone,
      address: profile.address,
    });

    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "Profile updated successfully.", type: "success" });
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="card" style={{ padding: "2rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <Skeleton style={{ width: "220px", height: "28px", marginBottom: "1rem" }} />
            <Skeleton style={{ width: "180px", height: "16px" }} />
          </div>
          <div style={{ display: "grid", gap: "1rem", maxWidth: "560px" }}>
            <Skeleton style={{ height: "56px" }} />
            <Skeleton style={{ height: "56px" }} />
            <Skeleton style={{ height: "120px" }} />
            <Skeleton style={{ width: "140px", height: "44px", borderRadius: "999px" }} />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="card" style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem" }}>
          Profile
        </h1>
        <p style={{ color: "var(--clr-muted)", marginTop: "0.5rem" }}>
          Update your delivery details and contact information.
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
        style={{ display: "grid", gap: "1rem", maxWidth: "560px" }}
      >
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            type="text"
            required
            value={profile.full_name}
            onChange={(e) =>
              setProfile({ ...profile, full_name: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input
            className="form-input"
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Delivery Address</label>
          <textarea
            className="form-input"
            rows={4}
            value={profile.address}
            onChange={(e) =>
              setProfile({ ...profile, address: e.target.value })
            }
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
