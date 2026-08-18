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
import QuantitySelector from "@/components/ui/QuantitySelector";
import EmptyState from "@/components/ui/EmptyState";
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
    .filter((item) => item.product);

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
    if (!phone) {
      window.alert(
        "WhatsApp ordering is not available right now. Please contact support.",
      );
      return;
    }

    if (cartItems.length === 0) {
      window.alert(
        "Your cart is empty. Add items before ordering via WhatsApp.",
      );
      return;
    }

    const summary = cartItems
      .map((item) => `${item.product.name} x${item.quantity}`)
      .join("\n");

    const confirmation = `You are about to order the following items via WhatsApp:\n\n${summary}\n\nTotal: ${formatNaira(totalPrice)}\n\nContinue to WhatsApp?`;

    if (!window.confirm(confirmation)) {
      return;
    }

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
          <div className="container" style={{ padding: "4rem 0", minHeight: "60vh" }}>
            <div style={{ display: "grid", gap: "1.5rem", maxWidth: "720px", margin: "0 auto" }}>
              <Skeleton style={{ width: "40%", height: "22px", margin: "0 auto" }} />
              <div style={{ display: "grid", gap: "1rem" }}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="card cart-item">
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
          <div className="container" style={{ padding: "2rem var(--space-md)" }}>
            <div className="page-header">
              <h1 className="page-header__title">Your Cart</h1>
              <p className="page-header__subtitle">
                Track your current cart activity and recent order progress even when your basket is empty.
              </p>
            </div>

            <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
              <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", margin: 0 }}>
                    Current cart activity
                  </h2>
                  {currentCartActivity.map((item) => (
                    <div key={item.title} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", padding: "0.95rem 1rem", borderRadius: "1rem", background: "rgba(255,255,255,0.92)" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--clr-bark)" }}>
                        {item.title}
                      </span>
                      <span style={{ color: "var(--clr-muted)", fontSize: "0.9rem" }}>
                        {item.description}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", margin: 0 }}>
                    Recent order history
                  </h2>
                  {historyLoaded ? (
                    orderHistory.length > 0 ? (
                      orderHistory.map((order) => (
                        <div key={order.id} style={{ padding: "0.95rem 1rem", borderRadius: "1rem", background: "rgba(255,255,255,0.92)", border: "1px solid rgba(0,0,0,0.06)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
                            <strong style={{ fontSize: "0.95rem" }}>
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </strong>
                            <span className={`status status--${order.status}`}>
                              {order.status}
                            </span>
                          </div>
                          <p style={{ margin: "0.4rem 0 0", color: "var(--clr-muted)", fontSize: "0.9rem" }}>
                            {getOrderStatusLabel(order.status)} &middot;{" "}
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <p style={{ margin: "0.5rem 0 0", fontWeight: 700, color: "var(--clr-bark)" }}>
                            {formatNaira(order.total_amount)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "0.95rem 1rem", borderRadius: "1rem", background: "rgba(255,255,255,0.92)", color: "var(--clr-muted)" }}>
                        No recent orders yet. Your activity will appear here once you place an order.
                      </div>
                    )
                  ) : (
                    <div style={{ padding: "0.95rem 1rem", borderRadius: "1rem", background: "rgba(255,255,255,0.92)", color: "var(--clr-muted)" }}>
                      Loading order activity...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: "3rem 1rem", textAlign: "center" }}>
              <EmptyState
                icon={
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                }
                title="Your cart is empty"
                description="Add a few spices to get started. Your recent order activity is shown above."
                action={<Link href="/" className="btn btn-primary">Browse Spices</Link>}
              />
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
          <div className="page-header">
            <h1 className="page-header__title">Your Cart</h1>
            <p className="page-header__subtitle">
              Track current cart activity and recent order progress so you always know what&apos;s happening.
            </p>
          </div>

          <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", margin: 0 }}>
                  Current cart activity
                </h2>
                {currentCartActivity.map((item) => (
                  <div key={item.title} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", padding: "0.95rem 1rem", borderRadius: "1rem", background: "rgba(255,255,255,0.92)" }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--clr-bark)" }}>
                      {item.title}
                    </span>
                    <span style={{ color: "var(--clr-muted)", fontSize: "0.9rem" }}>
                      {item.description}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gap: "0.75rem" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", margin: 0 }}>
                  Recent order history
                </h2>
                {historyLoaded ? (
                  orderHistory.length > 0 ? (
                    orderHistory.map((order) => (
                      <div key={order.id} style={{ padding: "0.95rem 1rem", borderRadius: "1rem", background: "rgba(255,255,255,0.92)", border: "1px solid rgba(0,0,0,0.06)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
                          <strong style={{ fontSize: "0.95rem" }}>
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </strong>
                          <span className={`status status--${order.status}`}>
                            {order.status}
                          </span>
                        </div>
                        <p style={{ margin: "0.4rem 0 0", color: "var(--clr-muted)", fontSize: "0.9rem" }}>
                          {getOrderStatusLabel(order.status)} &middot;{" "}
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p style={{ margin: "0.5rem 0 0", fontWeight: 700, color: "var(--clr-bark)" }}>
                          {formatNaira(order.total_amount)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "0.95rem 1rem", borderRadius: "1rem", background: "rgba(255,255,255,0.92)", color: "var(--clr-muted)" }}>
                      No recent orders yet. Your activity will appear here once you place an order.
                    </div>
                  )
                ) : (
                  <div style={{ padding: "0.95rem 1rem", borderRadius: "1rem", background: "rgba(255,255,255,0.92)", color: "var(--clr-muted)" }}>
                    Loading order activity...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="card cart-item">
                  <div className="cart-item__image">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        loading="lazy"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
                          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                          <line x1="9" y1="9" x2="9.01" y2="9" />
                          <line x1="15" y1="9" x2="15.01" y2="9" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <Link href={`/product/${product.id}`} className="cart-item__name">
                      <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>{product.name}</h3>
                    </Link>
                    <p className="cart-item__price">{formatNaira(product.price * quantity)}</p>
                    <p className="cart-item__unit">{formatNaira(product.price)} each</p>
                  </div>
                  <div className="cart-item__actions" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                    <QuantitySelector
                      quantity={quantity}
                      onQuantityChange={(q) => updateQuantity(product.id, q)}
                      min={1}
                      max={product.stock || 99}
                    />
                    <button onClick={() => removeItem(product.id)} className="cart-item__remove">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="card order-summary" style={{ alignSelf: "start" }}>
              <h2 className="order-summary__title">Order Summary</h2>
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="order-summary__line">
                  <span className="order-summary__line-label">
                    {product.name} &times; {quantity}
                  </span>
                  <span>{formatNaira(product.price * quantity)}</span>
                </div>
              ))}
              <div className="divider" />
              <div className="order-summary__total" style={{ marginBottom: "1.5rem" }}>
                <span>Total</span>
                <span className="order-summary__total-value">
                  {formatNaira(totalPrice)}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <Link href="/checkout" className="btn btn-primary btn-lg w-full" style={{ textAlign: "center" }}>
                  Proceed to Checkout
                </Link>
                {phone && (
                  <button className="btn btn-lg whatsapp-btn w-full" onClick={handleWhatsAppOrder}>
                    Order via WhatsApp
                  </button>
                )}
                <button onClick={clearCart} className="btn btn-ghost btn-sm w-full" style={{ justifyContent: "center" }}>
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
