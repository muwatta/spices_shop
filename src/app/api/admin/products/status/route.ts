import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const adminClient = createAdminClient();
  const body = await request.json();
  const id = String(body.id || "").trim();
  const status = String(body.status || "").trim();

  if (!id || !status) {
    return NextResponse.json(
      { error: "ID and status are required." },
      { status: 400 },
    );
  }

  const validStatuses = ["active", "out_of_stock", "draft", "archived"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
      { status: 400 },
    );
  }

  const { error } = await adminClient
    .from("products")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
