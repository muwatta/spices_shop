import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set – status email not sent");
    return NextResponse.json(
      { success: false, message: "Email service not configured" },
      { status: 200 },
    );
  }

  const { Resend } = await import("resend");
  const resend = new Resend(RESEND_API_KEY);

  try {
    const { email, orderId, status, customerName } = await request.json();

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
      <p>Hello ${customerName || "Customer"},</p>
      <p>${message}</p>
      <p><strong>Order ID:</strong> #${orderId.slice(0, 8).toUpperCase()}</p>
      <p>You can view your order details at: <a href="${process.env.NEXT_PUBLIC_BASE_URL}/account/orders/${orderId}">${process.env.NEXT_PUBLIC_BASE_URL}/account/orders/${orderId}</a></p>
      <p>Thank you for choosing KMA Spices!</p>
    `;

    await resend.emails.send({
      from: "KMA Spices <onboarding@resend.dev>",
      to: [email],
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
