import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    await supabase.from("products").select("id").limit(1);
    return Response.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch {
    return Response.json({ status: "error" }, { status: 500 });
  }
}
