"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const Chevron = ({ open }: { open: boolean }) => (
  <svg className={`footer__accordion-icon ${open ? "footer__accordion-icon--open" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggle = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

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
            <a href="https://www.instagram.com/kma_recipespices" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2C4 2 2 4 2 7v10c0 3 2 5 5 5h10c3 0 5-2 5-5V7c0-3-2-5-5-5H7zm5 5a5 5 0 1 1-5 5 5 5 0 0 1 5-5zm6.5-.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" /></svg>
            </a>
            <a href="https://www.facebook.com/KMARecipesspices" target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-8h3l1-4h-4V7a2 2 0 0 1 2-2h2V1h-3a5 5 0 0 0-5 5v3H6v4h3v8h4z" /></svg>
            </a>
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4a10 10 0 0 0-16 11l-2 7 7-2A10 10 0 1 0 20 4z" /></svg>
              </a>
            )}
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
            <li><a href="tel:+2347016186356">+234 701 618 6356</a></li>
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
