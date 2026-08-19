import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkRateLimit, getRateLimitIdentifier, rateLimitResponse } from "@/lib/rate-limit";

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const rlId = getRateLimitIdentifier(request);
  const rl = await checkRateLimit("checkout", rlId);
  const rlResp = rateLimitResponse(rl);
  if (rlResp) return rlResp;

  const supabase = createClient();

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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request format." },
      { status: 400 },
    );
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

  // Aggregate duplicate product IDs
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

  // Build items array for the atomic checkout function
  const checkoutItems = productIds.map((productId) => ({
    product_id: productId,
    quantity: orderQuantities[productId],
  }));

  // Call the atomic checkout function — everything happens in a single DB transaction
  const { data: order, error: checkoutError } = await supabase.rpc(
    "process_checkout",
    {
      p_user_id: user.id,
      p_full_name: full_name,
      p_phone: phone,
      p_address_line1: address_line1,
      p_address_line2: address_line2 || "",
      p_city: city,
      p_state: state,
      p_postal_code: postal_code || "",
      p_account_number: account_number || "",
      p_payment_method: payment_method,
      p_payment_proof_url: payment_proof_url || "",
      p_items: checkoutItems,
    },
  );

  if (checkoutError) {
    const message = checkoutError.message || "Unable to place order. Please try again.";
    // Map common PostgreSQL error messages to user-friendly messages
    if (message.includes("Insufficient stock")) {
      return NextResponse.json(
        { error: "One or more items are no longer available in the requested quantity. Please adjust your cart." },
        { status: 400 },
      );
    }
    if (message.includes("not found")) {
      return NextResponse.json(
        { error: "One or more items in your cart are no longer available." },
        { status: 400 },
      );
    }
    if (message.includes("Invalid payment method") || message.includes("payment proof")) {
      return NextResponse.json(
        { error: message },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Unable to place order. Please try again later." },
      { status: 500 },
    );
  }

  return NextResponse.json({ order });
}
