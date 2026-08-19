import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Rate limit configurations per endpoint.
// These are intentionally conservative for a small e-commerce site.
const RATE_LIMITS: Record<string, { maxRequests: number; windowSeconds: number }> = {
  "send-order-email":        { maxRequests: 5,   windowSeconds: 60 },      // 5 per minute
  "send-password-change-email": { maxRequests: 3, windowSeconds: 300 },   // 3 per 5 min
  "reset-password":          { maxRequests: 3,   windowSeconds: 300 },     // 3 per 5 min
  "signup":                  { maxRequests: 5,   windowSeconds: 600 },     // 5 per 10 min
  "checkout":                { maxRequests: 10,  windowSeconds: 600 },     // 10 per 10 min
  "update-password":         { maxRequests: 5,   windowSeconds: 300 },     // 5 per 5 min
  "newsletter":              { maxRequests: 3,   windowSeconds: 300 },     // 3 per 5 min
};

type RateLimitResult = { allowed: true } | { allowed: false; retryAfter: number };

/**
 * Check rate limit for a given endpoint and identifier.
 * Returns { allowed: true } or { allowed: false, retryAfter }.
 *
 * @param endpoint - must match a key in RATE_LIMITS
 * @param identifier - typically IP address or user ID
 */
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
      // If the rate limit table/function doesn't exist yet (migration pending),
      // fail open — allow the request rather than blocking legitimate users.
      console.warn("Rate limit check failed (failing open):", error.message);
      return { allowed: true };
    }

    if (data === false) {
      return { allowed: false, retryAfter: config.windowSeconds };
    }

    return { allowed: true };
  } catch {
    // Fail open on unexpected errors
    return { allowed: true };
  }
}

/**
 * Extract a rate-limit identifier from a Request.
 * Uses X-Forwarded-For IP (Vercel sets this) or falls back to a generic string.
 */
export function getRateLimitIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}

/**
 * If rate limited, return a NextResponse with 429 status.
 * Otherwise return null.
 */
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
