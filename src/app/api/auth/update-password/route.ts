import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkRateLimit, getRateLimitIdentifier, rateLimitResponse } from "@/lib/rate-limit";

function isValidPassword(password: unknown) {
  return typeof password === "string" && password.length >= 6;
}

export async function POST(request: Request) {
  const rlId = getRateLimitIdentifier(request);
  const rl = await checkRateLimit("update-password", rlId);
  const rlResp = rateLimitResponse(rl);
  if (rlResp) return rlResp;

  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";

  if (!isValidPassword(password)) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
