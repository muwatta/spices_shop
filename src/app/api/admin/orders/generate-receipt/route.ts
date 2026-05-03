import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin';

export async function POST(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { orderId } = await request.json();
  const adminClient = createAdminClient();

  // Fetch order with customer
  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .select('*, customers(*)')
    .eq('id', orderId)
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  // Fetch order items with product names
  const { data: items, error: itemsError } = await adminClient
    .from('order_items')
    .select('*, products(name)')
    .eq('order_id', orderId);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  // Normalize items (Supabase may return an array for products)
  const normalizedItems = items.map((item: any) => ({
    ...item,
    products: Array.isArray(item.products) ? item.products[0] : item.products,
  }));

  // Dynamically import the PDF library (avoids edge runtime issues)
  const pdf = await import('@react-pdf/renderer');
  const { renderToBuffer, Document, Page, Text, View } = pdf;

  // Define the PDF component – use plain object to avoid TS errors on JSX? Actually JSX works.
  const ReceiptPDF = ({ order, customer, items }: any) => (
    <Document>
      <Page size="A4" style={{ padding: 30 }}>
        <Text style={{ fontSize: 20, marginBottom: 20 }}>KMA Spices – Order Receipt</Text>
        <Text>Order ID: #{order.id.slice(0, 8).toUpperCase()}</Text>
        <Text>Date: {new Date(order.created_at).toLocaleDateString()}</Text>
        <Text>Customer: {customer.full_name || 'N/A'}</Text>
        <Text>Address: {order.delivery_address}</Text>
        <Text>Payment: {order.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'}</Text>
        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row', borderBottom: 1, paddingBottom: 5, marginBottom: 5 }}>
            <Text style={{ width: '60%' }}>Product</Text>
            <Text style={{ width: '20%' }}>Qty</Text>
            <Text style={{ width: '20%' }}>Price</Text>
          </View>
          {items.map((item: any) => (
            <View key={item.id} style={{ flexDirection: 'row', marginBottom: 5 }}>
              <Text style={{ width: '60%' }}>{item.products?.name || 'Product'}</Text>
              <Text style={{ width: '20%' }}>{item.quantity}</Text>
              <Text style={{ width: '20%' }}>₦{(item.unit_price * item.quantity).toLocaleString()}</Text>
            </View>
          ))}
          <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Text>Total: ₦{order.total_amount.toLocaleString()}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );

  try {
    const pdfBuffer = await renderToBuffer(
      <ReceiptPDF order={order} customer={order.customers} items={normalizedItems} />
    );

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${orderId.slice(0, 8)}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error('PDF generation error:', err);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}