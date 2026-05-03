import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const adminClient = createAdminClient();
  let body;

  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { full_name, email, phone } = body;

  if (!full_name || !email) {
    return NextResponse.json(
      { error: "Full name and email are required" },
      { status: 400 },
    );
  }

  // Insert the new customer
  const { data, error } = await adminClient
    .from("customers")
    .insert({
      full_name: full_name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : null,
    })
    .select()
    .single();

  if (error) {
    console.error("Customer creation error:", error);
    // Handle unique constraint violation (email already exists)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A customer with this email already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
