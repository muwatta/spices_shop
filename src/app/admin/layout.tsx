export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import "./admin.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  let user = null;

  try {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    user = currentUser;
  } catch {
    user = null;
  }

  const userEmail = user?.email?.toLowerCase() ?? "";
  const isAdminUser = userEmail !== "" && (await isAdmin(userEmail));

  if (!isAdminUser) {
    redirect("/admin-login?unauthorized=1");
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">{children}</main>
    </div>
  );
}
