import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const adminEmails = ["kmafoods22@gmail.com", "abdullahmusliudeen@gmail.com"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
  } = await supabase.auth.getUser();

  const isAdminLoginPath = request.nextUrl.pathname === "/admin-login";

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin") && !isAdminLoginPath) {
    if (!user || !adminEmails.includes(user.email?.toLowerCase() ?? "")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin-login";
      url.searchParams.set("unauthorized", "1");
      console.log("Redirecting to admin-login, user email:", user?.email);
      return NextResponse.redirect(url);
    }
  }

  // Protect account routes
  if (request.nextUrl.pathname.startsWith("/account")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
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
