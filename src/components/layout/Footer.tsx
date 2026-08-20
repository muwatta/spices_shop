"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

const Chevron = ({ open }: { open: boolean }) => (
  <svg className={`footer__accordion-icon ${open ? "footer__accordion-icon--open" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/kma_recipespices",
    color: "#e4405f",
    path: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/KMARecipesspices",
    color: "#1877f2",
    path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  },
  {
    label: "WhatsApp",
    href: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
      ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`
      : null,
    color: "#25d366",
    path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z",
  },
].filter((s) => s.href);

export default function Footer() {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const toggle = (section: string) => setOpenAccordion(openAccordion === section ? null : section);

  return (
    <footer className="footer">
      <div className="footer__top">
        {/* Brand */}
        <div className="footer__col footer__col--brand">
          <div className="footer__logo-row">
            <Image src="/images/logo.jpg" alt="KMA Spices" width={36} height={36} loading="lazy" className="footer__logo" />
            <span className="footer__name">KMA Spices</span>
          </div>
          <p className="footer__tagline">
            100% natural spices, herbs, and seasonings. Freshly packed and trusted by kitchens across Nigeria.
          </p>
          <div className="footer__socials">
            {socialLinks.map((s) => (
              <motion.a
                key={s.label}
                href={s.href!}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="footer__social-link"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{ "--social-color": s.color } as React.CSSProperties}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d={s.path} />
                </svg>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div className="footer__col">
          <button className="footer__accordion-toggle" onClick={() => toggle("shop")} aria-expanded={openAccordion === "shop"}>
            <h4 className="footer__heading">Shop</h4>
            <Chevron open={openAccordion === "shop"} />
          </button>
          <ul className={`footer__links ${openAccordion === "shop" ? "footer__links--open" : ""}`}>
            <li><Link href="/shop">All Products</Link></li>
            <li><Link href="/shop?category=spices">Spices</Link></li>
            <li><Link href="/shop?category=herbs">Herbs</Link></li>
            <li><Link href="/shop?category=seasonings">Seasonings</Link></li>
          </ul>
        </div>

        {/* Help */}
        <div className="footer__col">
          <button className="footer__accordion-toggle" onClick={() => toggle("help")} aria-expanded={openAccordion === "help"}>
            <h4 className="footer__heading">Help</h4>
            <Chevron open={openAccordion === "help"} />
          </button>
          <ul className={`footer__links ${openAccordion === "help" ? "footer__links--open" : ""}`}>
            <li><a href="mailto:kmafoods22@gmail.com">Contact Us</a></li>
            <li>
              <a href="tel:+2347016186356" className="footer__contact-card">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>Call Us</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div className="footer__col">
          <button className="footer__accordion-toggle" onClick={() => toggle("company")} aria-expanded={openAccordion === "company"}>
            <h4 className="footer__heading">Company</h4>
            <Chevron open={openAccordion === "company"} />
          </button>
          <ul className={`footer__links ${openAccordion === "company" ? "footer__links--open" : ""}`}>
            <li><Link href="/about">About KMA</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer__divider" />

      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} KMA Global Link. All rights reserved.</p>
        <p className="footer__origin">Proudly Nigerian</p>
      </div>
    </footer>
  );
}
