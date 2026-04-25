import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect("/", 302);
}
