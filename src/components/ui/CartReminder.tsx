"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function CartReminder() {
  const [showReminder, setShowReminder] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    const resetTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(
        () => {
          // Only show if cart has items and user not already on cart page
          const cart = localStorage.getItem("spice-cart");
          const cartItems = cart
            ? JSON.parse(cart).state?.items?.length || 0
            : 0;
          if (cartItems > 0 && !window.location.pathname.includes("/cart")) {
            setShowReminder(true);
          }
        },
        5 * 60 * 1000,
      ); // 5 minutes
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);

  return (
    <AnimatePresence>
      {showReminder && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
            background: "var(--clr-bark)",
            color: "var(--clr-cream)",
            padding: "1rem 1.5rem",
            borderRadius: "1rem",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            maxWidth: "320px",
            cursor: "pointer",
          }}
          onClick={() => {
            router.push("/cart");
            setShowReminder(false);
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <span style={{ fontSize: "2rem" }}>🛒</span>
            <div>
              <strong style={{ color: "var(--clr-saffron)" }}>
                Still thinking?
              </strong>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem" }}>
                Your cart is waiting! Spices like ginger boost immunity –
                complete your order now.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
