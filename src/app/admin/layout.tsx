import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    redirect("/admin-login");
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">{children}</main>

      <style>{`
        .admin-shell {
          display: flex;
          min-height: 100vh;
          background: #F3EFE9;
        }

        /* Mobile: sidebar is a drawer, main takes full width */
        .admin-main {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
        }

        /* MD+: sidebar is permanent, sits beside main */
        @media (min-width: 768px) {
          .admin-shell { flex-direction: row; }
        }
      `}</style>
    </div>
  );
}
