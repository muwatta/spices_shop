import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
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

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, image_url, price)), customers(*)')
    .eq('id', params.id)
    .eq('customer_id', user.id)
    .single();

  if (!order) notFound();

  const statusSteps = ['pending', 'confirmed', 'delivered'];
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <>
      <Navbar />
      <main>
        <div className="container" style={{ padding: '2rem var(--space-md)', maxWidth: '780px' }}>
          {searchParams.success && (
            <div className="alert alert-success fade-in" style={{ marginBottom: '1.5rem' }}>
              🎉 <strong>Order placed successfully!</strong> We'll confirm it shortly.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <Link href="/account" style={{ color: 'var(--clr-saffron-dark)', fontSize: '0.875rem' }}>← My Orders</Link>
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
            {(order.order_items as any[]).map((item: any) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--clr-cream-dark)', fontSize: '0.9rem' }}>
                <span>{item.products?.name ?? 'Product'} × {item.quantity}</span>
                <span style={{ fontWeight: 600 }}>{formatNaira(item.unit_price * item.quantity)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontWeight: 700, fontSize: '1.05rem' }}>
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
