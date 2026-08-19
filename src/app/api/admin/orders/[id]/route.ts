import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

const STATUS_VALUES = [
  "pending",
  "confirmed",
  "processing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

const PAYMENT_STATUS_VALUES = [
  "pending",
  "verified",
  "paid",
  "failed",
  "refunded",
] as const;

type Status = (typeof STATUS_VALUES)[number];
type PaymentStatus = (typeof PAYMENT_STATUS_VALUES)[number];

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
    .select("*, customers(*), order_items(*, products(name, price, image_url))")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: activity } = await adminClient
    .from("order_activity")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ data, activity: activity ?? [] });
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
  const paymentStatus = typeof body.payment_status === "string" ? body.payment_status : "";
  const notes = typeof body.notes === "string" ? body.notes : "";

  if (status && !STATUS_VALUES.includes(status as Status)) {
    return NextResponse.json(
      { error: "Invalid status value." },
      { status: 400 },
    );
  }

  if (paymentStatus && !PAYMENT_STATUS_VALUES.includes(paymentStatus as PaymentStatus)) {
    return NextResponse.json(
      { error: "Invalid payment_status value." },
      { status: 400 },
    );
  }

  const adminClient = createAdminClient();

  // Get current order for activity log
  const { data: current } = await adminClient
    .from("orders")
    .select("status, payment_status")
    .eq("id", id)
    .single();

  const updates: Record<string, string> = {};
  if (status) updates.status = status;
  if (paymentStatus) updates.payment_status = paymentStatus;

  if (Object.keys(updates).length > 0) {
    const { error } = await adminClient
      .from("orders")
      .update(updates)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    const activities: Array<{
      order_id: string;
      action: string;
      old_value: string;
      new_value: string;
      notes: string;
    }> = [];

    if (status && current?.status !== status) {
      activities.push({
        order_id: id,
        action: "status_change",
        old_value: current?.status ?? "",
        new_value: status,
        notes,
      });
    }
    if (paymentStatus && current?.payment_status !== paymentStatus) {
      activities.push({
        order_id: id,
        action: "payment_status_change",
        old_value: current?.payment_status ?? "",
        new_value: paymentStatus,
        notes,
      });
    }

    if (activities.length > 0) {
      await adminClient.from("order_activity").insert(activities);
    }
  }

  return NextResponse.json({ success: true });
}
