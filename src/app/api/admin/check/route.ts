import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Require authenticated user
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const requestedEmail = typeof body.email === "string"
    ? body.email.trim().toLowerCase()
    : "";

  if (!requestedEmail) {
    return NextResponse.json(
      { error: "Invalid email address." },
      { status: 400 },
    );
  }

  // Users can only check their own admin status
  if (user.email?.toLowerCase() !== requestedEmail) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 },
    );
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("admin_users")
    .select("email")
    .eq("email", requestedEmail)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "This account does not have admin privileges." },
      { status: 403 },
    );
  }

  return NextResponse.json({ isAdmin: true });
}
