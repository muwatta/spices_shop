import Link from 'next/link';

export default function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return (
    <footer style={{
      background: 'var(--clr-bark)',
      color: 'var(--clr-cream)',
      padding: '2.5rem var(--space-md)',
      marginTop: 'auto',
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem',
      }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-saffron)', marginBottom: '0.75rem' }}>
            🌶 Mama Spice
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'rgba(253,246,236,0.7)', lineHeight: 1.7 }}>
            Premium Nigerian spices, freshly sourced and delivered to your door.
          </p>
        </div>
        <div>
          <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--clr-saffron)' }}>
            Shop
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/" style={{ color: 'rgba(253,246,236,0.7)', fontSize: '0.9rem' }}>All Products</Link>
            <Link href="/cart" style={{ color: 'rgba(253,246,236,0.7)', fontSize: '0.9rem' }}>Cart</Link>
            <Link href="/account" style={{ color: 'rgba(253,246,236,0.7)', fontSize: '0.9rem' }}>My Orders</Link>
          </div>
        </div>
        <div>
          <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--clr-saffron)' }}>
            Contact
          </h4>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#25D366',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              💬 WhatsApp Us
            </a>
          )}
        </div>
      </div>
      <div style={{
        borderTop: '1px solid rgba(253,246,236,0.15)',
        paddingTop: '1.5rem',
        textAlign: 'center',
        fontSize: '0.8125rem',
        color: 'rgba(253,246,236,0.4)',
      }}>
        © {new Date().getFullYear()} Mama Spice Store. All rights reserved.
      </div>
    </footer>
  );
}
