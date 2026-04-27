import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

function parseMonthYear(monthValue: string | null, yearValue: string | null) {
  const month = monthValue ? Number(monthValue) : null;
  const year = yearValue ? Number(yearValue) : null;
  if (!month || !year || month < 1 || month > 12 || year < 2000) {
    return null;
  }
  return { month, year };
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const adminClient = createAdminClient();
  const monthYear = parseMonthYear(
    request.nextUrl.searchParams.get("month"),
    request.nextUrl.searchParams.get("year"),
  );

  const orderQuery = adminClient
    .from("orders")
    .select(
      "id, transaction_id, created_at, status, total_amount, payment_method, customers(full_name, phone, email)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (monthYear) {
    const { month, year } = monthYear;
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    orderQuery
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString());
  }

  const [
    { data: orders, error: ordersError },
    { data: lowStockProducts, error: lowStockError },
  ] = await Promise.all([
    orderQuery,
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
    orders: orders ?? [],
  });
}
