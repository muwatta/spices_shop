"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/ui/PageTransition";
import { Skeleton } from "@/components/ui/Skeleton";
import styles from "./page.module.css";

export default function AccountProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    address: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    account_number: "",
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
        .select(
          "full_name, phone, address, address_line2, city, state, postal_code, account_number",
        )
        .eq("id", user.id)
        .single();

      if (customer) {
        setProfile({
          full_name: customer.full_name || "",
          phone: customer.phone || "",
          address: customer.address || "",
          address_line2: customer.address_line2 || "",
          city: customer.city || "",
          state: customer.state || "",
          postal_code: customer.postal_code || "",
          account_number: customer.account_number || "",
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
      address_line2: profile.address_line2,
      city: profile.city,
      state: profile.state,
      postal_code: profile.postal_code,
      account_number: profile.account_number,
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
        <div className={`card ${styles.container}`}>
          <Skeleton className={styles.header} />
          <Skeleton className={styles.subtext} />
          <div className={styles.skeletonGrid}>
            <Skeleton className={styles.skeletonRow} />
            <Skeleton className={styles.skeletonRow} />
            <Skeleton className={styles.skeletonRow} />
            <Skeleton className={styles.skeletonRow} />
            <Skeleton className={styles.skeletonRow} />
            <Skeleton className={styles.skeletonRow} />
            <Skeleton className={styles.skeletonRow} />
            <Skeleton className={styles.skeletonLarge} />
            <Skeleton className={styles.skeletonAction} />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className={`card ${styles.container}`}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Profile</h1>
          <p className={styles.subtext}>
            Update your delivery details and contact information.
          </p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type} ${styles.alertWrapper}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className={styles.form}>
          <div className="form-group">
            <label htmlFor="full_name" className="form-label">
              Full Name *
            </label>
            <input
              id="full_name"
              className="form-input"
              type="text"
              required
              placeholder="John Doe"
              value={profile.full_name}
              onChange={(e) =>
                setProfile({ ...profile, full_name: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number *
            </label>
            <input
              id="phone"
              className="form-input"
              type="tel"
              required
              placeholder="+234 800 000 0000"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Address Line 1 *
            </label>
            <input
              id="address"
              className="form-input"
              type="text"
              required
              placeholder="Street, house number"
              value={profile.address}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="address_line2" className="form-label">
              Address Line 2 (optional)
            </label>
            <input
              id="address_line2"
              className="form-input"
              type="text"
              placeholder="Apartment, suite, etc."
              value={profile.address_line2}
              onChange={(e) =>
                setProfile({ ...profile, address_line2: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="city" className="form-label">
              City *
            </label>
            <input
              id="city"
              className="form-input"
              type="text"
              required
              placeholder="Lagos"
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="state" className="form-label">
              State *
            </label>
            <input
              id="state"
              className="form-input"
              type="text"
              required
              placeholder="Abuja"
              value={profile.state}
              onChange={(e) =>
                setProfile({ ...profile, state: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="postal_code" className="form-label">
              Postal Code (optional)
            </label>
            <input
              id="postal_code"
              className="form-input"
              type="text"
              placeholder="100001"
              value={profile.postal_code}
              onChange={(e) =>
                setProfile({ ...profile, postal_code: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="account_number" className="form-label">
              Account Number (optional, for faster checkout)
            </label>
            <input
              id="account_number"
              className="form-input"
              type="text"
              placeholder="Bank account number"
              value={profile.account_number}
              onChange={(e) =>
                setProfile({ ...profile, account_number: e.target.value })
              }
            />
            <small className={styles.smallText}>
              Store your account number to auto‑fill payment details.
            </small>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </PageTransition>
  );
}
