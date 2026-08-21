"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

const promos = [
  "Pay on delivery",
  "100% natural",
];

const HERO_SLIDES = [
  { src: "/images/mixed_spices_1.jpg", alt: "KMA mixed spices collection" },
  { src: "/images/cardamom.jpg", alt: "Premium cardamom spices" },
  { src: "/images/curry_mix.png", alt: "KMA curry blend mix" },
  { src: "/images/ginger_powder.jpg", alt: "Fresh ginger powder" },
  { src: "/images/tumeric.png", alt: "Golden turmeric powder" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const slideVariants = {
  enter: { opacity: 0, scale: 1.08 },
  center: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function HeroSection({ productCount }: { productCount: number }) {
  const [current, setCurrent] = useState(0);
  const [promoCurrent, setPromoCurrent] = useState(0);
  const [statCurrent, setStatCurrent] = useState(0);

  const stats = [
    { num: String(productCount), label: "Products" },
    { num: "100%", label: "Natural" },
    { num: "24hr", label: "Delivery" },
  ];

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, [next]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromoCurrent((prev) => (prev + 1) % promos.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setStatCurrent((prev) => (prev + 1) % stats.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [stats.length]);

  return (
    <>
      <motion.div
        className="promo-strip"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container promo-strip__inner">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={promos[promoCurrent]}
              className="promo-strip__item"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {promos[promoCurrent]}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>

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
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={stats[statCurrent].label}
                  className="home-hero__stat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <span className="home-hero__stat-num">{stats[statCurrent].num}</span>
                  <span className="home-hero__stat-label">{stats[statCurrent].label}</span>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.div
            className="home-hero__image"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <div className="home-hero__image-glow" />
            <div className="home-hero__carousel">
              <AnimatePresence mode="wait">
                <motion.img
                  key={current}
                  src={HERO_SLIDES[current].src}
                  alt={HERO_SLIDES[current].alt}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="home-hero__carousel-img"
                />
              </AnimatePresence>
            </div>

            <div className="home-hero__dots">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`home-hero__dot ${i === current ? "home-hero__dot--active" : ""}`}
                  onClick={() => setCurrent(i)}
                  aria-label={`View slide ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
