"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import ServiceWorkerRegistration from "@/components/layout/ServiceWorkerRegistration";

const MiniCartDrawer = dynamic(() => import("@/components/ui/MiniCartDrawer"), { ssr: false });
const BottomNav = dynamic(() => import("@/components/layout/BottomNav"), { ssr: false });
const ToastContainer = dynamic(() => import("@/components/ui/Toast"), { ssr: false });
const ShoppingAssistant = dynamic(() => import("@/components/layout/ShoppingAssistant"), { ssr: false });

export default function ClientWidgets() {
  const pathname = usePathname();
  const isBackOffice = pathname.startsWith("/admin") || pathname.startsWith("/account");
  const showBottomNav = !isBackOffice && !pathname.startsWith("/checkout");
  const showShoppingAssistant = !isBackOffice && !pathname.startsWith("/checkout") && !pathname.startsWith("/cart");

  return (
    <>
      <ServiceWorkerRegistration />
      <MiniCartDrawer />
      {showBottomNav && <BottomNav />}
      <ToastContainer />
      {showShoppingAssistant && <ShoppingAssistant />}
    </>
  );
}
