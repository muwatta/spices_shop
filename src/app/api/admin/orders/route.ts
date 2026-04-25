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

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const status = request.nextUrl.searchParams.get("status");
  const adminClient = createAdminClient();
  let query = adminClient
    .from("orders")
    .select("*, customers(full_name, phone, email), order_items(id)")
    .order("created_at", { ascending: false });

  if (status && STATUS_VALUES.includes(status as Status)) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
