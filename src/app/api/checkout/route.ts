import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in again and try placing your order." },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request format." }, { status: 400 });
  }

  const full_name = normalizeText(body.full_name);
  const phone = normalizeText(body.phone);
  const address_line1 = normalizeText(body.address_line1);
  const address_line2 = normalizeText(body.address_line2);
  const city = normalizeText(body.city);
  const state = normalizeText(body.state);
  const postal_code = normalizeText(body.postal_code);
  const account_number = normalizeText(body.account_number);
  const payment_method = normalizeText(body.payment_method);
  const payment_proof_url = normalizeText(body.payment_proof_url) || null;
  const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];

  if (!full_name || !phone || !address_line1 || !city || !state) {
    return NextResponse.json(
      { error: "Please provide all required delivery details." },
      { status: 400 },
    );
  }

  if (items.length === 0) {
    return NextResponse.json(
      { error: "No items were provided for this order." },
      { status: 400 },
    );
  }

  if (!["cash_on_delivery", "bank_transfer"].includes(payment_method)) {
    return NextResponse.json(
      { error: "Invalid payment method selected." },
      { status: 400 },
    );
  }

  if (payment_method === "bank_transfer" && !payment_proof_url) {
    return NextResponse.json(
      { error: "Bank transfer orders require payment proof." },
      { status: 400 },
    );
  }

  // Aggregate duplicate product IDs
  const orderQuantities: Record<string, number> = {};
  for (const item of items) {
    const productId = normalizeText(item.product_id);
    const quantity = Number(item.quantity);
    if (!productId || Number.isNaN(quantity) || quantity <= 0) continue;
    orderQuantities[productId] = (orderQuantities[productId] || 0) + quantity;
  }

  const productIds = Object.keys(orderQuantities);
  if (productIds.length === 0) {
    return NextResponse.json(
      { error: "Order items are invalid or missing quantities." },
      { status: 400 },
    );
  }

  // Fetch all products to validate stock and prices (service role bypasses RLS)
  const { createAdminClient } = await import("@/lib/supabase/server");
  const admin = createAdminClient();

  const { data: products, error: productError } = await admin
    .from("products")
    .select("id, price, stock")
    .in("id", productIds);

  if (productError || !products || products.length === 0) {
    return NextResponse.json(
      { error: "Unable to verify products. Please try again." },
      { status: 500 },
    );
  }

  const productMap: Record<string, { price: number; stock: number | null }> = {};
  for (const p of products) {
    productMap[p.id] = { price: p.price, stock: p.stock };
  }

  // Validate all products exist and have enough stock
  let totalAmount = 0;
  for (const productId of productIds) {
    const product = productMap[productId];
    if (!product) {
      return NextResponse.json(
        { error: "One or more items in your cart are no longer available." },
        { status: 400 },
      );
    }
    const qty = orderQuantities[productId];
    if (product.stock !== null && product.stock < qty) {
      return NextResponse.json(
        { error: `Insufficient stock for one or more items. Please adjust your cart.` },
        { status: 400 },
      );
    }
    totalAmount += product.price * qty;
  }

  // Build delivery address
  const deliveryAddress = [
    address_line1,
    address_line2 ? address_line2 + "," : "",
    city + ",",
    state,
    postal_code || "",
  ]
    .filter(Boolean)
    .join(" ");

  // Generate transaction ID
  const transactionId =
    "KMA" + Date.now() + Math.random().toString(36).substring(2, 6).toUpperCase();

  // Upsert customer
  const { error: customerError } = await admin.from("customers").upsert(
    {
      id: user.id,
      full_name,
      email: user.email || "",
      phone,
      address: address_line1,
      address_line2: address_line2 || "",
      city,
      state,
      postal_code: postal_code || null,
      account_number: account_number || null,
    },
    { onConflict: "id" },
  );

  if (customerError) {
    console.error("Customer upsert error:", customerError);
  }

  // Create order
  const orderId = crypto.randomUUID();
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      id: orderId,
      transaction_id: transactionId,
      customer_id: user.id,
      status: "pending",
      payment_method,
      payment_proof_url: payment_proof_url || null,
      total_amount: totalAmount,
      delivery_address: deliveryAddress,
    })
    .select()
    .single();

  if (orderError) {
    console.error("Order creation error:", orderError);
    return NextResponse.json(
      { error: "Unable to place order. Please try again later." },
      { status: 500 },
    );
  }

  // Create order items and decrement stock
  const orderItems = productIds.map((productId) => ({
    order_id: orderId,
    product_id: productId,
    quantity: orderQuantities[productId],
    unit_price: productMap[productId].price,
  }));

  const { error: itemsError } = await admin.from("order_items").insert(orderItems);

  if (itemsError) {
    console.error("Order items error:", itemsError);
    // Try to clean up the order
    await admin.from("orders").delete().eq("id", orderId);
    return NextResponse.json(
      { error: "Unable to place order. Please try again later." },
      { status: 500 },
    );
  }

  // Decrement stock for each product
  for (const productId of productIds) {
    const product = productMap[productId];
    if (product.stock !== null) {
      const newStock = product.stock - orderQuantities[productId];
      await admin
        .from("products")
        .update({ stock: Math.max(0, newStock) })
        .eq("id", productId);
    }
  }

  return NextResponse.json({ order });
}
