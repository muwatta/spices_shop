import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { formatNaira } from '@/lib/utils';
import Link from 'next/link';

export default async function AccountPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/account');

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name))')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'badge-pending',
      confirmed: 'badge-confirmed',
      delivered: 'badge-delivered',
      cancelled: 'badge-cancelled',
    };
    return `badge ${map[status] ?? ''}`;
  };

  return (
    <>
      <Navbar />
      <main>
        <div className="container" style={{ padding: '2rem var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>My Orders</h1>
            <form action="/api/auth/signout" method="post">
              <button type="submit" className="btn btn-ghost btn-sm">Sign Out</button>
            </form>
          </div>

          {!orders || orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--clr-white)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</p>
              <p style={{ color: 'var(--clr-muted)', marginBottom: '1.5rem' }}>You haven't placed any orders yet.</p>
              <Link href="/" className="btn btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map((order) => (
                <Link key={order.id} href={`/account/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{
                    padding: '1.25rem 1.5rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '1rem',
                    alignItems: 'center',
                    transition: 'box-shadow var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)'}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={statusBadge(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--clr-muted)' }}>
                        {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}
                        {(order.order_items as any[])?.length ?? 0} item(s)
                        {' · '}
                        {order.payment_method === 'bank_transfer' ? '🏦 Bank Transfer' : '💵 Cash on Delivery'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--clr-saffron-dark)' }}>
                        {formatNaira(order.total_amount)}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--clr-muted)', marginTop: '0.25rem' }}>View details →</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
