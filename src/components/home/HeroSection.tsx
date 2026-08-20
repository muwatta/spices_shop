"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const promos = [
  "Free delivery above \u20A615,000",
  "Pay on delivery",
  "100% natural",
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function HeroSection() {
  return (
    <>
      {/* Promo strip */}
      <motion.div
        className="promo-strip"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container promo-strip__inner">
          {promos.map((text) => (
            <span key={text} className="promo-strip__item">{text}</span>
          ))}
        </div>
      </motion.div>

      {/* Hero */}
      <section className="home-hero">
        <div className="container home-hero__grid">
          <div className="home-hero__copy">
            <motion.span
              className="home-hero__badge"
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              KMA Spices &amp; Herbs
            </motion.span>

            <motion.h1
              className="home-hero__title"
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              Premium{" "}
              <span className="home-hero__title-accent">Nigerian</span>{" "}
              Spices
            </motion.h1>

            <motion.p
              className="home-hero__sub"
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              100% natural. Freshly packed. Delivered to your doorstep across Nigeria.
            </motion.p>

            <motion.div
              className="home-hero__actions"
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <Link href="/shop" className="btn btn-primary btn-lg">
                Shop Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
              <Link href="/shop?category=spices" className="btn btn-outline-light btn-lg">
                Browse Spices
              </Link>
            </motion.div>

            <motion.div
              className="home-hero__stats"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              {[
                { num: "46+", label: "Products" },
                { num: "100%", label: "Natural" },
                { num: "24hr", label: "Delivery" },
              ].map((stat, i) => (
                <motion.div key={stat.label} className="home-hero__stat" variants={fadeUp} custom={i}>
                  <span className="home-hero__stat-num">{stat.num}</span>
                  <span className="home-hero__stat-label">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="home-hero__image"
            initial="hidden"
            animate="visible"
            variants={scaleIn}
          >
            <div className="home-hero__image-glow" />
            <img src="/images/mixed_spices_1.jpg" alt="KMA spice collection" />
          </motion.div>
        </div>
      </section>
    </>
  );
}
