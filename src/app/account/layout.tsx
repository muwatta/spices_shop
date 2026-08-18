export const dynamic = "force-dynamic";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AccountSidebar from "@/components/account/AccountSidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
      <main className="account-page">
        <div className="container account-page__inner">
          <AccountSidebar />
          <section className="account-page__content">{children}</section>
        </div>
      </main>
      <Footer />
    </>
  );
}
