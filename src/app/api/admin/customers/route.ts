import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const adminClient = createAdminClient();
  const supabase = createClient();

  // Fetch all customers with their order aggregates
  const { data: customers, error } = await adminClient
    .from("customers")
    .select(
      `
      id,
      full_name,
      email,
      phone,
      address,
      city,
      state,
      postal_code,
      created_at,
      is_admin,
      orders ( total_amount )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate order count and total spent per customer
  const customersWithStats = customers.map((customer: any) => {
    const orders = customer.orders || [];
    const orderCount = orders.length;
    const totalSpent = orders.reduce(
      (sum: number, order: any) => sum + (order.total_amount || 0),
      0,
    );
    return {
      ...customer,
      orderCount,
      totalSpent,
    };
  });

  return NextResponse.json(customersWithStats);
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
  // Requires service role key in supabase admin client
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
