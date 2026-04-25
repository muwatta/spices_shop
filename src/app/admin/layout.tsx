import { createClient } from "@/lib/supabase/server";
import { getAdminEmail } from "@/lib/admin";
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

  const adminEmail = await getAdminEmail();
  const userEmail = user?.email?.toLowerCase() ?? "";
  const isAdmin = userEmail !== "" && userEmail === adminEmail;

  if (!isAdmin) {
    redirect("/admin-login?unauthorized=1");
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">{children}</main>

      <style>{`
        .admin-shell {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #F3EFE9;
        }

        /* Mobile: sidebar is a drawer, main takes full width */
        .admin-main {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
          padding: 1.25rem 1rem 2rem;
        }

        /* MD+: sidebar is permanent, sits beside main */
        @media (min-width: 768px) {
          .admin-shell {
            flex-direction: row;
          }

          .admin-main {
            padding: 1.75rem 1.5rem 2rem;
          }
        }
      `}</style>
    </div>
  );
}
