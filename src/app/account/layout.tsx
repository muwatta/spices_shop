export const dynamic = "force-dynamic";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AccountNav from "@/components/account/AccountNav";

const tabs = [
  { href: "/account/overview", label: "Overview", icon: "📊" },
  { href: "/account/orders", label: "Orders", icon: "🛒" },
  { href: "/account/profile", label: "Profile", icon: "👤" },
  { href: "/account/security", label: "Security", icon: "🔒" },
];

export default async function AccountLayout({
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

  if (!user) redirect("/login?redirect=/account");

  return (
    <>
      <Navbar />
      <main
        style={{
          background: "var(--clr-cream)",
          minHeight: "calc(100vh - 120px)",
        }}
      >
        <div className="container" style={{ padding: "2rem var(--space-md)" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "1.5rem",
            }}
          >
            <AccountNav tabs={tabs} />
            <section>{children}</section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
