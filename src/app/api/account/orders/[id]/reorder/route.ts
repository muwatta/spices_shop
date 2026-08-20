import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Context { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: Context) {
  const { id } = await params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to reorder." }, { status: 401 });

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, order_items(product_id, quantity)")
    .eq("id", id)
    .eq("customer_id", user.id)
    .single();
  if (orderError || !order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const productIds = (order.order_items ?? []).map((item: { product_id: string }) => item.product_id).filter(Boolean);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, image_url, images, stock, description, created_at, category, low_stock_threshold")
    .in("id", productIds);
  if (productsError) return NextResponse.json({ error: productsError.message }, { status: 500 });

  const productMap = new Map((products ?? []).map((product) => [product.id, product]));
  const items = (order.order_items ?? []).map((item: { product_id: string; quantity: number }) => {
    const product = productMap.get(item.product_id);
    const available = !!product && (product.stock === null || product.stock > 0);
    return {
      product,
      quantity: available ? Math.min(item.quantity, product.stock ?? item.quantity) : 0,
      available,
    };
  });

  return NextResponse.json({ items, unavailable: items.filter((item) => !item.available).map((item) => item.product?.name ?? "Product") });
}
