"use client";

import { useState, useEffect } from "react";

const ANNOUNCEMENTS = [
  "Freshly packed spices - Delivered to your doorstep",
  "Free delivery on orders above \u20A615,000",
  "100% natural - No additives, no preservatives",
];

const DISMISS_KEY = "kma-announcement-dismissed";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "1") {
      setVisible(false);
      return;
    }
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  if (!visible) return null;

  return (
    <div className="announcement-bar" role="banner">
      <div className="announcement-bar__inner">
        <span key={index} className="fade-in">{ANNOUNCEMENTS[index]}</span>
      </div>
      <button
        className="announcement-bar__close"
        onClick={dismiss}
        aria-label="Dismiss announcement"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}
