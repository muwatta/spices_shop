import { createAdminClient, createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ALERT_EMAIL =
  process.env.ADMIN_ALERT_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "security@example.com";
const ADMIN_EMAIL_KEY = "admin_email";
const BLOCK_THRESHOLD = 5;
const BLOCK_WINDOW_MS = 1000 * 60 * 60;

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

function parseSettingValue(value: any) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

export async function getAdminEmail() {
  const adminClient = createAdminClient();

  try {
    const { data, error } = await adminClient
      .from("admin_settings")
      .select("value")
      .eq("key", ADMIN_EMAIL_KEY)
      .single();

    if (error || !data?.value) {
      return normalizeEmail(process.env.NEXT_PUBLIC_ADMIN_EMAIL);
    }

    const parsed = parseSettingValue(data.value);
    return normalizeEmail(String(parsed));
  } catch (error) {
    console.error("Failed to read admin email from database:", error);
    return normalizeEmail(process.env.NEXT_PUBLIC_ADMIN_EMAIL);
  }
}

export function isAdminEmail(
  email?: string | null,
  adminEmail?: string | null,
) {
  const normalizedEmail = normalizeEmail(email);
  return (
    normalizedEmail !== "" && normalizedEmail === normalizeEmail(adminEmail)
  );
}

export async function requireAdmin(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    await recordUnauthorizedAttempt({
      email: user?.email ?? null,
      action: "route_access",
      message: "Missing admin authentication",
      request,
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmail = await getAdminEmail();
  if (!isAdminEmail(user.email, adminEmail)) {
    await recordUnauthorizedAttempt({
      email: user.email,
      action: "route_access",
      message: "Non-admin user attempted admin API access",
      request,
    });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

export async function recordUnauthorizedAttempt({
  email,
  action,
  message,
  request,
}: {
  email?: string | null;
  action: string;
  message?: string | null;
  request?: Request;
}) {
  const ip =
    request?.headers.get("x-forwarded-for")?.split(",")[0].trim() || null;
  const userAgent = request?.headers.get("user-agent") || null;
  const adminClient = createAdminClient();

  try {
    await adminClient.from("admin_security_events").insert({
      email: email ? normalizeEmail(email) : null,
      ip,
      user_agent: userAgent,
      action,
      message: message ?? null,
    });
  } catch (error) {
    console.error("Failed to record unauthorized admin attempt:", error);
  }

  const windowStart = new Date(Date.now() - BLOCK_WINDOW_MS).toISOString();
  let query = adminClient
    .from("admin_security_events")
    .select("id", { count: "exact", head: true })
    .gte("created_at", windowStart);

  if (email) {
    query = query.eq("email", normalizeEmail(email));
  } else if (ip) {
    query = query.eq("ip", ip);
  }

  const { count } = await query;
  const attempts = typeof count === "number" ? count : 0;
  const blocked = attempts >= BLOCK_THRESHOLD;

  if (blocked) {
    await sendDeveloperAlert({ email, ip, userAgent, action, attempts });
  }

  return { blocked, attempts };
}

async function sendDeveloperAlert(details: {
  email?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  action: string;
  attempts: number;
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.warn("No RESEND_API_KEY provided – cannot notify developer.");
    return false;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(RESEND_API_KEY);

    const html = `
      <h2>Unauthorized admin access detected</h2>
      <p>This admin protection system detected repeated unauthorized access attempts.</p>
      <ul>
        <li><strong>Email:</strong> ${details.email ?? "unknown"}</li>
        <li><strong>IP:</strong> ${details.ip ?? "unknown"}</li>
        <li><strong>Action:</strong> ${details.action}</li>
        <li><strong>Attempts in last hour:</strong> ${details.attempts}</li>
        <li><strong>User agent:</strong> ${details.userAgent ?? "unknown"}</li>
      </ul>
    `;

    await resend.emails.send({
      from: "KMA Spices <security@kmaspices.com>",
      to: [ALERT_EMAIL],
      subject: "Security alert: unauthorized admin access",
      html,
    });

    return true;
  } catch (error) {
    console.error("Failed to send admin security alert:", error);
    return false;
  }
}
