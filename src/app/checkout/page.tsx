"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import { createClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

type PaymentMethod = "bank_transfer" | "cash_on_delivery";

interface BankDetails {
  bank_name: string;
  account_number: string;
  account_name: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cash_on_delivery");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [form, setForm] = useState({ full_name: "", phone: "", address: "" });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "bank_details")
      .single()
      .then(({ data }) => {
        if (data?.value) setBankDetails(data.value as BankDetails);
      });

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase
          .from("customers")
          .select("*")
          .eq("id", data.user.id)
          .single()
          .then(({ data: customer }) => {
            if (customer) {
              setForm({
                full_name: customer.full_name ?? "",
                phone: customer.phone ?? "",
                address: customer.address ?? "",
              });
            }
          });
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (paymentMethod === "bank_transfer" && !proofFile) {
      setError("Please upload your payment proof (screenshot/receipt).");
      return;
    }

    setLoading(true);
    try {
      // 1. Upsert customer profile
      await supabase.from("customers").upsert({
        id: user.id,
        full_name: form.full_name,
        phone: form.phone,
        address: form.address,
      });

      // 2. Upload payment proof if bank transfer
      let proofUrl: string | null = null;
      if (paymentMethod === "bank_transfer" && proofFile) {
        const ext = proofFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("payment-proofs")
          .upload(fileName, proofFile);
        if (uploadError) throw uploadError;
        proofUrl = uploadData.path;
      }

      // 3. Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: user.id,
          status: "pending",
          payment_method: paymentMethod,
          payment_proof_url: proofUrl,
          total_amount: totalPrice(),
          delivery_address: form.address,
        })
        .select()
        .single();
      if (orderError) throw orderError;

      // 4. Insert order items & decrement stock
      for (const item of items) {
        const { error: itemsError } = await supabase
          .from("order_items")
          .insert({
            order_id: order.id,
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: item.product.price,
          });
        if (itemsError) throw itemsError;

        // Decrement stock if stock is not null (finite stock)
        if (item.product.stock !== null) {
          const newStock = item.product.stock - item.quantity;
          if (newStock < 0)
            throw new Error(`Insufficient stock for ${item.product.name}`);
          const { error: stockError } = await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.product.id);
          if (stockError) throw stockError;
        }
      }

      // 5. Send order confirmation email via API route
      await fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          orderId: order.id,
          items: items.map((i) => ({
            name: i.product.name,
            quantity: i.quantity,
            price: i.product.price,
          })),
          total: totalPrice(),
          paymentMethod,
        }),
      });

      clearCart();
      router.push(`/account/orders/${order.id}?success=1`);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main>
          <div
            className="container"
            style={{ padding: "4rem var(--space-md)", textAlign: "center" }}
          >
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛒</p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                marginBottom: "0.75rem",
              }}
            >
              Nothing to checkout
            </h2>
            <Link href="/" className="btn btn-primary">
              Go Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <div className="container" style={{ padding: "2rem var(--space-md)" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              marginBottom: "2rem",
            }}
          >
            Checkout
          </h1>

          {!user && (
            <div
              className="alert alert-info"
              style={{ marginBottom: "1.5rem" }}
            >
              <strong>Please log in to place your order.</strong>{" "}
              <Link
                href="/login?redirect=/checkout"
                style={{ textDecoration: "underline" }}
              >
                Login here
              </Link>{" "}
              or{" "}
              <Link
                href="/signup?redirect=/checkout"
                style={{ textDecoration: "underline" }}
              >
                create an account
              </Link>
              .
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            {/* Left column – same as original */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {/* Delivery info */}
              <div className="card" style={{ padding: "1.5rem" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.2rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  Delivery Details
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      className="form-input"
                      type="text"
                      required
                      value={form.full_name}
                      onChange={(e) =>
                        setForm({ ...form, full_name: e.target.value })
                      }
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      className="form-input"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="08012345678"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Delivery Address *</label>
                    <textarea
                      className="form-input"
                      required
                      rows={3}
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      placeholder="Your full delivery address"
                      style={{ resize: "vertical" }}
                    />
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="card" style={{ padding: "1.5rem" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.2rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  Payment Method
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {(
                    ["cash_on_delivery", "bank_transfer"] as PaymentMethod[]
                  ).map((method) => (
                    <label
                      key={method}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "1rem",
                        border: `2px solid ${paymentMethod === method ? "var(--clr-saffron)" : "var(--clr-cream-dark)"}`,
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        background:
                          paymentMethod === method
                            ? "rgba(232,160,32,0.06)"
                            : "white",
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        style={{ accentColor: "var(--clr-saffron)" }}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {method === "cash_on_delivery"
                            ? "💵 Cash on Delivery"
                            : "🏦 Bank Transfer"}
                        </div>
                        <div
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--clr-muted)",
                          }}
                        >
                          {method === "cash_on_delivery"
                            ? "Pay when your order arrives"
                            : "Transfer to our bank account"}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === "bank_transfer" && (
                  <div
                    style={{
                      marginTop: "1.25rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {bankDetails && (
                      <div
                        style={{
                          background: "var(--clr-cream)",
                          border: "1px solid var(--clr-cream-dark)",
                          borderRadius: "var(--radius-md)",
                          padding: "1rem",
                          fontSize: "0.9rem",
                          lineHeight: 1.8,
                        }}
                      >
                        <strong
                          style={{ display: "block", marginBottom: "0.25rem" }}
                        >
                          Transfer to:
                        </strong>
                        <div>
                          🏦 <strong>{bankDetails.bank_name}</strong>
                        </div>
                        <div>
                          Account: <strong>{bankDetails.account_number}</strong>
                        </div>
                        <div>
                          Name: <strong>{bankDetails.account_name}</strong>
                        </div>
                        <div
                          style={{
                            marginTop: "0.5rem",
                            fontWeight: 700,
                            color: "var(--clr-saffron-dark)",
                          }}
                        >
                          Amount: {formatNaira(totalPrice())}
                        </div>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">
                        Upload Payment Proof *
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          setProofFile(e.target.files?.[0] ?? null)
                        }
                        className="form-input"
                        style={{ padding: "0.5rem" }}
                        required
                      />
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--clr-muted)",
                        }}
                      >
                        Upload screenshot of your transfer receipt
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right column – order summary (unchanged) */}
            <div
              className="card"
              style={{ padding: "1.5rem", alignSelf: "start" }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.2rem",
                  marginBottom: "1.25rem",
                }}
              >
                Order Summary
              </h2>
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.625rem",
                    fontSize: "0.9rem",
                  }}
                >
                  <span style={{ color: "var(--clr-muted)" }}>
                    {product.name} × {quantity}
                  </span>
                  <span>{formatNaira(product.price * quantity)}</span>
                </div>
              ))}
              <div className="divider" />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <span>Total</span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--clr-saffron-dark)",
                  }}
                >
                  {formatNaira(totalPrice())}
                </span>
              </div>
              {error && (
                <div
                  className="alert alert-error"
                  style={{ marginBottom: "1rem", fontSize: "0.875rem" }}
                >
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading || !user}
                style={{ width: "100%" }}
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
                    <span className="spinner" /> Placing Order...
                  </span>
                ) : (
                  "Place Order"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
