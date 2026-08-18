import Image from "next/image";
import Link from "next/link";

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

  return (
    <footer className="footer">
      <div className="footer__top">
        {/* Brand column */}
        <div className="footer__brand-col">
          <div className="footer__logo-row">
            <Image
              src="/images/logo.jpg"
              alt="KMA Spices logo"
              width={36}
              height={36}
              loading="lazy"
              className="footer__logo"
            />
            <span className="footer__name">KMA Spices</span>
          </div>
          <p className="footer__tagline">
            100% natural spices, herbs, flours, condiments, and oils. Freshly packed and trusted by kitchens across Nigeria.
          </p>
          <span className="footer__hours">Mon - Sat: 8am - 6pm</span>
          <div className="footer__socials">
            <a
              href="https://www.instagram.com/kma_recipespices"
              target="_blank"
              rel="noreferrer"
              className="instagram"
              aria-label="Follow us on Instagram"
            >
              <Icon.instagram />
            </a>
            <a
              href="https://www.facebook.com/KMARecipesspices"
              target="_blank"
              rel="noreferrer"
              className="facebook"
              aria-label="Follow us on Facebook"
            >
              <Icon.facebook />
            </a>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="whatsapp"
                aria-label="Order via WhatsApp"
              >
                <Icon.whatsapp />
              </a>
            )}
          </div>
        </div>

        {/* Shop links */}
        <div>
          <h4 className="footer__heading">Shop</h4>
          <ul className="footer__links">
            <li><Link href="/#catalog">All Products</Link></li>
            <li><Link href="/search?q=spice">Spices</Link></li>
            <li><Link href="/search?q=seasoning">Seasonings</Link></li>
            <li><Link href="/search?q=pepper">Peppers</Link></li>
            <li><Link href="/search?q=herb">Herbs</Link></li>
          </ul>
        </div>

        {/* Company links */}
        <div>
          <h4 className="footer__heading">Help</h4>
          <ul className="footer__links">
            <li><Link href="/do-you-know">Spice Tips</Link></li>
            <li><Link href="/account/orders">Track Order</Link></li>
            <li><Link href="/account/overview">My Account</Link></li>
            <li><Link href="/login">Login / Sign Up</Link></li>
          </ul>
          <h4 className="footer__heading" style={{ marginTop: "var(--space-lg)" }}>Contact</h4>
          <div className="footer__contact-row">
            <a href="tel:+2347016186356">+234 701 618 6356</a>
          </div>
          <div className="footer__contact-row">
            <a href="mailto:kmafoods22@gmail.com">kmafoods22@gmail.com</a>
          </div>
          <span className="footer__location">Gombe, Nigeria</span>
        </div>
      </div>

      <div className="footer__divider" />

      <div className="footer__bottom">
        &copy; {new Date().getFullYear()} KMA Spices &amp; Herbs. All rights reserved.
      </div>
    </footer>
  );
}
