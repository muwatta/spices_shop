import { createBrowserClient } from "@supabase/ssr";

function isRefreshTokenError(error: any): boolean {
  const code = error?.code?.toString?.() || "";
  const message = error?.message?.toString?.() || "";
  return (
    code === "refresh_token_not_found" ||
    code === "invalid_refresh_token" ||
    message.includes("Refresh Token")
  );
}

export function createClient() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
  (supabase.auth as any).getUser = async (...args: any[]) => {
    try {
      const result = await originalGetUser(...args);
      if (result.error && isRefreshTokenError(result.error)) {
        await supabase.auth.signOut({ scope: "local" });
        return { data: { user: null }, error: null };
      }
      return result;
    } catch (error: any) {
      if (isRefreshTokenError(error)) {
        await supabase.auth.signOut({ scope: "local" });
        return { data: { user: null }, error: null };
      }
      throw error;
    }
  };

  return supabase;
}
