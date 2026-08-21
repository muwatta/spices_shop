import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const startedAt = Date.now();
  try {
    const supabase = createClient();
    const { error } = await supabase.from("products").select("id").limit(1);
    if (error) throw error;
    return Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
    });
  } catch {
    return Response.json(
      { status: "error", timestamp: new Date().toISOString() },
      { status: 503 },
    );
  }
}
