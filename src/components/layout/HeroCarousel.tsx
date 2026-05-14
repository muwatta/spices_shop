"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const slides = [
  {
    src: "/images/cardamom.jpg",
    title: "Aromatic Cardamom",
    subtitle: "Bright, floral spice for stews, tea, and sweet treats.",
  },
  {
    src: "/images/ginger_powder.jpg",
    title: "Warm Ginger Powder",
    subtitle: "Earthy spice with a spicy kick for sauces and drinks.",
  },
  {
    src: "/images/tumeric.png",
    title: "Golden Turmeric",
    subtitle: "Deep color and healing warmth for curries and broths.",
  },
  {
    src: "/images/garlic_powder.jpg",
    title: "Savory Garlic Powder",
    subtitle: "Rich umami flavor to elevate soups, marinades, and rubs.",
  },
  {
    src: "/images/curry_mix1.jpg",
    title: "Signature Curry Mix",
    subtitle: "Balanced blend for bold, restaurant-quality meals.",
  },
];

const transition = {
  duration: 0.8,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="hero-carousel">
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[activeIndex].src}
          className="hero-carousel-slide"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={transition}
        >
          <div className="hero-carousel-image">
            <Image
              src={slides[activeIndex].src}
              alt={slides[activeIndex].title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
              priority={activeIndex === 0}
            />
          </div>
          <div className="hero-carousel-caption">
            <span>Featured spice</span>
            <h3>{slides[activeIndex].title}</h3>
            <p>{slides[activeIndex].subtitle}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="hero-carousel-controls">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            className={`carousel-dot ${index === activeIndex ? "active" : ""}`}
            aria-label={`Show ${slide.title}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
