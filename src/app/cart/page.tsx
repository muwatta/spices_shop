'use client';

import { useCartStore } from '@/lib/store/cart';
import { formatNaira, buildWhatsAppUrl, buildOrderWhatsAppMessage } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  function handleWhatsAppOrder() {
    if (!phone) return;
    const message = buildOrderWhatsAppMessage(
      items.map((i) => ({ name: i.product.name, quantity: i.quantity, price: i.product.price })),
      totalPrice()
    );
    window.open(buildWhatsAppUrl(phone, message), '_blank');
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main>
          <div className="container" style={{ padding: '4rem var(--space-md)', textAlign: 'center' }}>
            <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</p>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.75rem' }}>Your cart is empty</h2>
            <p style={{ color: 'var(--clr-muted)', marginBottom: '1.5rem' }}>Add some spices to get started!</p>
            <Link href="/" className="btn btn-primary">Browse Spices</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <div className="container" style={{ padding: '2rem var(--space-md)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '2rem' }}>
            Your Cart
          </h1>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2rem',
          }}>
            {/* Cart items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="card" style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: '1.25rem',
                  alignItems: 'center',
                  padding: '1rem',
                }}>
                  {/* Image */}
                  <div style={{
                    width: '80px', height: '80px',
                    background: 'var(--clr-cream-dark)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    position: 'relative',
                  }}>
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🌶</div>
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <Link href={`/product/${product.id}`}>
                      <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{product.name}</h3>
                    </Link>
                    <p style={{ color: 'var(--clr-saffron-dark)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                      {formatNaira(product.price * quantity)}
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--clr-muted)' }}>
                      {formatNaira(product.price)} each
                    </p>
                  </div>

                  {/* Quantity + remove */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '2px solid var(--clr-cream-dark)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        style={{ padding: '0.3rem 0.75rem', background: 'var(--clr-cream-dark)', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >−</button>
                      <span style={{ padding: '0.3rem 0.75rem', fontWeight: 600, background: 'white', minWidth: '2.5rem', textAlign: 'center' }}>{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        style={{ padding: '0.3rem 0.75rem', background: 'var(--clr-cream-dark)', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >+</button>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--clr-chili)', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 500 }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="card" style={{ padding: '1.5rem', alignSelf: 'start' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '1.25rem' }}>
                Order Summary
              </h2>

              {items.map(({ product, quantity }) => (
                <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--clr-muted)' }}>{product.name} × {quantity}</span>
                  <span>{formatNaira(product.price * quantity)}</span>
                </div>
              ))}

              <div className="divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                <span>Total</span>
                <span style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-saffron-dark)' }}>
                  {formatNaira(totalPrice())}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link href="/checkout" className="btn btn-primary btn-lg" style={{ textAlign: 'center', display: 'block' }}>
                  Proceed to Checkout
                </Link>

                {phone && (
                  <button className="btn btn-lg whatsapp-btn" onClick={handleWhatsAppOrder}>
                    💬 Order via WhatsApp
                  </button>
                )}

                <button
                  onClick={clearCart}
                  style={{ background: 'none', border: 'none', color: 'var(--clr-muted)', fontSize: '0.875rem', cursor: 'pointer', textAlign: 'center', marginTop: '0.25rem' }}
                >
                  Clear cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
