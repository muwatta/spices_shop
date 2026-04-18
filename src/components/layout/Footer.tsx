import Image from "next/image";

export default function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <div className="footer__logo-row">
            <Image
              src="/images/logo.jpg"
              alt="KMA Spices logo"
              width={44}
              height={44}
              style={{ borderRadius: "0.75rem", objectFit: "cover" }}
            />
            <span className="footer__name">KMA Spices & Herbs</span>
          </div>
          <p className="footer__tagline">
            Pure, natural spices, herbs, flours and oils — delivered fresh.
          </p>
        </div>

        {/* Contact + Socials */}
        <div className="footer__contact">
          <h4 className="footer__heading">Get in Touch</h4>

          <address className="footer__address">
            <span>📍 Alhajiyal Plaza, opp. Nipost, Gombe</span>
            <a href="tel:+2347016186356" className="footer__link">
              📞 +234 701 618 6356
            </a>
            <a href="mailto:kmafoods22@gmail.com" className="footer__link">
              ✉️ kmafoods22@gmail.com
            </a>
          </address>

          <h4 className="footer__heading">Follow Us</h4>
          <div className="footer__socials">
            <a
              href="https://www.instagram.com/kma_recipespices"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-link"
            >
              📸 <span>Instagram</span>
            </a>
            <a
              href="https://www.tiktok.com/@kmaspeciesandherbs"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-link"
            >
              🎵 <span>TikTok</span>
            </a>
            <a
              href="https://www.facebook.com/KMARecipesspices"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-link"
            >
              📘 <span>Facebook</span>
            </a>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link footer__social-link--whatsapp"
              >
                💬 <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        © {new Date().getFullYear()} KMA Spices and Herbs. All rights reserved.
      </div>

      <style>{`
        .footer {
          background: var(--clr-bark);
          color: var(--clr-cream);
          padding: 2rem 1.25rem 0;
          margin-top: auto;
        }

        /* ── Layout: single col → 2 col at 480px ── */
        .footer__inner {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          padding-bottom: 1.75rem;
          max-width: 960px;
          margin: 0 auto;
        }

        @media (min-width: 480px) {
          .footer__inner {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            align-items: start;
          }
        }

        /* ── Brand ── */
        .footer__logo-row {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 0.625rem;
        }

        .footer__name {
          font-family: var(--font-display);
          color: var(--clr-saffron);
          font-size: 0.95rem;
          font-weight: 700;
          line-height: 1.3;
        }

        .footer__tagline {
          font-size: 0.8125rem;
          color: rgba(253, 246, 236, 0.55);
          line-height: 1.65;
        }

        /* ── Contact column ── */
        .footer__contact {
          display: flex;
          flex-direction: column;
        }

        .footer__heading {
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: var(--clr-saffron);
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .footer__heading + * {
          margin-bottom: 1rem;
        }

        .footer__address {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          font-size: 0.8125rem;
          color: rgba(253, 246, 236, 0.65);
          font-style: normal;
        }

        .footer__link {
          color: rgba(253, 246, 236, 0.65);
          font-size: 0.8125rem;
          text-decoration: none;
          font-style: normal;
          transition: color 150ms ease;
        }

        .footer__link:hover {
          color: var(--clr-saffron);
        }

        /* ── Socials: always 2 columns ── */
        .footer__socials {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.35rem 0.5rem;
        }

        .footer__social-link {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8125rem;
          color: rgba(253, 246, 236, 0.65);
          text-decoration: none;
          padding: 0.35rem 0.5rem;
          border-radius: var(--radius-sm);
          transition: color 150ms ease, background 150ms ease;
          white-space: nowrap;
        }

        .footer__social-link:hover {
          color: var(--clr-saffron);
          background: rgba(232, 160, 32, 0.08);
        }

        .footer__social-link--whatsapp { color: #4ade80; }
        .footer__social-link--whatsapp:hover {
          color: #4ade80;
          background: rgba(37, 211, 102, 0.08);
        }

        /* ── Bottom bar ── */
        .footer__bottom {
          border-top: 1px solid rgba(253, 246, 236, 0.1);
          padding: 1rem 1.25rem;
          text-align: center;
          font-size: 0.75rem;
          color: rgba(253, 246, 236, 0.28);
          max-width: 960px;
          margin: 0 auto;
        }
      `}</style>
    </footer>
  );
}
