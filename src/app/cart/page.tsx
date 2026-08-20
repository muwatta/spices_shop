"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useCartStore } from "@/lib/store/cart";
import { createClient } from "@/lib/supabase/client";
import {
  formatNaira,
  buildWhatsAppUrl,
  buildOrderWhatsAppMessage,
  getDeliveryInfo,
  generateTransactionId,
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
  const { items, addItem, removeItem, updateQuantity, clearCart, syncStock } = useCartStore();
  const supabase = createClient();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const [undoItem, setUndoItem] = useState<{ productId: string; quantity: number } | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [whatsappOrderRef, setWhatsappOrderRef] = useState("");

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
        syncStock(
          Object.fromEntries(data.map((p) => [p.id, p.stock]))
        );
      }
      setLoading(false);
    }
    fetchProducts();
  }, [items]);

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

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const delivery = getDeliveryInfo(totalPrice);
  const discount = discountApplied ? Math.round(totalPrice * 0.1) : 0;
  const grandTotal = totalPrice + delivery.fee - discount;

  const handleRemove = useCallback(
    (productId: string) => {
      const item = items.find((i) => i.productId === productId);
      if (!item) return;
      removeItem(productId);
      setUndoItem({ productId, quantity: item.quantity });
      if (undoTimer.current) clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => setUndoItem(null), 5000);
    },
    [items, removeItem],
  );

  const handleUndo = useCallback(() => {
    if (!undoItem) return;
    addItem(undoItem.productId, undoItem.quantity);
    setUndoItem(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }, [undoItem, addItem]);

  const handleApplyDiscount = useCallback(() => {
    setDiscountError("");
    if (!discountCode.trim()) {
      setDiscountError("Please enter a code");
      return;
    }
    if (discountCode.trim().toUpperCase() === "KMA10") {
      setDiscountApplied(true);
      setDiscountError("");
    } else {
      setDiscountError("Invalid discount code");
      setDiscountApplied(false);
    }
  }, [discountCode]);

  function handleWhatsAppOrder() {
    if (!phone) {
      window.alert("WhatsApp ordering is not available right now. Please contact support.");
      return;
    }
    if (cartItems.length === 0) {
      window.alert("Your cart is empty.");
      return;
    }
    if (cartItems.some(({ product }) => product.stock === 0)) {
      window.alert("Remove out-of-stock items before ordering via WhatsApp.");
      return;
    }
    setWhatsappOrderRef(generateTransactionId().slice(-10));
    setWhatsappModalOpen(true);
  }

  function confirmWhatsAppOrder() {
    if (!phone || !whatsappOrderRef) return;
    const message = buildOrderWhatsAppMessage(
      cartItems.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      })),
      grandTotal,
    ) + `\n\nOrder reference: KMA-${whatsappOrderRef}`;
    window.open(buildWhatsAppUrl(phone, message), "_blank");
    setWhatsappModalOpen(false);
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main>
          <div className="container" style={{ padding: "4rem var(--space-md)", minHeight: "60vh" }}>
            <Skeleton style={{ width: "200px", height: "28px", marginBottom: "2rem" }} />
            <div className="cart-layout">
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="card cart-item">
                    <Skeleton style={{ width: "96px", height: "96px", borderRadius: "var(--radius-md)" }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <Skeleton style={{ width: "70%", height: "18px" }} />
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
          <div className="container" style={{ padding: "4rem var(--space-md)", minHeight: "60vh" }}>
            <EmptyState
              icon={
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              }
              title="Your cart is empty"
              description="Browse our collection of premium spices and add your favorites."
              action={<Link href="/shop" className="btn btn-primary btn-lg">Start Shopping</Link>}
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
      <main>
        <div className="container store-page-shell">
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 4vw, 2rem)", marginBottom: "2rem" }}>
            Shopping Cart
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 400, color: "var(--clr-muted)", marginLeft: "0.75rem" }}>
              ({totalQuantity} {totalQuantity === 1 ? "item" : "items"})
            </span>
          </h1>

          <div className="cart-progress" role="status">
            <div className="cart-progress__copy">
              <strong>{delivery.free ? "Free delivery unlocked" : `Add ${formatNaira(delivery.remaining)} for free delivery`}</strong>
              <span>{delivery.free ? "Your order qualifies for free delivery." : "Keep shopping to reach the free delivery threshold."}</span>
            </div>
            <div className="cart-progress__track" aria-hidden="true">
              <span style={{ width: `${Math.min(100, (totalPrice / 15000) * 100)}%` }} />
            </div>
          </div>

          <div className="cart-layout">
            {/* Cart items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {cartItems.map(({ product, quantity }) => {
                const itemOOS = product.stock !== null && product.stock === 0;
                const itemLowStock = product.stock !== null && product.stock > 0 && product.stock < quantity;

                return (
                <div key={product.id} className={`card cart-item ${itemOOS ? "cart-item--oos" : ""}`}>
                  <Link href={`/product/${product.id}`} className="cart-item__image">
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
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--clr-muted)" strokeWidth="1.5" aria-hidden="true">
                          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/product/${product.id}`} className="cart-item__name">
                      {product.name}
                    </Link>
                    <p className="cart-item__price">{formatNaira(product.price * quantity)}</p>
                    <p className="cart-item__unit">{formatNaira(product.price)} each</p>
                    {itemOOS && (
                      <p className="cart-item__flag cart-item__flag--oos" role="alert">
                        This item is out of stock
                      </p>
                    )}
                    {!itemOOS && itemLowStock && (
                      <p className="cart-item__flag cart-item__flag--low">
                        Only {product.stock} in stock
                      </p>
                    )}
                  </div>
                  <div className="cart-item__actions">
                    <QuantitySelector
                      quantity={quantity}
                      onQuantityChange={(q) => updateQuantity(product.id, q)}
                      min={1}
                      max={product.stock || 99}
                    />
                    <button onClick={() => handleRemove(product.id)} className="cart-item__remove">
                      Remove
                    </button>
                  </div>
                </div>
                );
              })}

              {/* Undo remove toast */}
              {undoItem && (
                <div className="cart-undo-toast" role="status" aria-live="polite">
                  <span>Item removed</span>
                  <button className="cart-undo-toast__action" onClick={handleUndo}>
                    Undo
                  </button>
                </div>
              )}
            </div>

            {/* Order summary */}
            <div className="card order-summary" style={{ alignSelf: "start", position: "sticky", top: "calc(var(--nav-height) + 1.5rem)" }}>
              <h2 className="order-summary__title">Order Summary</h2>
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="order-summary__line">
                  <span className="order-summary__line-label">
                    {product.name} &times; {quantity}
                  </span>
                  <span>{formatNaira(product.price * quantity)}</span>
                </div>
              ))}
              <div className="order-summary__discount">
                <div className="order-summary__discount-row">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => { setDiscountCode(e.target.value); setDiscountError(""); }}
                    placeholder="Discount code"
                    className="order-summary__discount-input"
                    disabled={discountApplied}
                    aria-label="Discount code"
                  />
                  {discountApplied ? (
                    <button className="order-summary__discount-btn order-summary__discount-btn--applied" onClick={() => { setDiscountApplied(false); setDiscountCode(""); }} type="button">
                      Remove
                    </button>
                  ) : (
                    <button className="order-summary__discount-btn" onClick={handleApplyDiscount} type="button">
                      Apply
                    </button>
                  )}
                </div>
                {discountError && <p className="order-summary__discount-error">{discountError}</p>}
                {discountApplied && <p className="order-summary__discount-success">10% discount applied</p>}
              </div>
              <div className="order-summary__line">
                <span className="order-summary__line-label">Delivery</span>
                <span>
                  {delivery.free ? (
                    <span style={{ color: "var(--clr-success)", fontWeight: 600 }}>Free</span>
                  ) : (
                    formatNaira(delivery.fee)
                  )}
                </span>
              </div>
              {discountApplied && (
                <div className="order-summary__line order-summary__line--discount">
                  <span className="order-summary__line-label">Discount (10%)</span>
                  <span>-{formatNaira(discount)}</span>
                </div>
              )}
              <div className="divider" />
              {!delivery.free && delivery.remaining > 0 && (
                <p style={{ fontSize: "0.8rem", color: "var(--clr-muted)", marginBottom: "0.75rem" }}>
                  Add {formatNaira(delivery.remaining)} more for free delivery
                </p>
              )}
              <div className="order-summary__total" style={{ marginBottom: "1.5rem" }}>
                <span>Total</span>
                <span className="order-summary__total-value">
                  {formatNaira(grandTotal)}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <Link href="/checkout" className="btn btn-primary btn-lg w-full" style={{ textAlign: "center" }}>
                  Proceed to Checkout
                </Link>
                <Link href="/shop" className="btn btn-outline btn-lg w-full" style={{ textAlign: "center" }}>
                  Continue Shopping
                </Link>
                {phone && (
                  <button className="btn btn-lg whatsapp-btn w-full" onClick={handleWhatsAppOrder}>
                    Order via WhatsApp
                  </button>
                )}
                <button onClick={clearCart} className="btn btn-ghost btn-sm w-full" style={{ justifyContent: "center", marginTop: "0.25rem" }}>
                  Clear cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      {whatsappModalOpen && (
        <div className="modal-overlay" role="presentation" onClick={() => setWhatsappModalOpen(false)}>
          <section
            className="modal-content whatsapp-order-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="whatsapp-order-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="whatsapp-order-modal__header">
              <div>
                <span className="whatsapp-order-modal__eyebrow">WhatsApp checkout</span>
                <h2 id="whatsapp-order-title">Review your order</h2>
              </div>
              <button type="button" className="whatsapp-order-modal__close" onClick={() => setWhatsappModalOpen(false)} aria-label="Close order review">&times;</button>
            </div>

            <div className="whatsapp-order-modal__reference">
              <span>Order reference</span>
              <strong>KMA-{whatsappOrderRef}</strong>
            </div>

            <div className="whatsapp-order-modal__items">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="whatsapp-order-modal__item">
                  <span>{product.name} <small>&times; {quantity}</small></span>
                  <strong>{formatNaira(product.price * quantity)}</strong>
                </div>
              ))}
            </div>

            <div className="whatsapp-order-modal__totals">
              <div><span>Subtotal</span><strong>{formatNaira(totalPrice)}</strong></div>
              <div><span>Delivery</span><strong>{delivery.free ? "Free" : formatNaira(delivery.fee)}</strong></div>
              {discountApplied && <div><span>Discount</span><strong>-{formatNaira(discount)}</strong></div>}
              <div className="whatsapp-order-modal__total"><span>Total</span><strong>{formatNaira(grandTotal)}</strong></div>
            </div>

            <p className="whatsapp-order-modal__note">WhatsApp will open with these order details ready to send. Keep your reference for follow-up.</p>
            <div className="whatsapp-order-modal__actions">
              <button type="button" className="btn btn-ghost" onClick={() => setWhatsappModalOpen(false)}>Go back</button>
              <button type="button" className="btn whatsapp-btn" onClick={confirmWhatsAppOrder}>Continue to WhatsApp</button>
            </div>
          </section>
        </div>
      )}
      <Footer />
    </>
  );
}
