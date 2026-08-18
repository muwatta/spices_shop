"use client";

import dynamic from "next/dynamic";

const MiniCartDrawer = dynamic(() => import("@/components/ui/MiniCartDrawer"), { ssr: false });
const BottomNav = dynamic(() => import("@/components/layout/BottomNav"), { ssr: false });

export default function ClientWidgets() {
  return (
    <>
      <MiniCartDrawer />
      <BottomNav />
    </>
  );
}
