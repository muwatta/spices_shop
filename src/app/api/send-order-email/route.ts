import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  // If no API key, return a warning but don't crash the build
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set – order confirmation email not sent");
    return NextResponse.json(
      {
        success: false,
        message: "Email service not configured",
      },
      { status: 200 },
    );
  }

  // Dynamically import Resend only when needed (avoids top‑level error)
  const { Resend } = await import("resend");
  const resend = new Resend(RESEND_API_KEY);

  try {
    const { email, orderId, items, total, paymentMethod } =
      await request.json();

    const itemsHtml = items
      .map(
        (item: any) => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>₦${item.price.toLocaleString()}</td>
        <td>₦{(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `,
      )
      .join("");

    const html = `
      <h2>Order Confirmation</h2>
      <p>Thank you for your order!</p>
      <p><strong>Order ID:</strong> ${orderId.slice(0, 8).toUpperCase()}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod === "bank_transfer" ? "Bank Transfer" : "Cash on Delivery"}</p>
      <table border="1" cellpadding="5" style="border-collapse: collapse;">
        <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot><tr><td colspan="3"><strong>Grand Total</strong></td><td><strong>₦${total.toLocaleString()}</strong></td></tr></tfoot>
      </table>
      <p>We will notify you once your order is confirmed.</p>
    `;

    await resend.emails.send({
      from: "Mama Spice <onboarding@resend.dev>", // change to your verified domain
      to: [email],
      subject: `Order Confirmation #${orderId.slice(0, 8).toUpperCase()}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
