import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createClient();
    // Exchange the code for a session (this also confirms the email)
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to login page with a confirmation success message
  return NextResponse.redirect(
    new URL("/login?confirmed=true", requestUrl.origin),
  );
}
