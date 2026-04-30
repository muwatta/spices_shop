export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
  const progressWidth =
    currentStep >= 0 && statusSteps.length > 1
      ? (currentStep / (statusSteps.length - 1)) * 100
      : 0;
  const displayId =
    order?.transaction_id ?? order?.id.slice(0, 8).toUpperCase();
  const isSuccess = !!success;

  return (
    <>
      <main style={{ background: "var(--clr-cream)", minHeight: "70vh" }}>
        <div className="container" style={{ padding: "2rem var(--space-md)" }}>
          {orderNotFound ? (
            <div
              className="card"
              style={{ padding: "2rem", textAlign: "center" }}
            >
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  marginBottom: "1rem",
                }}
              >
                Order not found
              </h1>
              <p style={{ color: "var(--clr-muted)", marginBottom: "1.5rem" }}>
                We couldn't locate that order. Please return to your orders list
                and try again.
              </p>
              <Link href="/account/orders" className="btn btn-primary">
                Back to Orders
              </Link>
            </div>
          ) : (
            <div style={{ maxWidth: "780px", margin: "0 auto" }}>
              {/* ── Success confirmation banner ── */}
              {isSuccess && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #D1FAE5, #A7F3D0)",
                    border: "1px solid #6EE7B7",
                    borderRadius: "1.25rem",
                    padding: "2rem",
                    marginBottom: "1.5rem",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>
                    🎉
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.5rem",
                      color: "#065F46",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Order Placed Successfully!
                  </h2>
                  <p style={{ color: "#047857", marginBottom: "0.5rem" }}>
                    Thank you for your order. We'll confirm it shortly and reach
                    out via WhatsApp or phone.
                  </p>
                  <p
                    style={{
                      color: "#065F46",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                    }}
                  >
                    Order #{displayId}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      justifyContent: "center",
                      marginTop: "1.25rem",
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

              {/* ── Printable receipt area ── */}
              <div id="print-receipt">
                {/* Print-only header */}
                <div
                  className="print-only"
                  style={{
                    textAlign: "center",
                    marginBottom: "1.5rem",
                    display: "none",
                  }}
                >
                  <h1
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.75rem",
                    }}
                  >
                    KMA Spices & Herbs
                  </h1>
                  <p style={{ color: "#666", fontSize: "0.875rem" }}>
                    Order Receipt
                  </p>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    Order #{displayId}
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "#666" }}>
                    {new Date(order.created_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <hr style={{ margin: "1rem 0" }} />
                </div>

                {/* Header with status */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <Link
                      href="/account/orders"
                      style={{
                        color: "var(--clr-saffron-dark)",
                        fontSize: "0.875rem",
                      }}
                      className="no-print"
                    >
                      ← My Orders
                    </Link>
                    <h1
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(1.4rem, 4vw, 1.75rem)",
                        marginTop: "0.5rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Transaction #{displayId}
                    </h1>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--clr-muted)",
                        fontSize: "0.85rem",
                      }}
                    >
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      className={`badge badge-${order.status}`}
                      style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                    {!isSuccess && <PrintReceiptButton className="no-print" />}
                  </div>
                </div>

                {/* Progress tracker */}
                {order.status !== "cancelled" && (
                  <div
                    className="card no-print"
                    style={{
                      padding: "1.5rem",
                      marginBottom: "1.5rem",
                      borderRadius: "1.25rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "18px",
                          left: "10%",
                          right: "10%",
                          height: "4px",
                          background: "var(--clr-cream-dark)",
                          borderRadius: "2px",
                          zIndex: 0,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "18px",
                          left: "10%",
                          width: `${progressWidth * 0.8}%`,
                          height: "4px",
                          background: "var(--clr-saffron)",
                          borderRadius: "2px",
                          zIndex: 1,
                          transition: "width 0.5s ease",
                        }}
                      />
                      {statusSteps.map((step, i) => (
                        <div
                          key={step}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "0.5rem",
                            position: "relative",
                            zIndex: 2,
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
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
                              fontSize: "1rem",
                              transition: "all 0.2s ease",
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
                              fontSize: "0.75rem",
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

                {/* Order items */}
                <div
                  className="card"
                  style={{
                    padding: "1.5rem",
                    marginBottom: "1.5rem",
                    borderRadius: "1.25rem",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    🛍️ Items Ordered
                  </h2>
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {(order.order_items as any[]).map((item: any) => (
                      <div
                        key={item.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "72px 1fr",
                          gap: "1rem",
                          background: "white",
                          borderRadius: "1rem",
                          padding: "0.75rem",
                          border: "1px solid var(--clr-cream-dark)",
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            width: "72px",
                            height: "72px",
                            borderRadius: "0.75rem",
                            overflow: "hidden",
                            background: "var(--clr-cream-dark)",
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
                                fontSize: "2rem",
                              }}
                            >
                              🌶
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: "0.5rem",
                              flexWrap: "wrap",
                            }}
                          >
                            <strong
                              style={{
                                fontSize: "0.9375rem",
                                color: "var(--clr-bark)",
                              }}
                            >
                              {item.products?.name ?? "Product"}
                            </strong>
                            <div style={{ textAlign: "right" }}>
                              <span
                                style={{
                                  fontWeight: 700,
                                  fontSize: "0.875rem",
                                }}
                              >
                                {formatNaira(item.unit_price)}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  color: "var(--clr-muted)",
                                  marginLeft: "0.25rem",
                                }}
                              >
                                × {item.quantity}
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              marginTop: "0.5rem",
                              borderTop: "1px dashed var(--clr-cream-dark)",
                              paddingTop: "0.5rem",
                              textAlign: "right",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.8rem",
                                color: "var(--clr-muted)",
                              }}
                            >
                              Subtotal:{" "}
                            </span>
                            <strong>
                              {formatNaira(item.unit_price * item.quantity)}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      marginTop: "1.5rem",
                      paddingTop: "1rem",
                      borderTop: "2px solid var(--clr-cream-dark)",
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "1rem",
                    }}
                  >
                    <span style={{ fontSize: "1rem", fontWeight: 600 }}>
                      Total
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.4rem",
                        fontWeight: 700,
                        color: "var(--clr-saffron-dark)",
                      }}
                    >
                      {formatNaira(order.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Order meta */}
                <div
                  className="card"
                  style={{ padding: "1.5rem", borderRadius: "1.25rem" }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    📋 Order Details
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    {[
                      {
                        label: "📅 Date",
                        value: new Date(order.created_at).toLocaleDateString(
                          "en-NG",
                          { day: "numeric", month: "long", year: "numeric" },
                        ),
                      },
                      {
                        label: "💳 Payment",
                        value:
                          order.payment_method === "bank_transfer"
                            ? "🏦 Bank Transfer"
                            : "💵 Cash on Delivery",
                      },
                      { label: "📍 Delivery", value: order.delivery_address },
                      {
                        label: "👤 Customer",
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
                            borderBottom: "1px solid var(--clr-cream-dark)",
                            paddingBottom: "0.625rem",
                            gap: "1rem",
                          }}
                        >
                          <span
                            style={{ color: "var(--clr-muted)", flexShrink: 0 }}
                          >
                            {row.label}
                          </span>
                          <span style={{ textAlign: "right" }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Print-only footer */}
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
                    <p>Thank you for shopping with KMA Spices & Herbs!</p>
                    <p>
                      For enquiries: +234 701 618 6356 | kmafoods22@gmail.com
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom actions */}
              <div
                className="no-print"
                style={{
                  marginTop: "1.5rem",
                  display: "flex",
                  gap: "0.75rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <PrintReceiptButton />
                <Link href="/account/orders" className="btn btn-outline">
                  View All Orders
                </Link>
                <Link href="/" className="btn btn-ghost">
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          nav, footer { display: none !important; }
          body { background: white !important; }
          .card { box-shadow: none !important; border: 1px solid #ddd !important; }
        }
      `}</style>
    </>
  );
}
