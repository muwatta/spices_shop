import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const adminClient = createAdminClient();

  const [
    { data: orders, error: ordersError },
    { data: lowStockProducts, error: lowStockError },
  ] = await Promise.all([
    adminClient.from("orders").select("status, total_amount"),
    adminClient
      .from("products")
      .select("name, stock")
      .not("stock", "is", null)
      .lte("stock", 5),
  ]);

  if (ordersError || lowStockError) {
    return NextResponse.json(
      { error: "Unable to load report data." },
      { status: 500 },
    );
  }

  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const totalSales = Array.isArray(orders)
    ? orders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0)
    : 0;
  const pendingOrders = Array.isArray(orders)
    ? orders.filter((order) => String(order.status).toLowerCase() === "pending")
        .length
    : 0;

  return NextResponse.json({
    totalOrders,
    totalSales,
    pendingOrders,
    lowStockProducts: lowStockProducts ?? [],
  });
}
