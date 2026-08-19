"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useMiniCartStore } from "@/lib/store/miniCart";
import { useCartStore } from "@/lib/store/cart";
import { formatNaira } from "@/lib/utils";

const AUTO_CLOSE_MS = 8000;
const SWIPE_THRESHOLD = 80;

export default function MiniCartDrawer() {
  const { isOpen, product, quantity, close } = useMiniCartStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [touchY, setTouchY] = useState<number | null>(null);
  const [swipeDelta, setSwipeDelta] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(close, AUTO_CLOSE_MS);
    return () => clearTimeout(timer);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        const closeBtn = drawerRef.current?.querySelector<HTMLButtonElement>(
          ".mini-cart-drawer__close",
        );
        closeBtn?.focus();
      });
    } else {
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [close],
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchY(e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchY === null) return;
    const delta = e.touches[0].clientY - touchY;
    if (delta > 0) {
      setSwipeDelta(delta);
    }
  }, [touchY]);

  const handleTouchEnd = useCallback(() => {
    if (swipeDelta > SWIPE_THRESHOLD) {
      close();
    }
    setTouchY(null);
    setSwipeDelta(0);
  }, [swipeDelta, close]);

  if (!isOpen || !product) return null;

  return (
    <div
      className="mini-cart-overlay"
      onClick={close}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Added to cart"
    >
      <div
        ref={drawerRef}
        className="mini-cart-drawer"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: swipeDelta > 0 ? `translateY(${swipeDelta * 0.5}px)` : undefined,
          transition: touchY !== null ? "none" : undefined,
        }}
      >
        <div className="mini-cart-drawer__swipe-handle" aria-hidden="true" />

        <div className="mini-cart-drawer__header">
          <div className="mini-cart-drawer__title">
            <ShoppingBag size={20} />
            <span>Added to Cart</span>
          </div>
          <button
            className="mini-cart-drawer__close"
            onClick={close}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mini-cart-drawer__body">
          <div className="mini-cart-drawer__item">
            <div className="mini-cart-drawer__image">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="80px"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="mini-cart-drawer__image-placeholder">
                  <ShoppingBag size={24} />
                </div>
              )}
            </div>
            <div className="mini-cart-drawer__details">
              <div className="mini-cart-drawer__name">{product.name}</div>
              <div className="mini-cart-drawer__meta">
                Qty: {quantity} &middot; {formatNaira(product.price * quantity)}
              </div>
            </div>
          </div>

          <div className="mini-cart-drawer__total">
            <span>{totalItems} item{totalItems !== 1 ? "s" : ""} in cart</span>
          </div>
        </div>

        <div className="mini-cart-drawer__footer">
          <Link
            href="/cart"
            className="btn btn-primary"
            onClick={close}
          >
            View Cart
            <ArrowRight size={16} />
          </Link>
          <button className="btn btn-outline" onClick={close}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
