import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

async function parseForm(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return request.json();
  }

  const formData = await request.formData();
  return {
    id: formData.get("id") as string | null,
    name: formData.get("name") as string | null,
    subtitle: formData.get("subtitle") as string | null,
    benefits: formData.get("benefits") as string | null,
    recommendation: formData.get("recommendation") as string | null,
    image: formData.get("image") as File | null,
  };
}

async function uploadImage(
  adminClient: ReturnType<typeof createAdminClient>,
  file: File,
) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { data: uploadData, error: uploadError } = await adminClient.storage
    .from("do-you-know-images")
    .upload(fileName, buffer, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: urlData } = adminClient.storage
    .from("do-you-know-images")
    .getPublicUrl(uploadData.path);

  return urlData.publicUrl;
}

export async function POST(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const adminClient = createAdminClient();
  const body = await parseForm(request);
  const name = String(body.name || "").trim();
  const recommendation = String(body.recommendation || "").trim();

  if (!name || !recommendation) {
    return NextResponse.json(
      { error: "Name and recommendation are required." },
      { status: 400 },
    );
  }

  let image_url: string | null = null;
  if (body.image && body.image instanceof File && body.image.size > 0) {
    try {
      image_url = await uploadImage(adminClient, body.image);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  const payload: Record<string, any> = {
    name,
    subtitle: body.subtitle ? String(body.subtitle).trim() : null,
    benefits: body.benefits ? String(body.benefits).trim() : null,
    recommendation,
  };
  if (image_url) payload.image_url = image_url;

  const { error } = await adminClient.from("do_you_know_items").insert(payload);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const adminClient = createAdminClient();
  const body = await parseForm(request);
  const id = String(body.id || "").trim();
  const name = String(body.name || "").trim();
  const recommendation = String(body.recommendation || "").trim();

  if (!id || !name || !recommendation) {
    return NextResponse.json(
      { error: "ID, name and recommendation are required." },
      { status: 400 },
    );
  }

  let image_url: string | null | undefined = undefined;
  if (body.image && body.image instanceof File && body.image.size > 0) {
    try {
      image_url = await uploadImage(adminClient, body.image);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  const payload: Record<string, any> = {
    name,
    subtitle: body.subtitle ? String(body.subtitle).trim() : null,
    benefits: body.benefits ? String(body.benefits).trim() : null,
    recommendation,
  };
  if (image_url !== undefined) payload.image_url = image_url;

  const { error } = await adminClient
    .from("do_you_know_items")
    .update(payload)
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const adminClient = createAdminClient();
  const body = await request.json();
  const id = String(body.id || "").trim();
  if (!id) {
    return NextResponse.json({ error: "ID is required." }, { status: 400 });
  }

  const { error } = await adminClient
    .from("do_you_know_items")
    .delete()
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
