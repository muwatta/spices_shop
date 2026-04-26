import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

const STATUS_VALUES = [
  "pending",
  "confirmed",
  "delivered",
  "cancelled",
] as const;

type Status = (typeof STATUS_VALUES)[number];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("orders")
    .select("*, customers(*), order_items(*, products(name, price))")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const status = typeof body.status === "string" ? body.status : "";

  if (!STATUS_VALUES.includes(status as Status)) {
    return NextResponse.json(
      { error: "Invalid status value." },
      { status: 400 },
    );
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}