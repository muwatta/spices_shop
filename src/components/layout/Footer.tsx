"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

const Icon = {
  instagram: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 2C4 2 2 4 2 7v10c0 3 2 5 5 5h10c3 0 5-2 5-5V7c0-3-2-5-5-5H7zm5 5a5 5 0 1 1-5 5 5 5 0 0 1 5-5zm6.5-.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
    </svg>
  ),
  facebook: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 22v-8h3l1-4h-4V7a2 2 0 0 1 2-2h2V1h-3a5 5 0 0 0-5 5v3H6v4h3v8h4z" />
    </svg>
  ),
  whatsapp: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4a10 10 0 0 0-16 11l-2 7 7-2A10 10 0 1 0 20 4z" />
    </svg>
  ),
};

export default function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  return (
    <footer className="footer">
      <div className="footer__top">
        {/* Brand column */}
        <div className="footer__col footer__col--brand">
          <div className="footer__logo-row">
            <Image src="/images/logo.jpg" alt="KMA Spices logo" width={36} height={36} loading="lazy" className="footer__logo" />
            <span className="footer__name">KMA Spices</span>
          </div>
          <p className="footer__tagline">
            100% natural spices, herbs, flours, condiments, and oils. Freshly packed and trusted by kitchens across Nigeria.
          </p>
          <div className="footer__socials">
            <a href="https://www.instagram.com/kma_recipespices" target="_blank" rel="noreferrer" aria-label="Follow us on Instagram">
              <Icon.instagram />
            </a>
            <a href="https://www.facebook.com/KMARecipesspices" target="_blank" rel="noreferrer" aria-label="Follow us on Facebook">
              <Icon.facebook />
            </a>
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="Order via WhatsApp">
                <Icon.whatsapp />
              </a>
            )}
          </div>
        </div>

        {/* Shop — synced with header */}
        <div className="footer__col">
          <button className="footer__accordion-toggle" onClick={() => toggleAccordion("shop")} aria-expanded={openAccordion === "shop"}>
            <h4 className="footer__heading">Shop</h4>
            <svg className={`footer__accordion-icon ${openAccordion === "shop" ? "footer__accordion-icon--open" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <ul className={`footer__links ${openAccordion === "shop" ? "footer__links--open" : ""}`}>
            <li><Link href="/shop">All Products</Link></li>
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}><Link href={cat.href}>{cat.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Customer Care */}
        <div className="footer__col">
          <button className="footer__accordion-toggle" onClick={() => toggleAccordion("care")} aria-expanded={openAccordion === "care"}>
            <h4 className="footer__heading">Customer Care</h4>
            <svg className={`footer__accordion-icon ${openAccordion === "care" ? "footer__accordion-icon--open" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <ul className={`footer__links ${openAccordion === "care" ? "footer__links--open" : ""}`}>
            <li><Link href="mailto:kmafoods22@gmail.com">Contact Us</Link></li>
            <li><Link href="/account/orders">Track My Order</Link></li>
            <li><Link href="/account/overview">My Account</Link></li>
            <li><a href="tel:+2347016186356">+234 701 618 6356</a></li>
          </ul>
        </div>

        {/* Company */}
        <div className="footer__col">
          <button className="footer__accordion-toggle" onClick={() => toggleAccordion("company")} aria-expanded={openAccordion === "company"}>
            <h4 className="footer__heading">Company</h4>
            <svg className={`footer__accordion-icon ${openAccordion === "company" ? "footer__accordion-icon--open" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
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
        <div className="footer__payments">
          <span className="footer__payment-badge">Cash on Delivery</span>
          <span className="footer__payment-badge">Bank Transfer</span>
        </div>
        <p className="footer__origin">Proudly Nigerian</p>
      </div>
    </footer>
  );
}
