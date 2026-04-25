"use client";

import Image from "next/image";

const Icon = {
  instagram: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 2C4 2 2 4 2 7v10c0 3 2 5 5 5h10c3 0 5-2 5-5V7c0-3-2-5-5-5H7zm5 5a5 5 0 1 1-5 5 5 5 0 0 1 5-5z" />
    </svg>
  ),
  facebook: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 22v-8h3l1-4h-4V7a2 2 0 0 1 2-2h2V1h-3a5 5 0 0 0-5 5v3H6v4h3v8h4z" />
    </svg>
  ),
  whatsapp: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4a10 10 0 0 0-16 11l-2 7 7-2A10 10 0 1 0 20 4z" />
    </svg>
  ),
};

export default function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <footer className="footer" style={{ marginTop: "auto" }}>
      <div className="footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <div className="footer__logo-row">
            <Image
              src="/images/logo.jpg"
              alt="KMA Spices logo"
              width={40}
              height={40}
              loading="lazy"
              className="footer__logo"
            />
            <span className="footer__name">KMA Spices</span>
          </div>
          <p className="footer__tagline">
            100% natural spices, herbs and oils. Fresh and trusted.
          </p>
          <span className="footer__hours">Mon – Sat: 8am – 6pm</span>
        </div>

        {/* Contact */}
        <div className="footer__contact">
          <h4 className="footer__heading">Contact</h4>
          <div className="footer__contact-row">
            <a href="tel:+2347016186356">+234 701 618 6356</a>
            <a href="mailto:kmafoods22@gmail.com">kmafoods22@gmail.com</a>
          </div>
          <span className="footer__location">Gombe, Nigeria</span>
          <div className="footer__socials">
            <a
              href="https://www.instagram.com/kma_recipespices"
              target="_blank"
              rel="noreferrer"
              className="instagram"
            >
              <Icon.instagram />
            </a>
            <a
              href="https://www.facebook.com/KMARecipesspices"
              target="_blank"
              rel="noreferrer"
              className="facebook"
            >
              <Icon.facebook />
            </a>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="whatsapp"
              >
                <Icon.whatsapp />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        © {new Date().getFullYear()} KMA Spices • All rights reserved
      </div>

      <style>{`
        .footer {
          background: var(--clr-bark);
          color: var(--clr-cream);
          padding: 1.5rem 1.2rem 0;
          margin-top: auto;
        }
        .footer__inner {
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          gap: 1.2rem;
        }
        @media (min-width: 640px) {
          .footer__inner {
            grid-template-columns: 1.3fr 1fr;
            align-items: center;
          }
        }
        @media (max-width: 900px) {
        .footer__inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1rem;
        }
        .footer__logo-row {
          justify-content: center;
        }
        .footer__contact-row {
          justify-content: center;
        }
        .footer__socials {
          justify-content: center;
        }
      }
        .footer__logo-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.4rem;
        }
        .footer__name {
          font-weight: 700;
          color: var(--clr-saffron);
          font-size: 0.95rem;
        }
        .footer__tagline {
          font-size: 0.8rem;
          opacity: 0.7;
          margin-bottom: 0.4rem;
        }
        .footer__hours {
          font-size: 0.75rem;
          opacity: 0.6;
        }
        .footer__heading {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--clr-saffron);
          margin-bottom: 0.5rem;
        }
        .footer__contact-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
          font-size: 0.8rem;
          margin-bottom: 0.3rem;
        }
        .footer__contact-row a {
          text-decoration: none;
          color: inherit;
          opacity: 0.7;
        }
        .footer__contact-row a:hover {
          opacity: 1;
          color: var(--clr-saffron);
        }
        .footer__location {
          font-size: 0.75rem;
          opacity: 0.6;
          display: block;
          margin-bottom: 0.6rem;
        }
        .footer__socials {
          display: flex;
          gap: 0.5rem;
        }
        .footer__socials a {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.39);
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .footer__socials a:hover {
          transform: translateY(-2px);
        }
        .instagram { color: #e1306c; }
        .facebook { color: #1877f2; }
        .whatsapp { color: #25d366; }
        .footer__bottom {
          border-top: 1px solid rgba(255,255,255,0.08);
          text-align: center;
          padding: 0.7rem;
          font-size: 0.7rem;
          opacity: 0.5;
          margin-top: 1.2rem;
        }
      `}</style>
    </footer>
  );
}
