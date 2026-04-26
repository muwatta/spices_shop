import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const adminClient = createAdminClient();

  const [
    { data: orderSummary, error: orderSummaryError },
    { count: productCount, error: productCountError },
    { count: lowStockCount, error: lowStockCountError },
    { data: recentOrders, error: recentOrdersError },
  ] = await Promise.all([
    adminClient
      .from("orders")
      .select("status, total_amount", { count: "exact" }),
    adminClient.from("products").select("id", { count: "exact", head: true }),
    adminClient
      .from("products")
      .select("id", { count: "exact", head: true })
      .not("stock", "is", null)
      .lte("stock", 5),
    adminClient
      .from("orders")
      .select(
        `id, status, total_amount, created_at, delivery_address, payment_method, customers(full_name, phone), order_items(quantity, products(name, image_url))`,
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (
    orderSummaryError ||
    productCountError ||
    lowStockCountError ||
    recentOrdersError
  ) {
    return NextResponse.json(
      { error: "Unable to load dashboard data." },
      { status: 500 },
    );
  }

  const totalOrders = Array.isArray(orderSummary) ? orderSummary.length : 0;
  const totalSales = Array.isArray(orderSummary)
    ? orderSummary.reduce(
        (sum, order) => sum + Number(order.total_amount ?? 0),
        0,
      )
    : 0;
  const pendingOrders = Array.isArray(orderSummary)
    ? orderSummary.filter(
        (order) => String(order.status).toLowerCase() === "pending",
      ).length
    : 0;

  return NextResponse.json({
    stats: {
      totalOrders,
      totalSales,
      pendingOrders,
      productCount: Number(productCount ?? 0),
      lowStockCount: Number(lowStockCount ?? 0),
    },
    recentOrders: recentOrders ?? [],
  });
}
