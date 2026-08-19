import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getRateLimitIdentifier, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rlId = getRateLimitIdentifier(request);
  const rl = await checkRateLimit("newsletter", rlId);
  const rlResp = rateLimitResponse(rl);
  if (rlResp) return rlResp;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ message: "Already subscribed." });
    }
    return NextResponse.json({ error: "Subscription failed." }, { status: 500 });
  }

  return NextResponse.json({ message: "Subscribed successfully." });
}
