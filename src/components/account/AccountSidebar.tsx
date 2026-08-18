"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Shield, LayoutDashboard, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/security", label: "Security", icon: Shield },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <>
      <nav className="account-sidebar" aria-label="Account navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`account-sidebar__link ${
                isActive ? "account-sidebar__link--active" : ""
              }`}
            >
              <span className="account-sidebar__icon">
                <item.icon size={18} />
              </span>
              <span className="account-sidebar__label">{item.label}</span>
            </Link>
          );
        })}

        <div className="account-sidebar__divider" />

        <Link href="/" className="account-sidebar__link">
          <span className="account-sidebar__icon">
            <LogOut size={18} />
          </span>
          <span className="account-sidebar__label">Back to Shop</span>
        </Link>
      </nav>
    </>
  );
}
