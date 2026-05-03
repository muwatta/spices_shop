import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/admin";

async function parseForm(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  const formData = await request.formData();
  const payload: Record<string, any> = {
    id: formData.get("id") as string | null,
    name: formData.get("name") as string | null,
    description: formData.get("description") as string | null,
    price: formData.get("price") as string | null,
    stock: formData.get("stock") as string | null,
    image: formData.get("image") as File | null,
  };

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

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("products")
    .select("id, name, price")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
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

  const payload: Record<string, any> = {
    name,
    description: body.description ? String(body.description).trim() : null,
    price,
    stock:
      body.stock !== null && String(body.stock).trim() !== ""
        ? parseInt(String(body.stock), 10)
        : null,
  };

  if (image_url) payload.image_url = image_url;

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

  const payload: Record<string, any> = {
    name,
    description: body.description ? String(body.description).trim() : null,
    price,
    stock:
      body.stock !== null && String(body.stock).trim() !== ""
        ? parseInt(String(body.stock), 10)
        : null,
  };

  if (image_url !== undefined) payload.image_url = image_url;

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
