import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import {
  renderToBuffer,
  Document,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";
import React from "react";

export const runtime = "nodejs";

const ReceiptPDF = ({ order, customer, items }: any) => (
  <Document>
    <Page size="A4" style={{ padding: 30 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        KMA Spices – Order Receipt
      </Text>
      <Text>Order ID: #{order.id.slice(0, 8).toUpperCase()}</Text>
      <Text>Date: {new Date(order.created_at).toLocaleDateString()}</Text>
      <Text>Customer: {customer.full_name || "N/A"}</Text>
      <Text>Address: {order.delivery_address}</Text>
      <Text>
        Payment:{" "}
        {order.payment_method === "bank_transfer"
          ? "Bank Transfer"
          : "Cash on Delivery"}
      </Text>
      <View style={{ marginTop: 20 }}>
        <View
          style={{
            flexDirection: "row",
            borderBottom: 1,
            paddingBottom: 5,
            marginBottom: 5,
          }}
        >
          <Text style={{ width: "60%" }}>Product</Text>
          <Text style={{ width: "20%" }}>Qty</Text>
          <Text style={{ width: "20%" }}>Price</Text>
        </View>
        {items.map((item: any) => (
          <View key={item.id} style={{ flexDirection: "row", marginBottom: 5 }}>
            <Text style={{ width: "60%" }}>
              {item.products?.name || "Product"}
            </Text>
            <Text style={{ width: "20%" }}>{item.quantity}</Text>
            <Text style={{ width: "20%" }}>
              ₦{(item.unit_price * item.quantity).toLocaleString()}
            </Text>
          </View>
        ))}
        <View
          style={{
            marginTop: 10,
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <Text>Total: ₦{order.total_amount.toLocaleString()}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export async function POST(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { orderId } = await request.json();
  const adminClient = createAdminClient();

  const { data: order, error: orderError } = await adminClient
    .from("orders")
    .select("*, customers(*)")
    .eq("id", orderId)
    .single();
  if (orderError)
    return NextResponse.json({ error: orderError.message }, { status: 500 });

  const { data: items, error: itemsError } = await adminClient
    .from("order_items")
    .select("*, products(name)")
    .eq("order_id", orderId);
  if (itemsError)
    return NextResponse.json({ error: itemsError.message }, { status: 500 });

  const pdfBuffer = await renderToBuffer(
    <ReceiptPDF order={order} customer={order.customers} items={items} />,
  );

  // Convert Buffer to Uint8Array (type‑safe for NextResponse)
  const pdfData = new Uint8Array(pdfBuffer);

  return new NextResponse(pdfData, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt-${orderId.slice(0, 8)}.pdf"`,
    },
  });
}
