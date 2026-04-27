import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = params;
  const body = await request.json();
  const { full_name, phone, address, city, state, postal_code, email } = body;

  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("customers")
    .update({
      full_name,
      phone,
      address,
      city,
      state,
      postal_code,
      email,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
