export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import PrintReceiptButton from "@/components/ui/PrintReceiptButton";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { success } = await searchParams;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "*, order_items(*, products(name, image_url, price, description)), customers(*)",
    )
    .eq("id", id)
    .eq("customer_id", user.id)
    .single();

  const statusSteps = ["pending", "confirmed", "delivered"];
  const orderNotFound = !order || error;
  const currentStep = order ? statusSteps.indexOf(order.status) : -1;
  const displayId =
    order?.transaction_id ?? order?.id.slice(0, 8).toUpperCase();
  const isSuccess = !!success;

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--clr-cream)", minHeight: "70vh" }}>
        <div className="container" style={{ padding: "1.25rem 1rem 3rem" }}>
          {orderNotFound ? (
            <div
              className="card"
              style={{
                padding: "2rem",
                textAlign: "center",
                borderRadius: "1.25rem",
              }}
            >
              <p style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📦</p>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.35rem",
                  marginBottom: "0.75rem",
                }}
              >
                Order not found
              </h1>
              <p
                style={{
                  color: "var(--clr-muted)",
                  marginBottom: "1.5rem",
                  fontSize: "0.9rem",
                }}
              >
                We couldn't locate that order.
              </p>
              <Link href="/account/orders" className="btn btn-primary">
                Back to Orders
              </Link>
            </div>
          ) : (
            <div style={{ maxWidth: "680px", margin: "0 auto" }}>
              {/* ── Success banner ── */}
              {isSuccess && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #D1FAE5, #A7F3D0)",
                    border: "1px solid #6EE7B7",
                    borderRadius: "1.25rem",
                    padding: "1.5rem 1.25rem",
                    marginBottom: "1.25rem",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
                    🎉
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.3rem",
                      color: "#065F46",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Order Placed!
                  </h2>
                  <p
                    style={{
                      color: "#047857",
                      fontSize: "0.875rem",
                      marginBottom: "0.4rem",
                      lineHeight: 1.6,
                    }}
                  >
                    We'll confirm shortly and reach out via WhatsApp or phone.
                  </p>
                  <p
                    style={{
                      color: "#065F46",
                      fontWeight: 700,
                      fontSize: "1rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    #{displayId}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.625rem",
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <PrintReceiptButton />
                    <Link
                      href="/"
                      className="btn btn-outline"
                      style={{ borderColor: "#065F46", color: "#065F46" }}
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              )}

              {/* ── Page header ── */}
              <div style={{ marginBottom: "1.25rem" }}>
                <Link
                  href="/account/orders"
                  style={{
                    color: "var(--clr-saffron-dark)",
                    fontSize: "0.8125rem",
                  }}
                  className="no-print"
                >
                  ← My Orders
                </Link>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginTop: "0.5rem",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h1
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
                        margin: 0,
                      }}
                    >
                      Order #{displayId}
                    </h1>
                    <p
                      style={{
                        margin: "0.2rem 0 0",
                        color: "var(--clr-muted)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {new Date(order.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      className={`badge badge-${order.status}`}
                      style={{ fontSize: "0.8rem" }}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                    {!isSuccess && <PrintReceiptButton className="no-print" />}
                  </div>
                </div>
              </div>

              {/* ── Progress tracker ── */}
              {order.status !== "cancelled" && (
                <div
                  className="card no-print"
                  style={{
                    padding: "1.25rem 1rem",
                    marginBottom: "1.25rem",
                    borderRadius: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      position: "relative",
                    }}
                  >
                    {/* Track */}
                    <div
                      style={{
                        position: "absolute",
                        top: "17px",
                        left: "12%",
                        right: "12%",
                        height: "3px",
                        background: "var(--clr-cream-dark)",
                        borderRadius: "2px",
                        zIndex: 0,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "17px",
                        left: "12%",
                        width: `${(currentStep / (statusSteps.length - 1)) * 76}%`,
                        height: "3px",
                        background: "var(--clr-saffron)",
                        borderRadius: "2px",
                        zIndex: 1,
                      }}
                    />
                    {statusSteps.map((step, i) => (
                      <div
                        key={step}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.4rem",
                          position: "relative",
                          zIndex: 2,
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "50%",
                            background:
                              i <= currentStep
                                ? "var(--clr-saffron)"
                                : "var(--clr-cream-dark)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color:
                              i <= currentStep
                                ? "var(--clr-bark)"
                                : "var(--clr-muted)",
                            fontWeight: 700,
                            fontSize: "0.875rem",
                            boxShadow:
                              i <= currentStep
                                ? "0 2px 8px rgba(232,160,32,0.3)"
                                : "none",
                          }}
                        >
                          {i < currentStep ? "✓" : i + 1}
                        </div>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            textTransform: "capitalize",
                            color:
                              i <= currentStep
                                ? "var(--clr-bark)"
                                : "var(--clr-muted)",
                          }}
                        >
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Items ── */}
              <div
                className="card"
                style={{
                  padding: "1.25rem 1rem",
                  marginBottom: "1.25rem",
                  borderRadius: "1rem",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  🛍️ Items Ordered
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {(order.order_items as any[]).map((item: any) => (
                    <div
                      key={item.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "60px 1fr",
                        gap: "0.75rem",
                        alignItems: "center",
                        padding: "0.75rem",
                        background: "var(--clr-cream)",
                        borderRadius: "0.875rem",
                        border: "1px solid var(--clr-cream-dark)",
                      }}
                    >
                      {/* Image */}
                      <div
                        style={{
                          position: "relative",
                          width: "60px",
                          height: "60px",
                          borderRadius: "0.625rem",
                          overflow: "hidden",
                          background: "var(--clr-cream-dark)",
                          flexShrink: 0,
                        }}
                        className="no-print"
                      >
                        {item.products?.image_url ? (
                          <Image
                            src={item.products.image_url}
                            alt={item.products.name}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.5rem",
                            }}
                          >
                            🌶
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "0.5rem",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              color: "var(--clr-bark)",
                              lineHeight: 1.3,
                            }}
                          >
                            {item.products?.name ?? "Product"}
                          </span>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "0.875rem",
                              flexShrink: 0,
                            }}
                          >
                            {formatNaira(item.unit_price * item.quantity)}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "0.3rem",
                            fontSize: "0.8rem",
                            color: "var(--clr-muted)",
                          }}
                        >
                          <span>
                            {formatNaira(item.unit_price)} × {item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "1rem",
                    paddingTop: "0.875rem",
                    borderTop: "2px solid var(--clr-cream-dark)",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                    Total
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.35rem",
                      fontWeight: 700,
                      color: "var(--clr-saffron-dark)",
                    }}
                  >
                    {formatNaira(order.total_amount)}
                  </span>
                </div>
              </div>

              {/* ── Order details ── */}
              <div
                className="card"
                style={{ padding: "1.25rem 1rem", borderRadius: "1rem" }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  📋 Order Details
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.625rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {[
                    {
                      label: "💳 Payment",
                      value:
                        order.payment_method === "bank_transfer"
                          ? "🏦 Bank Transfer"
                          : "💵 Cash on Delivery",
                    },
                    { label: "📍 Delivery", value: order.delivery_address },
                    {
                      label: "👤 Name",
                      value: (order.customers as any)?.full_name,
                    },
                    {
                      label: "📞 Phone",
                      value: (order.customers as any)?.phone,
                    },
                  ]
                    .filter((r) => r.value)
                    .map((row) => (
                      <div
                        key={row.label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "1rem",
                          paddingBottom: "0.625rem",
                          borderBottom: "1px solid var(--clr-cream-dark)",
                        }}
                      >
                        <span
                          style={{ color: "var(--clr-muted)", flexShrink: 0 }}
                        >
                          {row.label}
                        </span>
                        <span style={{ textAlign: "right", fontWeight: 500 }}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Print footer */}
                <div
                  className="print-only"
                  style={{
                    marginTop: "2rem",
                    textAlign: "center",
                    fontSize: "0.8rem",
                    color: "#666",
                    display: "none",
                  }}
                >
                  <hr style={{ margin: "1rem 0" }} />
                  <p style={{ fontWeight: 700 }}>KMA Spices & Herbs</p>
                  <p>Thank you for your order!</p>
                  <p>📞 +234 701 618 6356 | ✉️ kmafoods22@gmail.com</p>
                </div>
              </div>

              {/* ── Bottom actions ── */}
              <div
                className="no-print"
                style={{
                  marginTop: "1.25rem",
                  display: "flex",
                  gap: "0.625rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <PrintReceiptButton />
                <Link href="/account/orders" className="btn btn-outline">
                  All Orders
                </Link>
                <Link href="/" className="btn btn-ghost">
                  Shop More
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 480px) {
          .container { padding-left: 0.875rem !important; padding-right: 0.875rem !important; }
        }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          nav, footer { display: none !important; }
          body, main { background: white !important; }
          .card { box-shadow: none !important; border: 1px solid #ddd !important; }
        }
      `}</style>
    </>
  );
}
