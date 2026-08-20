import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, reviewer_name, rating, comment, created_at")
    .eq("product_id", id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ reviews: [], error: error.message }, { status: 500 });

  const reviews = data ?? [];
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return NextResponse.json({ reviews, average: Number(average.toFixed(1)), count: reviews.length });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Sign in to leave a review." }, { status: 401 });

  const body = await request.json();
  const rating = Number(body.rating);
  const comment = String(body.comment ?? "").trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Choose a rating from 1 to 5." }, { status: 400 });
  }
  if (comment.length < 10 || comment.length > 1000) {
    return NextResponse.json({ error: "Your review must be between 10 and 1000 characters." }, { status: 400 });
  }

  const reviewerName = String(user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer").trim();
  const { data, error } = await supabase
    .from("product_reviews")
    .upsert(
      { product_id: id, customer_id: user.id, reviewer_name: reviewerName, rating, comment },
      { onConflict: "product_id,customer_id" },
    )
    .select("id, reviewer_name, rating, comment, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ review: data }, { status: 201 });
}