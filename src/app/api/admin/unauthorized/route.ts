import { NextResponse } from "next/server";
import { recordUnauthorizedAttempt } from "@/lib/admin";

export async function POST(request: Request) {
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
    : "Unauthorized: only the admin email can sign in here.";

  return NextResponse.json({
    blocked: result.blocked,
    attempts: result.attempts,
    message,
  });
}
