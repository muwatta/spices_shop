import { NextResponse } from "next/server";
import { recordUnauthorizedAttempt } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await request
    .json()
    .catch(() => ({ email: null, action: "login_attempt" }));
  const email = body.email ? String(body.email).toLowerCase() : null;
  const action = body.action ? String(body.action) : "login_attempt";

  const result = await recordUnauthorizedAttempt({
    email,
    action,
    message: "Admin login attempt blocked",
    request,
  });

  const message = result.blocked
    ? "Too many unauthorized admin attempts detected. Access is temporarily blocked and the developer has been notified."
  : "Unauthorized: You are not allowed to access the admin panel.";

  return NextResponse.json({
    blocked: result.blocked,
    attempts: result.attempts,
    message,
  });
}
