"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const spices = ["🌶️", "🌿", "🧄", "🥄", "🌰", "🍃", "🫚", "🍛"];

export default function BackgroundAnimations() {
  const [spiceList, setSpiceList] = useState<
    { id: number; x: number; y: number; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    const items = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 15,
    }));
    setSpiceList(items);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {spiceList.map((spice) => (
        <motion.div
          key={spice.id}
          initial={{ x: spice.x, y: spice.y, opacity: 0.15, scale: 0.8 }}
          animate={{
            y: [spice.y, spice.y - 100, spice.y],
            x: [spice.x, spice.x + 50, spice.x - 50, spice.x],
            rotate: [0, 15, -15, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: spice.duration,
            delay: spice.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            fontSize: `${1.5 + Math.random() * 2}rem`,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {spices[spice.id % spices.length]}
        </motion.div>
      ))}
    </div>
  );
}
