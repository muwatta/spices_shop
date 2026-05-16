import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const adminEmails = ["kmafoods22@gmail.com", "abdullahmusliudeen@gmail.com"];

export async function proxy(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return supabaseResponse;
  }

  const path = request.nextUrl.pathname;

  const isAuthRoute =
    path.startsWith("/admin-login") ||
    path.startsWith("/login") ||
    path.startsWith("/auth");

  if (isAuthRoute) {
    return supabaseResponse;
  }

  const isAdminRoute = path.startsWith("/admin");

  if (isAdminRoute) {
    const email = user?.email?.toLowerCase();

    if (!user || !email || !adminEmails.includes(email)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin-login";
      url.searchParams.set("unauthorized", "1");

      return NextResponse.redirect(url);
    }
  }

  if (path.startsWith("/account")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", path);

      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
