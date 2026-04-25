export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { formatNaira } from '@/lib/utils';
import Link from 'next/link';

interface Props {
  params: { id: string };
  searchParams: { success?: string };
}

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, image_url, price, description)), customers(*)')
    .eq('id', params.id)
    .eq('customer_id', user.id)
    .single();

  const statusSteps = ['pending', 'confirmed', 'delivered'];

  const orderNotFound = !order || error;
  const currentStep = order ? statusSteps.indexOf(order.status) : -1;

  return (
    <>
      <Navbar />
      <main>
        <div className="container" style={{ padding: '2rem var(--space-md)', maxWidth: '780px' }}>
          {orderNotFound ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1rem' }}>
                Order not found
              </h1>
              <p style={{ color: 'var(--clr-muted)', marginBottom: '1.5rem' }}>
                We couldn't locate that order. Please return to your orders list and try again.
              </p>
              <Link href="/account/orders" className="btn btn-primary">
                Back to Orders
              </Link>
            </div>
          ) : (
            <>
              {searchParams.success && (
                <div className="alert alert-success fade-in" style={{ marginBottom: '1.5rem' }}>
                  🎉 <strong>Order placed successfully!</strong> We'll confirm it shortly.
                </div>
              )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <Link href="/account/orders" style={{ color: 'var(--clr-saffron-dark)', fontSize: '0.875rem' }}>← My Orders</Link>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginTop: '0.25rem' }}>
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </h1>
                </div>
            <span className={`badge badge-${order.status}`} style={{ fontSize: '0.875rem' }}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          {/* Progress tracker */}
          {order.status !== 'cancelled' && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  top: '18px',
                  left: '10%',
                  right: '10%',
                  height: '3px',
                  background: 'var(--clr-cream-dark)',
                  zIndex: 0,
                }} />
                <div style={{
                  position: 'absolute',
                  top: '18px',
                  left: '10%',
                  width: `${(currentStep / (statusSteps.length - 1)) * 80}%`,
                  height: '3px',
                  background: 'var(--clr-saffron)',
                  zIndex: 1,
                  transition: 'width 0.5s ease',
                }} />
                {statusSteps.map((step, i) => (
                  <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', position: 'relative', zIndex: 2, flex: 1 }}>
                    <div style={{
                      width: '36px', height: '36px',
                      borderRadius: '50%',
                      background: i <= currentStep ? 'var(--clr-saffron)' : 'var(--clr-cream-dark)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: i <= currentStep ? 'var(--clr-bark)' : 'var(--clr-muted)',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      transition: 'background 0.3s',
                    }}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', color: i <= currentStep ? 'var(--clr-bark)' : 'var(--clr-muted)' }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order items */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem' }}>Items Ordered</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {(order.order_items as any[]).map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '72px 1fr',
                    gap: '1rem',
                    alignItems: 'center',
                    padding: '1rem',
                    borderRadius: '1rem',
                    background: 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '1rem',
                      overflow: 'hidden',
                      background: 'var(--clr-cream-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.products?.image_url ? (
                      <img
                        src={item.products.image_url}
                        alt={item.products?.name ?? 'Product image'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ color: 'var(--clr-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '0.5rem' }}>
                        No image
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: 'var(--clr-bark)' }}>
                          {item.products?.name ?? 'Product'}
                        </p>
                        {item.products?.description && (
                          <p style={{ margin: '0.35rem 0 0', color: 'var(--clr-muted)', fontSize: '0.85rem' }}>
                            {item.products.description}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontWeight: 700 }}>{formatNaira(item.unit_price)}</p>
                        <p style={{ margin: '0.25rem 0 0', color: 'var(--clr-muted)', fontSize: '0.85rem' }}>
                          × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--clr-bark-mid)' }}>
                      <span>Subtotal</span>
                      <span style={{ fontWeight: 700 }}>{formatNaira(item.unit_price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontWeight: 700, fontSize: '1.05rem' }}>
              <span>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-saffron-dark)' }}>
                {formatNaira(order.total_amount)}
              </span>
            </div>
          </div>

          {/* Order meta */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem' }}>Order Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--clr-muted)' }}>Date</span>
                <span>{new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--clr-muted)' }}>Payment</span>
                <span>{order.payment_method === 'bank_transfer' ? '🏦 Bank Transfer' : '💵 Cash on Delivery'}</span>
              </div>
              {order.delivery_address && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--clr-muted)' }}>Delivery Address</span>
                  <span style={{ textAlign: 'right', maxWidth: '60%' }}>{order.delivery_address}</span>
                </div>
              )}
              {order.payment_proof_url && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--clr-muted)' }}>Payment Proof</span>
                  <span style={{ color: 'var(--clr-success)', fontWeight: 600 }}>✓ Uploaded</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
