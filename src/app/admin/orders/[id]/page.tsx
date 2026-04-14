'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatNaira } from '@/lib/utils';
import Link from 'next/link';

const STATUS_OPTIONS = ['pending', 'confirmed', 'delivered', 'cancelled'];

export default function AdminOrderDetailPage() {
  const { id } = useParams() as { id: string };
  const supabase = createClient();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  async function loadOrder() {
    const { data } = await supabase
      .from('orders')
      .select('*, customers(*), order_items(*, products(name, price))')
      .eq('id', id)
      .single();
    setOrder(data);

    // Load payment proof URL if exists
    if (data?.payment_proof_url) {
      const { data: urlData } = await supabase.storage
        .from('payment-proofs')
        .createSignedUrl(data.payment_proof_url, 3600);
      setProofUrl(urlData?.signedUrl ?? null);
    }

    setLoading(false);
  }

  async function updateStatus(status: string) {
    setSaving(true);
    await supabase.from('orders').update({ status }).eq('id', id);
    await loadOrder();
    setSaving(false);
  }

  useEffect(() => { loadOrder(); }, [id]);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}><span className="spinner" style={{ margin: '0 auto', display: 'block' }} /></div>;
  if (!order) return <div style={{ padding: '2rem' }}>Order not found.</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '820px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin/orders" style={{ color: 'var(--clr-saffron-dark)', fontSize: '0.875rem' }}>← All Orders</Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginTop: '0.25rem' }}>
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Customer info */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: '1rem' }}>Customer</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <div><strong>Name:</strong> {order.customers?.full_name ?? '—'}</div>
            <div><strong>Phone:</strong> {order.customers?.phone ?? '—'}</div>
            <div><strong>Address:</strong> {order.delivery_address ?? order.customers?.address ?? '—'}</div>
            {order.customers?.phone && (
              <a
                href={`https://wa.me/${order.customers.phone.replace(/\D/g, '')}?text=Hello ${order.customers.full_name}, your order #${order.id.slice(0, 8).toUpperCase()} has been ${order.status}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn whatsapp-btn btn-sm"
                style={{ marginTop: '0.5rem', width: 'fit-content' }}
              >
                💬 Message Customer
              </a>
            )}
          </div>
        </div>

        {/* Status control */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: '1rem' }}>Update Status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                disabled={saving || order.status === s}
                className="btn btn-sm"
                style={{
                  background: order.status === s ? 'var(--clr-saffron)' : 'white',
                  color: order.status === s ? 'var(--clr-bark)' : 'var(--clr-bark)',
                  border: '2px solid var(--clr-cream-dark)',
                  textTransform: 'capitalize',
                  justifyContent: 'flex-start',
                  opacity: order.status === s ? 1 : 0.85,
                }}
              >
                {order.status === s ? '✓ ' : ''}{s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: '1rem' }}>Items</h2>
        {(order.order_items as any[]).map((item: any) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--clr-cream-dark)', fontSize: '0.9rem' }}>
            <span>{item.products?.name ?? 'Product'} × {item.quantity}</span>
            <span style={{ fontWeight: 600 }}>{formatNaira(item.unit_price * item.quantity)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontWeight: 700 }}>
          <span>Total</span>
          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-saffron-dark)', fontSize: '1.1rem' }}>{formatNaira(order.total_amount)}</span>
        </div>
      </div>

      {/* Payment proof */}
      {proofUrl && (
        <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: '1rem' }}>Payment Proof</h2>
          <a href={proofUrl} target="_blank" rel="noopener noreferrer">
            <img src={proofUrl} alt="Payment proof" style={{ maxWidth: '400px', borderRadius: 'var(--radius-md)', border: '2px solid var(--clr-cream-dark)' }} />
          </a>
          <p style={{ fontSize: '0.8rem', color: 'var(--clr-muted)', marginTop: '0.5rem' }}>Click to open full size</p>
        </div>
      )}

      {order.payment_method === 'bank_transfer' && !proofUrl && (
        <div className="alert alert-warning" style={{ marginTop: '1.5rem' }}>
          ⚠️ No payment proof uploaded yet.
        </div>
      )}
    </div>
  );
}
