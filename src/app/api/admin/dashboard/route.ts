import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const adminClient = createAdminClient();

  const [
    totalProducts,
    activeProducts,
    lowStock,
    pendingOrders,
    todayOrders,
    pendingCod,
    pendingTransfers,
    recentOrders,
  ] = await Promise.all([
    adminClient.from("products").select("id", { count: "exact", head: true }),
    adminClient.from("products").select("id", { count: "exact", head: true }),
    adminClient.from("products").select("id", { count: "exact", head: true }).not("stock", "is", null).lte("stock", 5),
    adminClient.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    adminClient.from("orders").select("id, total_amount", { count: "exact" }).gte("created_at", new Date().toISOString().split("T")[0]),
    adminClient.from("orders").select("id", { count: "exact", head: true }).eq("payment_method", "cash_on_delivery").eq("payment_status", "pending"),
    adminClient.from("orders").select("id", { count: "exact", head: true }).eq("payment_method", "bank_transfer").eq("payment_status", "pending"),
    adminClient
      .from("orders")
      .select("id, status, total_amount, created_at, delivery_address, payment_method, payment_status, customers(full_name, phone), order_items(quantity, products(name, image_url))")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const todayTotal = todayOrders.data?.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0) ?? 0;

  return NextResponse.json({
    totalSales: todayTotal,
    totalOrders: todayOrders.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
    totalProducts: totalProducts.count ?? 0,
    activeProducts: activeProducts.count ?? 0,
    lowStock: lowStock.count ?? 0,
    pendingCod: pendingCod.count ?? 0,
    pendingTransfers: pendingTransfers.count ?? 0,
    recentOrders: recentOrders.data ?? [],
  });
}
