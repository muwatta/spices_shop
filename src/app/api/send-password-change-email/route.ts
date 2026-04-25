import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set – password change email not sent");
    return NextResponse.json(
      { success: false, message: "Email service not configured" },
      { status: 200 },
    );
  }

  const { email, userName, returnUrl } = await request.json();
  if (!email) {
    return NextResponse.json(
      { success: false, error: "Missing email address" },
      { status: 400 },
    );
  }

  const { Resend } = await import("resend");
  const resend = new Resend(RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://your-app-url.com";
  const verifyUrl = returnUrl || `${appUrl}/account/security`;

  const html = `
    <h2>Password Changed</h2>
    <p>Hello ${userName || "Customer"},</p>
    <p>Your KMA Spices password was successfully updated.</p>
    <p>If you made this change, no action is required.</p>
    <p>If you did not change your password, please review your account security immediately by visiting <a href="${verifyUrl}">your security settings</a>.</p>
    <p>Thank you for shopping with KMA Spices.</p>
  `;

  try {
    await resend.emails.send({
      from: "KMA Spices <onboarding@resend.dev>",
      to: email,
      subject: "Your KMA Spices password was changed",
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password change email error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send notification email" },
      { status: 500 },
    );
  }
}
