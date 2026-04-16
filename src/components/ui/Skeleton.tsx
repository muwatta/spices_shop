"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";

export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      className={`skeleton ${className}`}
      style={style}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.9, 0.5] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
