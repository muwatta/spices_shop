import { createAdminClient, createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ALERT_EMAIL =
  process.env.ADMIN_ALERT_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "security@example.com";
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

export async function getAdminRecord(email?: string | null) {
  if (!email) return null;
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("admin_users")
    .select("email, is_superadmin")
    .eq("email", normalizeEmail(email))
    .single();
  return data ?? null;
}

export async function isAdmin(email?: string | null): Promise<boolean> {
  const record = await getAdminRecord(email);
  return record !== null;
}

export async function isSuperAdmin(email?: string | null): Promise<boolean> {
  const record = await getAdminRecord(email);
  return record?.is_superadmin === true;
}

export async function getAdminEmail() {
  const adminClient = createAdminClient();
  try {
    const { data } = await adminClient
      .from("admin_settings")
      .select("value")
      .eq("key", "admin_email")
      .single();
    if (!data?.value)
      return normalizeEmail(process.env.NEXT_PUBLIC_ADMIN_EMAIL);
    return normalizeEmail(String(parseSettingValue(data.value)));
  } catch {
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

async function getCurrentUser() {
  const supabase = createClient();
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return error ? null : user;
  } catch {
    return null;
  }
}

// ============ UNAUTHORIZED RECORDING ============
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

    await resend.emails.send({
      from: "KMA Spices <security@kmaspices.com>",
      to: [ALERT_EMAIL],
      subject: "Security alert: unauthorized admin access",
      html: `
        <h2>Unauthorized admin access detected</h2>
        <p>Repeated unauthorized access attempts detected on KMA Spices admin.</p>
        <ul>
          <li><strong>Email:</strong> ${details.email ?? "unknown"}</li>
          <li><strong>IP:</strong> ${details.ip ?? "unknown"}</li>
          <li><strong>Action:</strong> ${details.action}</li>
          <li><strong>Attempts in last hour:</strong> ${details.attempts}</li>
          <li><strong>User agent:</strong> ${details.userAgent ?? "unknown"}</li>
        </ul>
      `,
    });

    return true;
  } catch (error) {
    console.error("Failed to send admin security alert:", error);
    return false;
  }
}

// ============ ADMIN CHECKS ============
export async function requireAdmin(
  request: Request,
): Promise<NextResponse | null> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    await recordUnauthorizedAttempt({
      email: null,
      action: "route_access",
      message: "Missing admin authentication",
      request,
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Hardcoded allowed emails (replace with database check when ready)
  const allowedEmails = [
    "kmafoods22@gmail.com",
    "abdullahmusliudeen@gmail.com",
  ];
  if (!allowedEmails.includes(user.email ?? "")) {
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

export async function requireSuperAdmin(
  request: Request,
): Promise<NextResponse | null> {
  const user = await getCurrentUser();
  if (!user) {
    await recordUnauthorizedAttempt({
      email: null,
      action: "superadmin_route_access",
      message: "Missing authentication",
      request,
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminRecord = await getAdminRecord(user.email);
  if (!adminRecord) {
    await recordUnauthorizedAttempt({
      email: user.email,
      action: "superadmin_route_access",
      message: "Non-admin attempted superadmin access",
      request,
    });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!adminRecord.is_superadmin) {
    await recordUnauthorizedAttempt({
      email: user.email,
      action: "superadmin_route_access",
      message: "Regular admin attempted superadmin-only action",
      request,
    });
    return NextResponse.json(
      { error: "Forbidden: superadmin access required" },
      { status: 403 },
    );
  }

  return null;
}
