"use client";

import dynamic from "next/dynamic";
import ServiceWorkerRegistration from "@/components/layout/ServiceWorkerRegistration";

const MiniCartDrawer = dynamic(() => import("@/components/ui/MiniCartDrawer"), { ssr: false });
const BottomNav = dynamic(() => import("@/components/layout/BottomNav"), { ssr: false });
const ToastContainer = dynamic(() => import("@/components/ui/Toast"), { ssr: false });
const ShoppingAssistant = dynamic(() => import("@/components/layout/ShoppingAssistant"), { ssr: false });

export default function ClientWidgets() {
  return (
    <>
      <ServiceWorkerRegistration />
      <MiniCartDrawer />
      <BottomNav />
      <ToastContainer />
      <ShoppingAssistant />
    </>
  );
}
