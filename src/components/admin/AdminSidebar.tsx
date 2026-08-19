"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Leaf,
  BookOpen,
  BarChart3,
  Users,
  FileText,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/products", label: "Products", icon: Leaf },
  { href: "/admin/do-you-know", label: "Do You Know", icon: BookOpen },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/manual-order", label: "Manual Order", icon: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="admin-topbar">
        <button
          className="admin-topbar__hamburger"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
        >
          <Menu size={22} />
        </button>

        <span className="admin-topbar__title">KMA Admin</span>

        <Link href="/shop" className="admin-topbar__shop">
          View Shop
        </Link>
      </header>

      {open && <div className="admin-overlay" onClick={() => setOpen(false)} />}

      <aside className={`admin-sidebar ${open ? "admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar__header">
          <Link href="/admin" className="admin-sidebar__brand">
            <Image src="/images/logo.jpg" alt="KMA" width={28} height={28} style={{ borderRadius: "var(--radius-md)" }} />
            <span>KMA Admin</span>
          </Link>
          <button
            className="admin-sidebar__close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`}
              >
                <span className="admin-sidebar__icon">
                  <item.icon size={18} />
                </span>
                <span className="admin-sidebar__label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <Link href="/shop" className="admin-sidebar__back">
            <ExternalLink size={14} />
            View Shop
          </Link>
        </div>
      </aside>
    </>
  );
}
