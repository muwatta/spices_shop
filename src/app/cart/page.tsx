"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cart";
import { createClient } from "@/lib/supabase/client";
import {
  formatNaira,
  buildWhatsAppUrl,
  buildOrderWhatsAppMessage,
} from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/Skeleton";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  stock: number | null;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, clearCart } =
    useCartStore();
  const supabase = createClient();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  useEffect(() => {
    async function fetchProducts() {
      if (items.length === 0) {
        setProducts({});
        setLoading(false);
        return;
      }
      const productIds = items.map((i) => i.productId);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image_url, stock")
        .in("id", productIds);
      if (!error && data) {
        const productMap: Record<string, Product> = {};
        data.forEach((p) => {
          productMap[p.id] = p;
        });
        setProducts(productMap);
      }
      setLoading(false);
    }
    fetchProducts();
  }, [items]);

  useEffect(() => {
    async function loadOrderHistory() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setHistoryLoaded(true);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total_amount, created_at")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4);

      if (!error && data) {
        setOrderHistory(data);
      }
      setHistoryLoaded(true);
    }

    loadOrderHistory();
  }, [supabase]);

  const cartItems = items
    .map((item) => ({
      ...item,
      product: products[item.productId],
    }))
    .filter((item) => item.product); // remove items whose product no longer exists

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Waiting for confirmation";
      case "confirmed":
        return "Confirmed and preparing your order";
      case "delivered":
        return "Delivered to your doorstep";
      case "cancelled":
        return "Order was cancelled";
      default:
        return "Order status updated";
    }
  };

  const currentCartActivity = [
    {
      title: "Items in cart",
      description: `${cartItems.length} item${cartItems.length === 1 ? "" : "s"} ready to checkout`,
    },
    {
      title: "Estimated total",
      description: formatNaira(totalPrice),
    },
    {
      title: "Next step",
      description: "Proceed to checkout or order via WhatsApp",
    },
  ];

  function handleWhatsAppOrder() {
    if (!phone) return;
    const message = buildOrderWhatsAppMessage(
      cartItems.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      })),
      totalPrice,
    );
    window.open(buildWhatsAppUrl(phone, message), "_blank");
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main>
          <div
            className="container"
            style={{ padding: "4rem 0", minHeight: "60vh" }}
          >
            <div
              style={{
                display: "grid",
                gap: "1.5rem",
                maxWidth: "720px",
                margin: "0 auto",
              }}
            >
              <Skeleton
                style={{ width: "40%", height: "22px", margin: "0 auto" }}
              />
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                }}
              >
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 1fr",
                      gap: "1rem",
                      alignItems: "center",
                      padding: "1rem",
                      background: "white",
                      borderRadius: "1rem",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
                    }}
                  >
                    <Skeleton style={{ width: "80px", height: "80px" }} />
                    <div style={{ display: "grid", gap: "0.6rem" }}>
                      <Skeleton style={{ width: "70%", height: "18px" }} />
                      <Skeleton style={{ width: "50%", height: "16px" }} />
                      <Skeleton style={{ width: "40%", height: "16px" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
          <div
            className="container"
            style={{ padding: "2rem var(--space-md)" }}
          >
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                marginBottom: "1rem",
              }}
            >
              Your Cart
            </h1>
            <p style={{ color: "var(--clr-muted)", marginBottom: "2rem" }}>
              Track your current cart activity and recent order progress even
              when your basket is empty.
            </p>

            <div
              className="card"
              style={{
                padding: "1.5rem",
                marginBottom: "2rem",
                display: "grid",
                gap: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "1fr 1fr",
                  alignItems: "stretch",
                }}
              >
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      margin: 0,
                    }}
                  >
                    Current cart activity
                  </h2>
                  {currentCartActivity.map((item) => (
                    <div
                      key={item.title}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                        padding: "0.95rem 1rem",
                        borderRadius: "1rem",
                        background: "rgba(255,255,255,0.92)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          color: "var(--clr-bark)",
                        }}
                      >
                        {item.title}
                      </span>
                      <span
                        style={{
                          color: "var(--clr-muted)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {item.description}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      margin: 0,
                    }}
                  >
                    Recent order history
                  </h2>
                  {historyLoaded ? (
                    orderHistory.length > 0 ? (
                      orderHistory.map((order) => (
                        <div
                          key={order.id}
                          style={{
                            padding: "0.95rem 1rem",
                            borderRadius: "1rem",
                            background: "rgba(255,255,255,0.92)",
                            border: "1px solid rgba(0,0,0,0.06)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "1rem",
                              alignItems: "center",
                            }}
                          >
                            <strong style={{ fontSize: "0.95rem" }}>
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </strong>
                            <span
                              style={{
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                color:
                                  order.status === "delivered"
                                    ? "var(--clr-success)"
                                    : order.status === "cancelled"
                                      ? "var(--clr-chili)"
                                      : "var(--clr-saffron)",
                              }}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p
                            style={{
                              margin: "0.4rem 0 0",
                              color: "var(--clr-muted)",
                              fontSize: "0.9rem",
                            }}
                          >
                            {getOrderStatusLabel(order.status)} •{" "}
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <p
                            style={{
                              margin: "0.5rem 0 0",
                              fontWeight: 700,
                              color: "var(--clr-bark)",
                            }}
                          >
                            {formatNaira(order.total_amount)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          padding: "0.95rem 1rem",
                          borderRadius: "1rem",
                          background: "rgba(255,255,255,0.92)",
                          color: "var(--clr-muted)",
                        }}
                      >
                        No recent orders yet. Your activity will appear here
                        once you place an order.
                      </div>
                    )
                  ) : (
                    <div
                      style={{
                        padding: "0.95rem 1rem",
                        borderRadius: "1rem",
                        background: "rgba(255,255,255,0.92)",
                        color: "var(--clr-muted)",
                      }}
                    >
                      Loading order activity...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "3rem 1rem",
                borderRadius: "1rem",
                background: "rgba(255,255,255,0.98)",
              }}
            >
              <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛒</p>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  marginBottom: "0.75rem",
                }}
              >
                Your cart is empty
              </h2>
              <p style={{ color: "var(--clr-muted)", marginBottom: "1.5rem" }}>
                Add a few spices to get started. Your recent order activity is
                shown above.
              </p>
              <Link href="/" className="btn btn-primary">
                Browse Spices
              </Link>
            </div>
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
              marginBottom: "1rem",
            }}
          >
            Your Cart
          </h1>
          <p style={{ color: "var(--clr-muted)", marginBottom: "2rem" }}>
            Track current cart activity and recent order progress so you always
            know what’s happening.
          </p>

          <div
            className="card"
            style={{
              padding: "1.5rem",
              marginBottom: "2rem",
              display: "grid",
              gap: "1.25rem",
            }}
          >
            <div
              style={{
                display: "grid",
                gap: "1rem",
                gridTemplateColumns: "1fr 1fr",
                alignItems: "stretch",
              }}
            >
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem",
                    margin: 0,
                  }}
                >
                  Current cart activity
                </h2>
                {currentCartActivity.map((item) => (
                  <div
                    key={item.title}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                      padding: "0.95rem 1rem",
                      borderRadius: "1rem",
                      background: "rgba(255,255,255,0.92)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        color: "var(--clr-bark)",
                      }}
                    >
                      {item.title}
                    </span>
                    <span
                      style={{ color: "var(--clr-muted)", fontSize: "0.9rem" }}
                    >
                      {item.description}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gap: "0.75rem" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem",
                    margin: 0,
                  }}
                >
                  Recent order history
                </h2>
                {historyLoaded ? (
                  orderHistory.length > 0 ? (
                    orderHistory.map((order) => (
                      <div
                        key={order.id}
                        style={{
                          padding: "0.95rem 1rem",
                          borderRadius: "1rem",
                          background: "rgba(255,255,255,0.92)",
                          border: "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "1rem",
                            alignItems: "center",
                          }}
                        >
                          <strong style={{ fontSize: "0.95rem" }}>
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </strong>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              color:
                                order.status === "delivered"
                                  ? "var(--clr-success)"
                                  : order.status === "cancelled"
                                    ? "var(--clr-chili)"
                                    : "var(--clr-saffron)",
                            }}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: "0.4rem 0 0",
                            color: "var(--clr-muted)",
                            fontSize: "0.9rem",
                          }}
                        >
                          {getOrderStatusLabel(order.status)} •{" "}
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p
                          style={{
                            margin: "0.5rem 0 0",
                            fontWeight: 700,
                            color: "var(--clr-bark)",
                          }}
                        >
                          {formatNaira(order.total_amount)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        padding: "0.95rem 1rem",
                        borderRadius: "1rem",
                        background: "rgba(255,255,255,0.92)",
                        color: "var(--clr-muted)",
                      }}
                    >
                      No recent orders yet. Your activity will appear here once
                      you place an order.
                    </div>
                  )
                ) : (
                  <div
                    style={{
                      padding: "0.95rem 1rem",
                      borderRadius: "1rem",
                      background: "rgba(255,255,255,0.92)",
                      color: "var(--clr-muted)",
                    }}
                  >
                    Loading order activity...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {cartItems.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="card"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: "1.25rem",
                    alignItems: "center",
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "var(--clr-cream-dark)",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        loading="lazy"
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
                  <div>
                    <Link href={`/product/${product.id}`}>
                      <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>
                        {product.name}
                      </h3>
                    </Link>
                    <p
                      style={{
                        color: "var(--clr-saffron-dark)",
                        fontWeight: 700,
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {formatNaira(product.price * quantity)}
                    </p>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--clr-muted)",
                      }}
                    >
                      {formatNaira(product.price)} each
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "2px solid var(--clr-cream-dark)",
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        style={{
                          padding: "0.3rem 0.75rem",
                          background: "var(--clr-cream-dark)",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        −
                      </button>
                      <span
                        style={{
                          padding: "0.3rem 0.75rem",
                          fontWeight: 600,
                          background: "white",
                          minWidth: "2.5rem",
                          textAlign: "center",
                        }}
                      >
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        style={{
                          padding: "0.3rem 0.75rem",
                          background: "var(--clr-cream-dark)",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--clr-chili)",
                        fontSize: "0.8125rem",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="card"
              style={{ padding: "1.5rem", alignSelf: "start" }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.25rem",
                  marginBottom: "1.25rem",
                }}
              >
                Order Summary
              </h2>
              {cartItems.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
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
                  {formatNaira(totalPrice)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <Link
                  href="/checkout"
                  className="btn btn-primary btn-lg"
                  style={{ textAlign: "center", display: "block" }}
                >
                  Proceed to Checkout
                </Link>
                {phone && (
                  <button
                    className="btn btn-lg whatsapp-btn"
                    onClick={handleWhatsAppOrder}
                  >
                    💬 Order via WhatsApp
                  </button>
                )}
                <button
                  onClick={clearCart}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--clr-muted)",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    textAlign: "center",
                    marginTop: "0.25rem",
                  }}
                >
                  Clear cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
