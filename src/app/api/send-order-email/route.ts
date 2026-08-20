import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkRateLimit, getRateLimitIdentifier, rateLimitResponse } from "@/lib/rate-limit";

const VALID_STATUSES = ["pending", "confirmed", "delivered", "cancelled"] as const;

export async function POST(request: Request) {
  const rlId = getRateLimitIdentifier(request);
  const rl = await checkRateLimit("send-order-email", rlId);
  const rlResp = rateLimitResponse(rl);
  if (rlResp) return rlResp;

  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set – status email not sent");
    return NextResponse.json(
      { success: false, message: "Email service not configured" },
      { status: 200 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  const status = typeof body.status === "string" ? body.status.trim() : "";

  if (!orderId) {
    return NextResponse.json(
      { error: "Missing orderId" },
      { status: 400 },
    );
  }

  if (!VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    return NextResponse.json(
      { error: "Invalid status" },
      { status: 400 },
    );
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, customer_id, status, customers(full_name, email)")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 },
    );
  }

  if (order.customer_id !== user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 },
    );
  }

  const customer = order.customers as { full_name?: string; email?: string } | null;
  const customerEmail = customer?.email || user.email;
  const customerName = customer?.full_name || "Customer";

  if (!customerEmail) {
    return NextResponse.json(
      { error: "No email address found for this customer" },
      { status: 400 },
    );
  }

  const statusMessages: Record<string, string> = {
    confirmed: "Your order has been confirmed and is being processed.",
    delivered:
      "Your order has been delivered. Thank you for shopping with us!",
    cancelled:
      "Your order has been cancelled. If this was a mistake, please contact us.",
    pending: "Your order has been received and is pending confirmation.",
  };
  const message =
    statusMessages[status] || `Your order status is now ${status}.`;

  const html = `
    <h2>Order Status Update</h2>
    <p>Hello ${customerName},</p>
    <p>${message}</p>
    <p><strong>Order ID:</strong> #${orderId.slice(0, 8).toUpperCase()}</p>
    <p>You can view your order details at: <a href="${process.env.NEXT_PUBLIC_BASE_URL}/account/orders/${orderId}">${process.env.NEXT_PUBLIC_BASE_URL}/account/orders/${orderId}</a></p>
    <p>Thank you for choosing KMA Spices!</p>
  `;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(RESEND_API_KEY);

    await resend.emails.send({
      from: "KMA Spices <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `Order #${orderId.slice(0, 8).toUpperCase()} - ${status.toUpperCase()}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Status email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
