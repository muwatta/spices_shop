import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

function normalizeEmail(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Invalid email address." },
      { status: 400 },
    );
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("admin_users")
    .select("email")
    .eq("email", email)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "This account does not have admin privileges." },
      { status: 403 },
    );
  }

  return NextResponse.json({ isAdmin: true });
}
