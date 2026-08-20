import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkRateLimit, getRateLimitIdentifier, rateLimitResponse } from "@/lib/rate-limit";

function normalizeEmail(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const rlId = getRateLimitIdentifier(request);
  const rl = await checkRateLimit("reset-password", rlId);
  const rlResp = rateLimitResponse(rl);
  if (rlResp) return rlResp;

  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 },
    );
  }

  const genericResponse = NextResponse.json({
    success: true,
    message: "If that email exists, a password reset link has been sent.",
  });
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "Email service is not configured." }, { status: 503 });
  }

  const origin = new URL(request.url).origin;
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${origin}/auth/callback?next=/reset-password` },
  });

  // Keep unknown addresses indistinguishable from valid ones.
  if (error || !data?.properties?.action_link) return genericResponse;

  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);
  const safeLink = data.properties.action_link;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#2c1f14;line-height:1.6">
      <h1 style="color:#b45a3c">Reset your KMA Spices password</h1>
      <p>We received a request to reset the password for this account.</p>
      <p><a href="${safeLink}" style="display:inline-block;padding:12px 20px;background:#b45a3c;color:#fff;text-decoration:none;border-radius:6px;font-weight:700">Reset password</a></p>
      <p>This link expires shortly and can only be used once. If you did not request this, you can safely ignore this email.</p>
      <p style="color:#766b63;font-size:13px">KMA Spices &amp; Herbs</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "KMA Spices <onboarding@resend.dev>",
      to: email,
      subject: "Reset your KMA Spices password",
      html,
    });
  } catch (sendError) {
    console.error("Password reset email error:", sendError);
    return NextResponse.json({ error: "Unable to send reset email. Please try again." }, { status: 502 });
  }

  return genericResponse;
}
