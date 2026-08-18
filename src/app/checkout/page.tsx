"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import { createClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";

type PaymentMethod = "bank_transfer" | "cash_on_delivery";

interface BankDetails {
  bank_name: string;
  account_number: string;
  account_name: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

function CheckoutContent() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cash_on_delivery");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [useStoredAccount, setUseStoredAccount] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    account_number: "",
  });
  const [touched, setTouched] = useState({
    full_name: false,
    phone: false,
    address_line1: false,
    city: false,
    state: false,
  });
  const [cartProducts, setCartProducts] = useState<Record<string, any>>({});
  const [cartLoading, setCartLoading] = useState(true);

  const defaultBankDetails: BankDetails = {
    bank_name: "Moniepoint",
    account_number: "8032423638",
    account_name: "Hamza Rasheedah Muhammad",
  };
  const bankInfo = bankDetails ?? defaultBankDetails;

  useEffect(() => {
    async function fetchProducts() {
      if (items.length === 0) {
        setCartProducts({});
        setCartLoading(false);
        return;
      }
      const productIds = items.map((i) => i.productId);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image_url, stock")
        .in("id", productIds);
      if (!error && data) {
        const productMap: Record<string, any> = {};
        data.forEach((p) => (productMap[p.id] = p));
        setCartProducts(productMap);
      }
      setCartLoading(false);
    }
    fetchProducts();
  }, [items, supabase]);

  const cartItems = items
    .map((item) => ({ ...item, product: cartProducts[item.productId] }))
    .filter((item) => item.product);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );

  const isFormValid = useMemo(() => {
    return (
      form.full_name.trim() !== "" &&
      form.phone.trim() !== "" &&
      form.address_line1.trim() !== "" &&
      form.city.trim() !== "" &&
      form.state.trim() !== ""
    );
  }, [form]);

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
                address_line1: customer.address ?? "",
                address_line2: customer.address_line2 ?? "",
                city: customer.city ?? "",
                state: customer.state ?? "",
                postal_code: customer.postal_code ?? "",
                account_number: customer.account_number ?? "",
              });
            }
          });
      }
    });
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value.replace(/<[^>]*>/g, "").trimStart(),
    }));
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!isFormValid) {
      setError("Please fill in all required delivery details.");
      return;
    }
    if (paymentMethod === "bank_transfer" && !proofFile) {
      setError("Please upload your payment proof (screenshot/receipt).");
      return;
    }

    setLoading(true);
    try {
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

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          address_line1: form.address_line1.trim(),
          address_line2: form.address_line2.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postal_code: form.postal_code.trim(),
          account_number: form.account_number.trim(),
          payment_method: paymentMethod,
          payment_proof_url: proofUrl,
          items: cartItems.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.error || "Unable to place order. Please try again.",
        );
      }

      fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: result.order.id,
          status: "pending",
        }),
      }).catch((err) => console.error("Email failed:", err));

      clearCart();
      router.push(`/account/orders/${result.order.id}?success=1`);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (cartLoading) {
    return (
      <>
        <Navbar />
        <main>
          <div className="container" style={{ padding: "2rem", textAlign: "center" }}>
            <span className="spinner" />
            <p style={{ marginTop: "1rem", color: "var(--clr-muted)" }}>Loading checkout...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <main>
          <div className="container" style={{ padding: "4rem var(--space-md)" }}>
            <EmptyState
              icon={
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              }
              title="Your cart is empty"
              action={<Link href="/" className="btn btn-primary">Continue Shopping</Link>}
            />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--clr-cream)", minHeight: "70vh" }}>
        <div className="container" style={{ padding: "2rem var(--space-md)" }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="page-header">
              <h1 className="page-header__title">Checkout</h1>
              <p className="page-header__subtitle">Complete your order securely</p>
            </div>
          </motion.div>

          {!user && (
            <motion.div className="alert alert-info" style={{ marginBottom: "1.5rem" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <strong>Please log in to place your order.</strong>{" "}
              <Link href="/login?redirect=/checkout" style={{ textDecoration: "underline" }}>Login here</Link>{" "}
              or <Link href="/signup?redirect=/checkout" style={{ textDecoration: "underline" }}>create an account</Link>.
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="checkout-layout"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Delivery Details */}
                <motion.div variants={fadeInUp} className="card" style={{ padding: "1.75rem", borderRadius: "1.25rem", boxShadow: "var(--shadow-md)" }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "1.5rem" }}>
                    Delivery Details
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {[
                      { name: "full_name", label: "Full Name", type: "text", placeholder: "Your full name", required: true },
                      { name: "phone", label: "Phone Number", type: "tel", placeholder: "08012345678", required: true },
                      { name: "address_line1", label: "Address Line 1", type: "text", placeholder: "Street, house number", required: true },
                      { name: "address_line2", label: "Address Line 2 (optional)", type: "text", placeholder: "Apartment, suite, etc.", required: false },
                      { name: "city", label: "City", type: "text", placeholder: "City", required: true },
                      { name: "state", label: "State", type: "text", placeholder: "State", required: true },
                      { name: "postal_code", label: "Postal Code (optional)", type: "text", placeholder: "e.g., 23401", required: false },
                    ].map((field) => (
                      <div key={field.name} className="form-group">
                        <label className="form-label" htmlFor={`checkout-${field.name}`}>
                          {field.label} {field.required && "*"}
                        </label>
                        <input
                          id={`checkout-${field.name}`}
                          className="form-input"
                          type={field.type}
                          name={field.name}
                          required={field.required}
                          value={(form as any)[field.name]}
                          onChange={handleInputChange}
                          onBlur={() => field.required && handleBlur(field.name as keyof typeof touched)}
                          placeholder={field.placeholder}
                        />
                        {field.required && (touched as any)[field.name] && !(form as any)[field.name].trim() && (
                          <p className="field-error">{field.label} is required</p>
                        )}
                      </div>
                    ))}
                    <div className="form-group">
                      <label className="form-label" htmlFor="checkout-account_number">
                        Account Number (optional)
                      </label>
                      <input
                        id="checkout-account_number"
                        className="form-input"
                        type="text"
                        name="account_number"
                        value={form.account_number}
                        onChange={handleInputChange}
                        placeholder="Bank account number (for faster checkout)"
                      />
                      <small className="form-hint">
                        Save your account number to auto-fill payment details next time.
                      </small>
                    </div>
                  </div>
                </motion.div>

                {/* Payment Method */}
                <motion.div variants={fadeInUp} className="card" style={{ padding: "1.75rem", borderRadius: "1.25rem", boxShadow: "var(--shadow-md)" }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "1.5rem" }}>
                    Payment Method
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {(["cash_on_delivery", "bank_transfer"] as PaymentMethod[]).map((method) => (
                      <motion.label
                        key={method}
                        whileTap={{ scale: 0.99 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "1rem",
                          border: `2px solid ${paymentMethod === method ? "var(--clr-terracotta)" : "var(--clr-cream-dark)"}`,
                          borderRadius: "var(--radius-md)",
                          cursor: "pointer",
                          background: paymentMethod === method ? "rgba(180,90,60,0.05)" : "white",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                          style={{ accentColor: "var(--clr-terracotta)", width: "1.2rem", height: "1.2rem" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: "1rem" }}>
                            {method === "cash_on_delivery" ? "Cash on Delivery" : "Bank Transfer"}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--clr-muted)" }}>
                            {method === "cash_on_delivery" ? "Pay when your order arrives" : "Transfer to our bank account"}
                          </div>
                        </div>
                      </motion.label>
                    ))}
                  </div>

                  <AnimatePresence>
                    {paymentMethod === "bank_transfer" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: "hidden", marginTop: "1.5rem" }}
                      >
                        <div style={{ background: "var(--clr-cream)", border: "1px solid var(--clr-cream-dark)", borderRadius: "1rem", padding: "1rem", fontSize: "0.9rem", lineHeight: 1.8 }}>
                          <strong style={{ display: "block", marginBottom: "0.5rem" }}>Transfer to:</strong>
                          <div><strong>{bankInfo.bank_name}</strong></div>
                          <div>Account: <strong>{bankInfo.account_number}</strong></div>
                          <div>Name: <strong>{bankInfo.account_name}</strong></div>
                          <div style={{ marginTop: "0.75rem", fontWeight: 700,                             color: "var(--clr-terracotta-dark)" }}>
                            Amount: {formatNaira(totalPrice)}
                          </div>
                        </div>

                        {form.account_number && (
                          <div style={{ marginTop: "0.75rem" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                              <input
                                type="checkbox"
                                checked={useStoredAccount}
                                onChange={(e) => setUseStoredAccount(e.target.checked)}
                              />
                              Use stored account number ({form.account_number}) for transfer?
                            </label>
                          </div>
                        )}

                        <div style={{ marginTop: "1rem" }}>
                          <label className="form-label" htmlFor="proof-upload">Upload payment proof (screenshot/receipt) *</label>
                          <input
                            id="proof-upload"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                            className="form-input"
                            style={{ padding: "0.5rem" }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Right: Order Summary */}
              <motion.div
                variants={fadeInUp}
                className="card order-summary"
                style={{ borderRadius: "1.25rem", boxShadow: "var(--shadow-lg)", position: "sticky", top: "100px" }}
              >
                <h2 className="order-summary__title">Order Summary</h2>
                <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "1rem" }}>
                  {cartItems.map(({ product, quantity }) => (
                    <div key={product.id} className="order-summary__line">
                      <span className="order-summary__line-label">
                        {product.name} <span style={{ fontSize: "0.75rem" }}>x{quantity}</span>
                      </span>
                      <span style={{ fontWeight: 500 }}>{formatNaira(product.price * quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="divider" style={{ margin: "0.75rem 0" }} />
                <div className="order-summary__total" style={{ marginBottom: "1.5rem" }}>
                  <span>Total</span>
                  <span className="order-summary__total-value">{formatNaira(totalPrice)}</span>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="alert alert-error" style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>
                    {error}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  className="btn btn-primary btn-lg w-full"
                  disabled={loading || !user || !isFormValid}
                  style={{ borderRadius: "2rem", padding: "1rem" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                      <span className="spinner" /> Placing Order...
                    </span>
                  ) : (
                    "Place Order"
                  )}
                </motion.button>

                <p style={{ fontSize: "0.8125rem", color: "var(--clr-muted)", textAlign: "center", marginTop: "1rem" }}>
                  By placing an order, you agree to our terms and conditions.
                </p>
              </motion.div>
            </motion.div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <span className="spinner" style={{ margin: "0 auto", display: "block" }} />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
