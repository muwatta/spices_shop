import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin";

const PAGE_SIZE = 25;

async function parseForm(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  const formData = await request.formData();
  const payload: Record<string, any> = {};
  for (const [key, value] of formData.entries()) payload[key] = value;

  return payload;
}

async function uploadImage(
  adminClient: ReturnType<typeof createAdminClient>,
  file: File,
) {
  const ext = String(file.name).split(".").pop() ?? "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { data: uploadData, error: uploadError } = await adminClient.storage
    .from("product-images")
    .upload(fileName, buffer, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: urlData } = adminClient.storage
    .from("product-images")
    .getPublicUrl(uploadData.path);

  return urlData.publicUrl;
}

export async function GET(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const status = searchParams.get("status") || "";

  const adminClient = createAdminClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = adminClient
    .from("products")
    .select("id, name, price, image_url, images, stock, category, status, low_stock_threshold, created_at, description", { count: "exact" });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }
  if (category) {
    query = query.eq("category", category);
  }
  if (status) {
    query = query.eq("status", status);
  }

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    products: data,
    total: count,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count || 0) / PAGE_SIZE),
  });
}

export async function POST(request: Request) {
  const authError = await requireSuperAdmin(request);
  if (authError) return authError;

  const adminClient = createAdminClient();
  const body = await parseForm(request);
  const name = String(body.name || "").trim();
  const price = parseInt(String(body.price || "0"), 10);

  if (!name || !price) {
    return NextResponse.json(
      { error: "Name and price are required." },
      { status: 400 },
    );
  }

  let image_url: string | null = null;
  if (body.image && body.image instanceof File && body.image.size > 0) {
    image_url = await uploadImage(adminClient, body.image);
  }

  // Handle additional gallery images (images_0, images_1, ...)
  const additionalImages: string[] = [];
  for (let i = 0; i < 10; i++) {
    const file = body[`images_${i}`];
    if (file && file instanceof File && file.size > 0) {
      const url = await uploadImage(adminClient, file);
      additionalImages.push(url);
    }
  }

  const payload: Record<string, any> = {
    name,
    description: body.description ? String(body.description).trim() : null,
    price,
    stock:
      body.stock !== null && String(body.stock).trim() !== ""
        ? parseInt(String(body.stock), 10)
        : null,
    category:
      body.category !== null && String(body.category).trim() !== ""
        ? String(body.category).trim()
        : null,
    status: body.status || "active",
    low_stock_threshold:
      body.low_stock_threshold !== null && String(body.low_stock_threshold).trim() !== ""
        ? parseInt(String(body.low_stock_threshold), 10)
        : 5,
  };

  if (image_url) payload.image_url = image_url;
  if (additionalImages.length > 0) payload.images = additionalImages;

  const { error } = await adminClient.from("products").insert(payload);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const authError = await requireSuperAdmin(request);
  if (authError) return authError;

  const adminClient = createAdminClient();
  const body = await parseForm(request);
  const id = String(body.id || "").trim();
  const name = String(body.name || "").trim();
  const price = parseInt(String(body.price || "0"), 10);

  if (!id || !name || !price) {
    return NextResponse.json(
      { error: "ID, name and price are required." },
      { status: 400 },
    );
  }

  let image_url: string | null | undefined = undefined;
  if (body.image && body.image instanceof File && body.image.size > 0) {
    image_url = await uploadImage(adminClient, body.image);
  }

  // Handle additional gallery images
  const additionalImages: string[] = [];
  for (let i = 0; i < 10; i++) {
    const file = body[`images_${i}`];
    if (file && file instanceof File && file.size > 0) {
      const url = await uploadImage(adminClient, file);
      additionalImages.push(url);
    }
  }

  const payload: Record<string, any> = {
    name,
    description: body.description ? String(body.description).trim() : null,
    price,
    stock:
      body.stock !== null && String(body.stock).trim() !== ""
        ? parseInt(String(body.stock), 10)
        : null,
    category:
      body.category !== null && String(body.category).trim() !== ""
        ? String(body.category).trim()
        : null,
  };

  if (body.status) payload.status = String(body.status).trim();
  if (body.low_stock_threshold !== null && String(body.low_stock_threshold).trim() !== "") {
    payload.low_stock_threshold = parseInt(String(body.low_stock_threshold), 10);
  }
  if (image_url !== undefined) payload.image_url = image_url;

  // Handle images replacement (sent as JSON string of URLs to keep)
  if (body.images_json) {
    try {
      payload.images = JSON.parse(String(body.images_json));
    } catch {}
  }
  if (additionalImages.length > 0) {
    // Merge new uploads with existing kept images
    const existing = payload.images ?? [];
    payload.images = [...existing, ...additionalImages];
  }

  const { error } = await adminClient
    .from("products")
    .update(payload)
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const authError = await requireSuperAdmin(request);
  if (authError) return authError;

  const adminClient = createAdminClient();
  const body = await request.json();
  const id = String(body.id || "").trim();
  if (!id) {
    return NextResponse.json({ error: "ID is required." }, { status: 400 });
  }

  const { error } = await adminClient.from("products").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
