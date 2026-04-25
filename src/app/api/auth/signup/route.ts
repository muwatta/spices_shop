import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
const CALLBACK_PATH = "/auth/callback";

function normalizeEmail(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password: unknown) {
  return typeof password === "string" && password.length >= 6;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const full_name =
    typeof body.full_name === "string" ? body.full_name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 },
    );
  }

  if (ADMIN_EMAIL && email === ADMIN_EMAIL) {
    return NextResponse.json(
      {
        error:
          "This email is reserved for the admin dashboard. Please use the admin login page instead.",
      },
      { status: 403 },
    );
  }

  if (!isValidPassword(password)) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  if (!full_name) {
    return NextResponse.json(
      { error: "Please enter your full name." },
      { status: 400 },
    );
  }

  const origin = new URL(request.url).origin;
  const emailRedirectTo = `${origin}${CALLBACK_PATH}`;
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data.user?.id) {
    await supabase.from("customers").upsert({
      id: data.user.id,
      full_name,
      phone,
    });
  }

  return NextResponse.json(
    {
      success: true,
      message:
        "Account created. Check your email for the confirmation link to finish sign-in.",
    },
    { status: 201 },
  );
}
