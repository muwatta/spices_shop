import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function isRefreshTokenError(error: any): boolean {
  const code = error?.code?.toString?.() || "";
  const message = error?.message?.toString?.() || "";
  return (
    code === "refresh_token_not_found" ||
    code === "invalid_refresh_token" ||
    message.includes("Refresh Token")
  );
}

function wrapGetUser(supabase: any) {
  const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
  (supabase.auth as any).getUser = async (...args: any[]) => {
    try {
      return await originalGetUser(...args);
    } catch (error: any) {
      if (isRefreshTokenError(error)) {
        return { data: { user: null }, error: null };
      }
      throw error;
    }
  };
}

export function createClient() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookies();
          return cookieStore.getAll();
        },
        async setAll(
          cookiesToSet: { name: string; value: string; options?: any }[],
        ) {
          try {
            const cookieStore = await cookies();
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );

  wrapGetUser(supabase);
  return supabase;
}

export function createAdminClient() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        async getAll() {
          return [];
        },
        async setAll() {},
      },
    },
  );

  wrapGetUser(supabase);
  return supabase;
}
