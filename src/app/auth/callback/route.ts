import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  if (code) {
    const supabase = createClient();
    // Exchange the code for a session (this also confirms the email)
    await supabase.auth.exchangeCodeForSession(code);
  }

  const destination = next?.startsWith("/") ? next : "/";
  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
