import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return (
    <footer
      style={{
        background: "var(--clr-bark)",
        color: "var(--clr-cream)",
        padding: "2.5rem var(--space-md)",
        marginTop: "auto",
      }}
    >
      <div
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
              flexWrap: "wrap",
            }}
          >
            <Image
              src="/images/logo.jpeg"
              alt="KMA Spices logo"
              width={52}
              height={52}
              style={{ borderRadius: "1rem", objectFit: "cover" }}
            />
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--clr-saffron)",
                  marginBottom: "0.75rem",
                }}
              >
                🌿 KMA Spices and Herbs
              </h3>
            </div>
          </div>
          <p
            style={{
              fontSize: "0.9rem",
              color: "rgba(253,246,236,0.75)",
              lineHeight: 1.7,
            }}
          >
            Pure, natural spices, herbs, flours, condiments, foodsuff and
            unadulterated oils delivered with premium freshness and rich flavor.
          </p>
        </div>
        <div>
          <h4
            style={{
              marginBottom: "0.75rem",
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--clr-saffron)",
            }}
          >
            Quick Links
          </h4>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <Link
              href="/"
              style={{ color: "rgba(253,246,236,0.8)", fontSize: "0.9rem" }}
            >
              Shop
            </Link>
            <Link
              href="/do-you-know"
              style={{ color: "rgba(253,246,236,0.8)", fontSize: "0.9rem" }}
            >
              Do you Know
            </Link>
            <Link
              href="/cart"
              style={{ color: "rgba(253,246,236,0.8)", fontSize: "0.9rem" }}
            >
              Cart
            </Link>
            <Link
              href="/account"
              style={{ color: "rgba(253,246,236,0.8)", fontSize: "0.9rem" }}
            >
              My Orders
            </Link>
          </div>
        </div>
        <div>
          <h4
            style={{
              marginBottom: "0.75rem",
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--clr-saffron)",
            }}
          >
            Contact
          </h4>
          <p
            style={{
              fontSize: "0.9rem",
              color: "rgba(253,246,236,0.8)",
              lineHeight: 1.7,
            }}
          >
            📍 Alhajiyal Plaza opposite Nipost office, Gombe
            <br />
            📞 +2347016186356
            <br />
            ✉️ kmafoods22@gmail.com
            <br />
            🌐 kmagloballink.com.ng
          </p>
          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.9rem",
              color: "rgba(253,246,236,0.8)",
              lineHeight: 1.7,
            }}
          >
            TikTok: @kmaspeciesandherbs
            <br />
            Instagram: @kma_recipespices
            <br />
            Facebook: KMA Recipesspices
          </p>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "#25D366",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              💬 WhatsApp Us
            </a>
          )}
        </div>
      </div>
      <div
        style={{
          borderTop: "1px solid rgba(253,246,236,0.15)",
          paddingTop: "1.5rem",
          textAlign: "center",
          fontSize: "0.8125rem",
          color: "rgba(253,246,236,0.4)",
        }}
      >
        © {new Date().getFullYear()} KMA Spices and Herbs. All rights reserved.
      </div>
    </footer>
  );
}
