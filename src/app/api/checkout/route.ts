import { createAdminClient, createClient } from "@/lib/supabase/server";
import { generateTransactionId } from "@/lib/utils";
import { NextResponse } from "next/server";

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const supabase = createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      {
        error: "Unauthorized. Please sign in again and try placing your order.",
      },
      { status: 401 },
    );
  }

  const body = await request.json();
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
  const items = Array.isArray(body.items) ? body.items : [];

  if (!full_name || !phone || !address_line1 || !city || !state) {
    return NextResponse.json(
      { error: "Please provide all required delivery details." },
      { status: 400 },
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
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

  const orderQuantities = items.reduce(
    (acc: Record<string, number>, item: any) => {
      const productId = normalizeText(item.product_id);
      const quantity = Number(item.quantity);
      if (!productId || Number.isNaN(quantity) || quantity <= 0) return acc;
      acc[productId] = (acc[productId] || 0) + quantity;
      return acc;
    },
    {},
  );

  const productIds = Object.keys(orderQuantities);
  if (productIds.length === 0) {
    return NextResponse.json(
      { error: "Order items are invalid or missing quantities." },
      { status: 400 },
    );
  }

  const { data: products, error: productError } = await adminSupabase
    .from("products")
    .select("id, price, stock")
    .in("id", productIds);

  if (productError || !products) {
    return NextResponse.json(
      { error: "Unable to validate products. Please try again later." },
      { status: 500 },
    );
  }

  const productMap = Object.fromEntries(
    products.map((product: any) => [product.id, product]),
  );

  let totalAmount = 0;
  for (const productId of productIds) {
    const product = productMap[productId];
    const quantity = orderQuantities[productId];
    if (!product) {
      return NextResponse.json(
        { error: "One or more items in your cart are no longer available." },
        { status: 400 },
      );
    }
    if (product.stock !== null && product.stock < quantity) {
      return NextResponse.json(
        {
          error: `Insufficient stock for ${productId}. Please adjust your cart and try again.`,
        },
        { status: 400 },
      );
    }
    totalAmount += product.price * quantity;
  }

  const { error: customerError } = await adminSupabase.from("customers").upsert(
    {
      id: user.id,
      full_name,
      phone,
      address: address_line1,
      address_line2,
      city,
      state,
      postal_code: postal_code || null,
      account_number: account_number || null,
    },
    { onConflict: "id" },
  );

  if (customerError) {
    return NextResponse.json(
      {
        error:
          customerError.message ||
          "Unable to save your delivery information. Please try again.",
      },
      { status: 500 },
    );
  }

  let order: any = null;
  let lastInsertError: any = null;
  const maxAttempts = 5;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const transaction_id = generateTransactionId();
    const { data: orderData, error: orderError } = await adminSupabase
      .from("orders")
      .insert({
        transaction_id,
        customer_id: user.id,
        status: "pending",
        payment_method,
        payment_proof_url,
        total_amount: totalAmount,
        delivery_address:
          `${address_line1} ${address_line2 ? address_line2 + " " : ""}${city}, ${state} ${postal_code}`.trim(),
      })
      .select()
      .single();

    if (orderError) {
      lastInsertError = orderError;
      const message = orderError.message?.toLowerCase();
      if (message?.includes("duplicate") || message?.includes("unique")) {
        continue;
      }
      return NextResponse.json(
        {
          error:
            orderError.message ||
            "Unable to create order. Please try again later.",
        },
        { status: 500 },
      );
    }

    order = orderData;
    break;
  }

  if (!order) {
    return NextResponse.json(
      {
        error:
          lastInsertError?.message ||
          "Unable to create a unique order reference. Please try again.",
      },
      { status: 500 },
    );
  }

  const orderRows = productIds.map((productId) => ({
    order_id: order.id,
    product_id: productId,
    quantity: orderQuantities[productId],
    unit_price: productMap[productId].price,
  }));

  const { error: itemsError } = await adminSupabase
    .from("order_items")
    .insert(orderRows);

  if (itemsError) {
    return NextResponse.json(
      {
        error:
          itemsError.message ||
          "Unable to save order items. Please try again later.",
      },
      { status: 500 },
    );
  }

  for (const productId of productIds) {
    const quantity = orderQuantities[productId];
    const product = productMap[productId];
    if (product.stock !== null) {
      const { error: stockError } = await adminSupabase
        .from("products")
        .update({ stock: product.stock - quantity })
        .eq("id", productId);
      if (stockError) {
        return NextResponse.json(
          {
            error:
              stockError.message ||
              "Unable to update product availability. Please contact support.",
          },
          { status: 500 },
        );
      }
    }
  }

  return NextResponse.json({ order });
}
