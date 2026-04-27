export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface Props {
  params: { id: string };
  searchParams: { success?: string };
}

export default async function OrderDetailPage({ params, searchParams }: Props) {
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
    .eq("id", params.id)
    .eq("customer_id", user.id)
    .single();

  const statusSteps = ["pending", "confirmed", "delivered"];
  const orderNotFound = !order || error;
  const currentStep = order ? statusSteps.indexOf(order.status) : -1;
  const progressWidth = Math.max(
    0,
    (currentStep / (statusSteps.length - 1)) * 100,
  );

  const displayId = order?.transaction_id
    ? order.transaction_id
    : order?.id.slice(0, 8).toUpperCase();

  return (
    <>
      <Navbar />
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
              {/* Success banner */}
              {searchParams.success && (
                <div
                  className="alert alert-success fade-in"
                  style={{ marginBottom: "1.5rem", borderRadius: "1rem" }}
                >
                  🎉 <strong>Order placed successfully!</strong> We'll confirm
                  it shortly.
                </div>
              )}

              {/* Header with status */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "1rem",
                  marginBottom: "2rem",
                }}
              >
                <div>
                  <Link
                    href="/account/orders"
                    style={{
                      color: "var(--clr-saffron-dark)",
                      fontSize: "0.875rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    ← My Orders
                  </Link>
                  <h1
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(1.5rem, 5vw, 2rem)",
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
                <div>
                  <span
                    className={`badge badge-${order.status}`}
                    style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Progress tracker */}
              {order.status !== "cancelled" && (
                <div
                  className="card"
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
                    {/* Background bar */}
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
                    {/* Foreground bar */}
                    <div
                      style={{
                        position: "absolute",
                        top: "18px",
                        left: "10%",
                        width: `calc(${progressWidth}% - ${progressWidth === 0 ? 0 : (progressWidth / 100) * 10}%)`,
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
                    fontSize: "1.25rem",
                    marginBottom: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
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
                        gridTemplateColumns: "80px 1fr",
                        gap: "1rem",
                        background: "white",
                        borderRadius: "1rem",
                        padding: "0.75rem",
                        border: "1px solid var(--clr-cream-dark)",
                        transition: "box-shadow 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: "80px",
                          height: "80px",
                          borderRadius: "0.75rem",
                          overflow: "hidden",
                          background: "var(--clr-cream-dark)",
                        }}
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
                        <div>
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
                                fontSize: "1rem",
                                color: "var(--clr-bark)",
                              }}
                            >
                              {item.products?.name ?? "Product"}
                            </strong>
                            <div style={{ textAlign: "right" }}>
                              <span
                                style={{ fontWeight: 700, fontSize: "0.9rem" }}
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
                          {item.products?.description && (
                            <p
                              style={{
                                margin: "0.25rem 0 0",
                                color: "var(--clr-muted)",
                                fontSize: "0.8rem",
                                lineHeight: 1.4,
                              }}
                            >
                              {item.products.description.length > 80
                                ? `${item.products.description.slice(0, 80)}…`
                                : item.products.description}
                            </p>
                          )}
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
                    flexWrap: "wrap",
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
                    fontSize: "1.25rem",
                    marginBottom: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  📋 Order Details
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: "1px solid var(--clr-cream-dark)",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    <span style={{ color: "var(--clr-muted)" }}>📅 Date</span>
                    <span>
                      {new Date(order.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: "1px solid var(--clr-cream-dark)",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    <span style={{ color: "var(--clr-muted)" }}>
                      💳 Payment
                    </span>
                    <span>
                      {order.payment_method === "bank_transfer"
                        ? "🏦 Bank Transfer"
                        : "💵 Cash on Delivery"}
                    </span>
                  </div>
                  {order.delivery_address && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px solid var(--clr-cream-dark)",
                        paddingBottom: "0.5rem",
                        alignItems: "flex-start",
                      }}
                    >
                      <span style={{ color: "var(--clr-muted)" }}>
                        📍 Delivery
                      </span>
                      <span style={{ textAlign: "right", maxWidth: "60%" }}>
                        {order.delivery_address}
                      </span>
                    </div>
                  )}
                  {order.payment_proof_url && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px solid var(--clr-cream-dark)",
                        paddingBottom: "0.5rem",
                      }}
                    >
                      <span style={{ color: "var(--clr-muted)" }}>
                        📎 Payment Proof
                      </span>
                      <span
                        style={{ color: "var(--clr-success)", fontWeight: 600 }}
                      >
                        ✓ Uploaded
                      </span>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    marginTop: "1rem",
                    textAlign: "center",
                    fontSize: "0.75rem",
                    color: "var(--clr-muted)",
                  }}
                >
                  Need help?{" "}
                  <Link
                    href="/contact"
                    style={{
                      color: "var(--clr-saffron-dark)",
                      textDecoration: "underline",
                    }}
                  >
                    Contact support
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
