import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkRateLimit, getRateLimitIdentifier, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rlId = getRateLimitIdentifier(request);
  const rl = await checkRateLimit("send-password-change-email", rlId);
  const rlResp = rateLimitResponse(rl);
  if (rlResp) return rlResp;

  // Require authenticated user (check before API key to avoid leaking config state)
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set – password change email not sent");
    return NextResponse.json(
      { success: false, message: "Email service not configured" },
      { status: 200 },
    );
  }

  const { Resend } = await import("resend");
  const resend = new Resend(RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://your-app-url.com";

  const customerName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "Customer";

  const html = `
    <h2>Password Changed</h2>
    <p>Hello ${customerName},</p>
    <p>Your KMA Spices password was successfully updated.</p>
    <p>If you made this change, no action is required.</p>
    <p>If you did not change your password, please review your account security immediately by visiting <a href="${appUrl}/account/security">your security settings</a>.</p>
    <p>Thank you for shopping with KMA Spices.</p>
  `;

  try {
    await resend.emails.send({
      from: "KMA Spices <onboarding@resend.dev>",
      to: user.email!,
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
