import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const adminClient = createAdminClient();
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || "1");
  const limit = Number(url.searchParams.get("limit") || "20");
  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
  const safeLimit = Number.isNaN(limit) || limit < 1 ? 20 : limit;
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  // First, fetch customers with pagination
  const {
    data: customers,
    error,
    count,
  } = await adminClient
    .from("customers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Then fetch orders for all these customers separately
  const customerIds = customers.map((c: any) => c.id);
  const { data: orders, error: ordersError } = await adminClient
    .from("orders")
    .select("customer_id, total_amount")
    .in("customer_id", customerIds);

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  // Group orders by customer_id
  const ordersByCustomer: Record<string, any[]> = {};
  orders?.forEach((order: any) => {
    if (!ordersByCustomer[order.customer_id]) {
      ordersByCustomer[order.customer_id] = [];
    }
    ordersByCustomer[order.customer_id].push(order);
  });

  // Calculate order count and total spent per customer
  const customersWithStats = customers.map((customer: any) => {
    const customerOrders = ordersByCustomer[customer.id] || [];
    const orderCount = customerOrders.length;
    const totalSpent = customerOrders.reduce(
      (sum: number, order: any) => sum + (order.total_amount || 0),
      0,
    );
    return {
      ...customer,
      orderCount,
      totalSpent,
    };
  });

  const totalCount = typeof count === "number" ? count : customers.length;

  return NextResponse.json({ customers: customersWithStats, totalCount });
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json(
      { error: "Customer ID is required" },
      { status: 400 },
    );
  }

  const adminClient = createAdminClient();

  // Delete associated orders first (cascade should handle, but we ensure)
  const { error: ordersError } = await adminClient
    .from("orders")
    .delete()
    .eq("customer_id", id);

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  const { error } = await adminClient.from("customers").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also delete the user from auth (optional)
  try {
    const { error: authError } = await adminClient.auth.admin.deleteUser(id);
    if (authError && authError.message !== "User not found") {
      console.warn("Auth user deletion failed:", authError.message);
    }
  } catch (err: any) {
    console.warn("Could not delete auth user:", err.message);
  }

  return NextResponse.json({ success: true });
}
