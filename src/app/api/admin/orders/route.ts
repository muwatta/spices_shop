import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

const PAGE_SIZE = 25;

export async function GET(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const paymentMethod = searchParams.get("payment_method") || "";
  const paymentStatus = searchParams.get("payment_status") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const adminClient = createAdminClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = adminClient
    .from("orders")
    .select("*, customers(full_name, phone, email), order_items(id)", { count: "exact" });

  const validStatuses = ["pending", "confirmed", "processing", "out_for_delivery", "delivered", "cancelled"];
  if (status && validStatuses.includes(status)) {
    query = query.eq("status", status);
  }
  if (paymentMethod === "cod") {
    query = query.eq("payment_method", "cash_on_delivery");
  } else if (paymentMethod === "transfer") {
    query = query.eq("payment_method", "bank_transfer");
  }
  if (paymentStatus) {
    query = query.eq("payment_status", paymentStatus);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    orders: data,
    total: count,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count || 0) / PAGE_SIZE),
  });
}
