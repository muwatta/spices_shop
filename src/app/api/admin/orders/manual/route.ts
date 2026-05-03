import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { customer_id, items, delivery_address, payment_method } =
    await request.json();
  if (!customer_id || !items || items.length === 0) {
    return NextResponse.json(
      { error: "Missing customer or items" },
      { status: 400 },
    );
  }

  const adminClient = createAdminClient();

  // Calculate total and fetch product prices
  let total_amount = 0;
  for (const item of items) {
    const { data: product, error: productError } = await adminClient
      .from("products")
      .select("price")
      .eq("id", item.product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: `Product ${item.product_id} not found` },
        { status: 404 },
      );
    }
    total_amount += product.price * item.quantity;
  }

  // Create order
  const { data: order, error: orderError } = await adminClient
    .from("orders")
    .insert({
      customer_id,
      status: "pending",
      payment_method: payment_method || "cash_on_delivery",
      total_amount,
      delivery_address,
      notes: "Manual order created by admin",
    })
    .select()
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  // Insert order items
  for (const item of items) {
    // Fetch product price again (or reuse from earlier loop – but we can re‑fetch for simplicity)
    const { data: product, error: productError } = await adminClient
      .from("products")
      .select("price")
      .eq("id", item.product_id)
      .single();

    if (productError || !product) {
      // Rollback? For simplicity, return error
      return NextResponse.json(
        { error: `Product ${item.product_id} not found during item insertion` },
        { status: 404 },
      );
    }

    const { error: itemError } = await adminClient.from("order_items").insert({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: product.price,
    });
    if (itemError) {
      return NextResponse.json({ error: itemError.message }, { status: 500 });
    }
  }

  return NextResponse.json(order);
}
