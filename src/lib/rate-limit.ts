import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const RATE_LIMITS: Record<string, { maxRequests: number; windowSeconds: number }> = {
  "send-order-email":        { maxRequests: 5,   windowSeconds: 60 },      // 5 per minute
  "send-password-change-email": { maxRequests: 3, windowSeconds: 300 },   // 3 per 5 min
  "reset-password":          { maxRequests: 3,   windowSeconds: 300 },     // 3 per 5 min
  "signup":                  { maxRequests: 5,   windowSeconds: 600 },     // 5 per 10 min
  "checkout":                { maxRequests: 10,  windowSeconds: 600 },     // 10 per 10 min
  "update-password":         { maxRequests: 5,   windowSeconds: 300 },     // 5 per 5 min
  "newsletter":              { maxRequests: 3,   windowSeconds: 300 },     // 3 per 5 min
  "recommendations":         { maxRequests: 20,  windowSeconds: 600 },     // 20 per 10 min
  "reviews":                 { maxRequests: 5,   windowSeconds: 3600 },     // 5 per hour
};

type RateLimitResult = { allowed: true } | { allowed: false; retryAfter: number };


export async function checkRateLimit(
  endpoint: string,
  identifier: string,
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[endpoint];
  if (!config) return { allowed: true };

  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_endpoint: endpoint,
      p_max_requests: config.maxRequests,
      p_window_seconds: config.windowSeconds,
    });

    if (error) {
      console.error("Rate limit check failed:", error.message);
      return { allowed: false, retryAfter: 60 };
    }

    if (data === false) {
      return { allowed: false, retryAfter: config.windowSeconds };
    }

    return { allowed: true };
  } catch {
    return { allowed: false, retryAfter: 60 };
  }
}


export function getRateLimitIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}


export function rateLimitResponse(result: RateLimitResult): NextResponse | null {
  if (result.allowed) return null;
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfter),
      },
    },
  );
}
